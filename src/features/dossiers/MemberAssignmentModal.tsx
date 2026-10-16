import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { useConfirm } from '@/contexts/DialogContext'
import { Plus, Check, X } from 'lucide-react'
import type { Database } from '@/types/database'

type Membre = Database['public']['Tables']['membres']['Row']
type DossierMembre = Database['public']['Tables']['dossier_membres']['Row']

interface MemberAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  members: Membre[]
  assignedMembers: DossierMembre[]
  onAssign: (memberId: string) => Promise<void>
  onRemove: (memberId: string) => Promise<void>
  onCreateAndAssign?: (name: string) => Promise<void>
  isLoading?: boolean
}

export function MemberAssignmentModal({
  isOpen,
  onClose,
  members,
  assignedMembers,
  onAssign,
  onRemove,
  onCreateAndAssign,
  isLoading = false,
}: MemberAssignmentModalProps) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)
  const confirm = useConfirm()

  const assignedMemberIds = new Set(assignedMembers.map((dm) => dm.membre_id))

  const handleCreateAndAssign = async () => {
    if (newMemberName.trim() && onCreateAndAssign) {
      await onCreateAndAssign(newMemberName)
      setNewMemberName('')
      setShowNewForm(false)
    }
  }

  const handleToggleMember = async (member: Membre, isCurrentlyAssigned: boolean) => {
    setUpdatingMemberId(member.id)
    try {
      if (isCurrentlyAssigned) {
        // Confirm removal
        const confirmed = await confirm({
          title: 'Retirer le membre',
          message: `Êtes-vous sûr de vouloir retirer ${member.nom} de ce dossier ? Les pièces déjà assignées resteront en place.`,
          confirmText: 'Retirer',
          cancelText: 'Annuler',
          variant: 'danger',
        })
        if (confirmed) {
          await onRemove(member.id)
        }
      } else {
        // Confirm assignment
        const confirmed = await confirm({
          title: 'Assigner le membre',
          message: `Assigner ${member.nom} à ce dossier ? Les pièces lui seront automatiquement assignées en "Non déposée".`,
          confirmText: 'Assigner',
          cancelText: 'Annuler',
          variant: 'primary',
        })
        if (confirmed) {
          await onAssign(member.id)
        }
      }
    } finally {
      setUpdatingMemberId(null)
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
    <Modal isOpen={isOpen} onClose={onClose} title="Affecter des membres" size="md">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* New member form */}
        {showNewForm ? (
          <div className="flex gap-2 p-3 border border-[var(--border)] rounded-lg">
            <Input
              placeholder="Nouveau membre..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleCreateAndAssign}
              isLoading={isLoading}
              disabled={!newMemberName.trim()}
            >
              Créer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowNewForm(false)
                setNewMemberName('')
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            Créer un nouveau membre
          </button>
        )}

        {/* Member list */}
        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-4">
              Aucun membre dans l'annuaire
            </p>
          ) : (
            members.map((member) => {
              const isAssigned = assignedMemberIds.has(member.id)
              const isUpdating = updatingMemberId === member.id
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                    isAssigned
                      ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5'
                      : 'border-[var(--border)] hover:bg-[var(--input)]'
                  }`}
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar
                      initials={getInitials(member.nom)}
                      color={member.couleur_avatar as any}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{member.nom}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {isAssigned ? 'Assigné à ce dossier' : 'Non assigné'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleMember(member, isAssigned)}
                    disabled={isLoading || isUpdating}
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      isAssigned
                        ? 'bg-[var(--success)] text-white hover:bg-opacity-80'
                        : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'
                    } disabled:opacity-50`}
                    aria-label={isAssigned ? 'Retirer' : 'Assigner'}
                  >
                    {isAssigned ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
