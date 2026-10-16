import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'

const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'accent', 'muted'] as const

const memberSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  couleur_avatar: z.enum(colors),
})

type MemberFormData = z.infer<typeof memberSchema>

interface MemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemberFormData | MemberFormData[]) => Promise<void>
  isLoading?: boolean
  initialData?: MemberFormData
  title?: string
  isEditing?: boolean
}

export function MemberForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title = 'Ajouter un membre',
  isEditing = false,
}: MemberFormProps) {
  const [isMultiAdd, setIsMultiAdd] = useState(false)
  const [multiNames, setMultiNames] = useState('')
  const [multiColor, setMultiColor] = useState<typeof colors[number]>('primary')

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

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData)
        setIsMultiAdd(false)
      } else {
        reset({ couleur_avatar: 'primary' })
        setIsMultiAdd(false)
      }
    }
  }, [isOpen, initialData, reset])

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

  const handleMultiAdd = async () => {
    const names = multiNames
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)

    if (names.length === 0) {
      return
    }

    try {
      const membersToAdd = names.map((nom) => ({
        nom,
        couleur_avatar: multiColor,
      }))
      await onSubmit(membersToAdd)
      setMultiNames('')
      setIsMultiAdd(false)
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
      {!isEditing && !isMultiAdd && (
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsMultiAdd(true)}
            size="sm"
          >
            Ajouter plusieurs
          </Button>
        </div>
      )}

      {isMultiAdd ? (
        <form onSubmit={(e) => { e.preventDefault(); handleMultiAdd() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Noms (un par ligne) *
            </label>
            <textarea
              value={multiNames}
              onChange={(e) => setMultiNames(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] font-mono text-sm"
              placeholder="Alice Dupont&#10;Bob Martin&#10;Charlie Dupuis"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Couleur de l'avatar (pour tous) *
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setMultiColor(color)}
                  className={`p-2 rounded-lg transition-all ${
                    multiColor === color ? 'ring-2 ring-[var(--primary)]' : ''
                  }`}
                >
                  <Avatar initials="AB" color={color} size="md" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsMultiAdd(false)}
              disabled={isLoading}
            >
              Retour
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Ajouter {multiNames.split('\n').filter((n) => n.trim()).length} membre{multiNames.split('\n').filter((n) => n.trim()).length !== 1 ? 's' : ''}
            </Button>
          </div>
        </form>
      ) : (
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
              <div className="flex gap-2 flex-wrap">
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
              {isEditing ? 'Modifier' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
