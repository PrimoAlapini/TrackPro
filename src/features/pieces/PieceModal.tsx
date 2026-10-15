import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Database } from '@/types/database'

type Piece = Database['public']['Tables']['pieces']['Row']

const pieceSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
})

type PieceFormData = z.infer<typeof pieceSchema>

interface PieceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PieceFormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<Piece>
  title?: string
}

export function PieceModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title = 'Ajouter une pièce',
}: PieceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PieceFormData>({
    resolver: zodResolver(pieceSchema),
    defaultValues: {
      nom: initialData?.nom || '',
      description: initialData?.description || '',
    },
  })

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        nom: initialData.nom || '',
        description: initialData.description || '',
      })
    }
  }, [isOpen, initialData, reset])

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
            Nom de la pièce *
          </label>
          <Input
            placeholder="Ex: Pièce d'identité"
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
            className="w-full h-20 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register('description')}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
