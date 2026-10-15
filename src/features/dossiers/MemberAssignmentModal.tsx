import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Plus } from 'lucide-react'
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

  const assignedMemberIds = new Set(assignedMembers.map((dm) => dm.membre_id))

  const handleCreateAndAssign = async () => {
    if (newMemberName.trim() && onCreateAndAssign) {
      await onCreateAndAssign(newMemberName)
      setNewMemberName('')
      setShowNewForm(false)
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
              return (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--input)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={async (e) => {
                      if (e.target.checked) {
                        await onAssign(member.id)
                      } else {
                        await onRemove(member.id)
                      }
                    }}
                    disabled={isLoading}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Avatar
                    initials={getInitials(member.nom)}
                    color={member.couleur_avatar as any}
                    size="sm"
                  />
                  <span className="text-sm text-[var(--foreground)]">{member.nom}</span>
                </label>
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
