import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const pieceSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
})

type PieceFormData = z.infer<typeof pieceSchema>

interface PieceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PieceFormData) => Promise<void>
  isLoading?: boolean
  initialData?: PieceFormData
  title?: string
}

export function PieceForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title = 'Ajouter une pièce',
}: PieceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PieceFormData>({
    resolver: zodResolver(pieceSchema),
    defaultValues: initialData,
  })

  const handleFormSubmit = async (data: PieceFormData) => {
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Nom *
          </label>
          <Input
            placeholder="Ex: Passeport"
            {...register('nom')}
            disabled={isLoading}
          />
          {errors.nom && (
            <p className="text-[var(--danger)] text-sm mt-1">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Description (optionnel)
          </label>
          <textarea
            placeholder="Description de la pièce"
            className="w-full h-24 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register('description')}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
