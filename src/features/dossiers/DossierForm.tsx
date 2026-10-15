import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const dossierSchema = z
  .object({
    nom: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    date_debut: z.string().min(1, 'La date de début est requise'),
    date_limite: z.string().min(1, 'La date limite est requise'),
    responsable_collecte: z.string().optional(),
    responsable_revue: z.string().optional(),
    membres: z.array(z.string()).optional(),
  })
  .refine(
    (data) => new Date(data.date_limite) >= new Date(data.date_debut),
    {
      message: 'La date limite doit être après la date de début',
      path: ['date_limite'],
    }
  )

type DossierFormData = z.infer<typeof dossierSchema>

interface DossierFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DossierFormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<DossierFormData>
  title?: string
}

export function DossierForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title = 'Créer un dossier',
}: DossierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DossierFormData>({
    resolver: zodResolver(dossierSchema),
    defaultValues: {
      ...initialData,
      membres: initialData?.membres || [],
    },
  })

  const handleFormSubmit = async (data: DossierFormData) => {
    try {
      console.log('Form submitted with data:', data)
      await onSubmit(data)
      console.log('onSubmit succeeded')
      reset()
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Nom du dossier *
          </label>
          <Input
            placeholder="Ex: Audit 2024"
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
            placeholder="Description du dossier"
            className="w-full h-20 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register('description')}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Date de début *
            </label>
            <Input
              type="date"
              {...register('date_debut')}
              disabled={isLoading}
            />
            {errors.date_debut && (
              <p className="text-[var(--danger)] text-sm mt-1">{errors.date_debut.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Date limite *
            </label>
            <Input
              type="date"
              {...register('date_limite')}
              disabled={isLoading}
            />
            {errors.date_limite && (
              <p className="text-[var(--danger)] text-sm mt-1">{errors.date_limite.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Responsable de collecte (optionnel)
          </label>
          <Input
            placeholder="Nom du responsable"
            {...register('responsable_collecte')}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Responsable qui revoit (optionnel)
          </label>
          <Input
            placeholder="Nom du responsable"
            {...register('responsable_revue')}
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
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
