import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Clock, FileText } from 'lucide-react'
import type { Database } from '@/types/database'

type SuiviStatut = Database['public']['Tables']['suivi_pieces']['Row']['statut']

interface PieceStatusModalProps {
  isOpen: boolean
  onClose: () => void
  piece: { nom: string; description: string | null } | null
  membre: { nom: string } | null
  currentStatus: SuiviStatut
  onSubmit: (newStatus: SuiviStatut) => Promise<void>
  isLoading?: boolean
}

const STATUS_OPTIONS = [
  {
    id: 'non_deposee',
    label: 'Non déposée',
    icon: FileText,
    color: 'bg-[var(--warning)]',
    description: 'La pièce n\'a pas encore été déposée',
  },
  {
    id: 'en_cours',
    label: 'En cours',
    icon: Clock,
    color: 'bg-[var(--info)]',
    description: 'La pièce est en cours de traitement',
  },
  {
    id: 'deposee',
    label: 'Déposée',
    icon: CheckCircle2,
    color: 'bg-[var(--success)]',
    description: 'La pièce a été déposée et acceptée',
  },
] as const

export function PieceStatusModal({
  isOpen,
  onClose,
  piece,
  membre,
  currentStatus,
  onSubmit,
  isLoading = false,
}: PieceStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<SuiviStatut>(currentStatus)

  const handleConfirm = async () => {
    await onSubmit(selectedStatus)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mise à jour du statut" size="md">
      <div className="space-y-6">
        {/* Info section */}
        {piece && membre && (
          <div className="space-y-2 p-3 bg-[var(--input)] rounded-lg border border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">Pièce</p>
            <p className="font-medium text-[var(--foreground)]">{piece.nom}</p>
            {piece.description && (
              <p className="text-sm text-[var(--muted)]">{piece.description}</p>
            )}
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted)]">Membre</p>
              <p className="font-medium text-[var(--foreground)]">{membre.nom}</p>
            </div>
          </div>
        )}

        {/* Status options */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Nouveau statut
          </label>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = selectedStatus === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedStatus(option.id as SuiviStatut)}
                  disabled={isLoading}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? 'bg-[var(--primary)] bg-opacity-10 border-[var(--primary)]'
                      : 'bg-transparent border-[var(--border)] hover:border-[var(--primary)]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'text-[var(--primary)]'
                        : 'text-[var(--muted)]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{option.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
