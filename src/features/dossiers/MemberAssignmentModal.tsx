import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { useConfirm } from '@/contexts/DialogContext'
import { Plus, Check, X, Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedToAssign, setSelectedToAssign] = useState<Set<string>>(new Set())
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const confirm = useConfirm()

  const assignedMemberIds = new Set(assignedMembers.map((dm) => dm.membre_id))

  // Filtre par recherche
  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.nom.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [members, searchQuery])

  const handleCreateAndAssign = async () => {
    if (newMemberName.trim() && onCreateAndAssign) {
      await onCreateAndAssign(newMemberName)
      setNewMemberName('')
      setShowNewForm(false)
    }
  }

  const toggleMemberSelection = (memberId: string, isCurrentlyAssigned: boolean) => {
    if (isCurrentlyAssigned) {
      // Pour retirer: toggle dans selectedToRemove
      const newSet = new Set(selectedToRemove)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      setSelectedToRemove(newSet)
    } else {
      // Pour ajouter: toggle dans selectedToAssign
      const newSet = new Set(selectedToAssign)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      setSelectedToAssign(newSet)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Préparer le message de confirmation
      const toAssign = Array.from(selectedToAssign).map(id => members.find(m => m.id === id)?.nom).filter(Boolean)
      const toRemove = Array.from(selectedToRemove).map(id => members.find(m => m.id === id)?.nom).filter(Boolean)

      let confirmMessage = ''
      if (toAssign.length > 0) {
        confirmMessage += `Ajouter:\n• ${toAssign.join('\n• ')}\n\n`
      }
      if (toRemove.length > 0) {
        confirmMessage += `Retirer:\n• ${toRemove.join('\n• ')}`
      }

      const confirmed = await confirm({
        title: 'Confirmer les changements',
        message: confirmMessage || 'Aucun changement à appliquer',
        confirmText: 'Valider',
        cancelText: 'Annuler',
        variant: 'normal',
      })

      if (!confirmed) {
        setIsSaving(false)
        return
      }

      // Ajouter les membres sélectionnés
      for (const memberId of selectedToAssign) {
        await onAssign(memberId)
      }

      // Retirer les membres sélectionnés
      for (const memberId of selectedToRemove) {
        await onRemove(memberId)
      }

      // Réinitialiser la sélection
      setSelectedToAssign(new Set())
      setSelectedToRemove(new Set())
      onClose()
    } finally {
      setIsSaving(false)
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
      <div className="space-y-4">
        {/* New member form */}
        {showNewForm ? (
          <div className="flex gap-2 p-3 border border-[var(--border)] rounded-lg">
            <Input
              placeholder="Nouveau membre..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              disabled={isLoading || isSaving}
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
            disabled={isLoading || isSaving}
          >
            <Plus className="w-4 h-4" />
            Créer un nouveau membre
          </button>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)]"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Member list */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-4">
              {members.length === 0 ? 'Aucun membre dans l\'annuaire' : 'Aucun membre ne correspond à votre recherche'}
            </p>
          ) : (
            filteredMembers.map((member) => {
              const isAssigned = assignedMemberIds.has(member.id)
              const isSelectedForAssign = selectedToAssign.has(member.id)
              const isSelectedForRemove = selectedToRemove.has(member.id)
              const willBeAssigned = isSelectedForAssign || (isAssigned && !isSelectedForRemove)
              
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                    willBeAssigned
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
                        {willBeAssigned ? 'Assigné à ce dossier' : 'Non assigné'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleMemberSelection(member.id, isAssigned)}
                    disabled={isLoading || isSaving}
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      willBeAssigned
                        ? 'bg-[var(--success)] text-white hover:bg-opacity-80'
                        : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'
                    } disabled:opacity-50`}
                    aria-label={willBeAssigned ? 'Retirer' : 'Assigner'}
                  >
                    {willBeAssigned ? (
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
            disabled={isLoading || isSaving}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveChanges}
            isLoading={isSaving}
            disabled={selectedToAssign.size === 0 && selectedToRemove.size === 0}
          >
            Valider ({selectedToAssign.size + selectedToRemove.size} changement{selectedToAssign.size + selectedToRemove.size !== 1 ? 's' : ''})
          </Button>
        </div>
      </div>
    </Modal>
  )
}
