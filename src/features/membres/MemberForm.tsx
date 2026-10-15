import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'

const colors = ['primary', 'secondary', 'success', 'warning'] as const

const memberSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  couleur_avatar: z.enum(colors),
})

type MemberFormData = z.infer<typeof memberSchema>

interface MemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemberFormData) => Promise<void>
  isLoading?: boolean
  initialData?: MemberFormData
  title?: string
}

export function MemberForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title = 'Ajouter un membre',
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData || { couleur_avatar: 'primary' },
  })

  const couleur = watch('couleur_avatar')
  const nom = watch('nom')

  const handleFormSubmit = async (data: MemberFormData) => {
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Nom *
          </label>
          <Input
            placeholder="Ex: Alice Dupont"
            {...register('nom')}
            disabled={isLoading}
          />
          {errors.nom && (
            <p className="text-[var(--danger)] text-sm mt-1">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Couleur de l'avatar *
          </label>
          <div className="space-y-2">
            <div className="flex gap-3">
              {colors.map((color) => (
                <label key={color} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={color}
                    {...register('couleur_avatar')}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <Avatar
                    initials={getInitials(nom || 'AB')}
                    color={color}
                    size="md"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg bg-[var(--input)] text-center">
          <p className="text-sm text-[var(--muted)] mb-2">Aperçu</p>
          <Avatar
            initials={getInitials(nom || 'AB')}
            color={couleur}
            size="lg"
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
