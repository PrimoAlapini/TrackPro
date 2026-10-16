import { useState } from 'react'
import { X, ChevronDown, FileText } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAlert } from '@/contexts/DialogContext'
import { pieceBarColor } from '@/lib/stats'
import type { Database } from '@/types/database'

type Membre = Database['public']['Tables']['membres']['Row']
type Dossier = Database['public']['Tables']['dossiers']['Row']
type Piece = Database['public']['Tables']['pieces']['Row']
type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']

interface MemberDetailModalProps {
  isOpen: boolean
  onClose: () => void
  member: Membre | null
  dossiers: Dossier[]
  pieces: Piece[]
  suiviList: SuiviPiece[]
  onStatusChange: (followId: string, newStatus: SuiviPiece['statut']) => Promise<void>
  isUpdating?: boolean
}

const STATUS_OPTIONS = [
  { id: 'deposee' as const, label: 'Déposée' },
  { id: 'en_cours' as const, label: 'En cours' },
  { id: 'non_deposee' as const, label: 'Non déposée' },
]

export function MemberDetailModal({
  isOpen,
  onClose,
  member,
  dossiers,
  pieces,
  suiviList,
  onStatusChange,
  isUpdating = false,
}: MemberDetailModalProps) {
  const alert = useAlert()
  const [openStatusId, setOpenStatusId] = useState<string | null>(null)

  if (!member) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Dossiers affectés à ce membre
  const memberDossiers = dossiers.filter((d) => {
    const hasSuivi = suiviList.some((s) => s.dossier_id === d.id && s.membre_id === member.id)
    return hasSuivi
  })

  // Calcul global
  const memberSuiviAll = suiviList.filter((s) => s.membre_id === member.id)
  const deposeeCount = memberSuiviAll.filter((s) => s.statut === 'deposee').length
  const globalPct = memberSuiviAll.length > 0 ? Math.round((deposeeCount / memberSuiviAll.length) * 100) : 0

  const handleStatusChange = async (followId: string, newStatus: SuiviPiece['statut']) => {
    try {
      await onStatusChange(followId, newStatus)
      setOpenStatusId(null)
    } catch (error) {
      await alert({
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de mettre à jour le statut',
        variant: 'error',
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-[var(--border)]">
          <Avatar
            initials={getInitials(member.nom)}
            color={member.couleur_avatar as any}
            size="lg"
            className="w-14 h-14"
          />
          <div className="flex-1">
            <h2 className="text-[22px] font-bold text-[var(--foreground)]">{member.nom}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              {memberDossiers.length} dossier{memberDossiers.length !== 1 ? 's' : ''} · {deposeeCount} / {memberSuiviAll.length} pièces déposées
            </p>
            <div className="mt-3 space-y-1">
              <div className="h-2 bg-[var(--track)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(globalPct)})]`}
                  style={{ width: `${globalPct}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted)]">{globalPct}% de progression</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-[var(--input)] rounded-lg transition-colors border border-[var(--border)]"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>

        {/* Dossiers */}
        {memberDossiers.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="Ce membre n'est affecté à aucun dossier"
            description="Une fois affecté à un dossier, ses pièces apparaîtront ici."
            action={null}
          />
        ) : (
          <div className="space-y-4">
            {memberDossiers.map((dossier) => {
              const dossierSuivi = suiviList.filter(
                (s) => s.dossier_id === dossier.id && s.membre_id === member.id
              )
              const dossierPieces = pieces.filter((p) => p.dossier_id === dossier.id)
              const deposee = dossierSuivi.filter((s) => s.statut === 'deposee').length
              const dossierPct = dossierPieces.length > 0 ? Math.round((deposee / dossierPieces.length) * 100) : 0

              return (
                <div
                  key={dossier.id}
                  className="bg-[var(--input)] border border-[var(--border)] rounded-[16px] p-5 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{dossier.nom}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        TRK-{dossier.id.slice(0, 3).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {deposee} / {dossierPieces.length} pièces
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-2 bg-[var(--track)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(dossierPct)})]`}
                        style={{ width: `${dossierPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-[var(--muted)]">{dossierPct}%</p>
                  </div>

                  {/* Tableau pièces */}
                  {dossierPieces.length === 0 ? (
                    <p className="text-sm text-[var(--muted)] text-center py-3">
                      Aucune pièce dans ce dossier
                    </p>
                  ) : (
                    <div className="pt-2 space-y-2 border-t border-[var(--border)]">
                      <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider grid grid-cols-12 gap-2">
                        <div className="col-span-5">Pièce</div>
                        <div className="col-span-3">Statut</div>
                        <div className="col-span-4">Déposée le</div>
                      </div>
                      {dossierPieces.map((piece) => {
                        const suivi = dossierSuivi.find((s) => s.piece_id === piece.id)
                        if (!suivi) return null

                        return (
                          <div
                            key={piece.id}
                            className="grid grid-cols-12 gap-2 items-center py-2 border-t border-[var(--border)] border-opacity-30"
                          >
                            {/* Pièce */}
                            <div className="col-span-5 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                              <span className="text-sm text-[var(--foreground)] truncate">
                                {piece.nom}
                              </span>
                            </div>

                            {/* Statut (cliquable) */}
                            <div className="col-span-3 relative">
                              <button
                                onClick={() =>
                                  setOpenStatusId(
                                    openStatusId === suivi.id ? null : suivi.id
                                  )
                                }
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--muted)] transition-colors w-full justify-between text-sm"
                                aria-haspopup="listbox"
                                disabled={isUpdating}
                              >
                                <StatusBadge status={suivi.statut} />
                                <ChevronDown className="w-3 h-3 text-[var(--muted)] flex-shrink-0" />
                              </button>

                              {/* Dropdown menu */}
                              {openStatusId === suivi.id && (
                                <>
                                  <div className="absolute top-full left-0 mt-1 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50 py-1">
                                    {STATUS_OPTIONS.map((option) => (
                                      <button
                                        key={option.id}
                                        onClick={() =>
                                          handleStatusChange(suivi.id, option.id)
                                        }
                                        disabled={isUpdating}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                                          suivi.statut === option.id
                                            ? 'bg-[var(--primary)] bg-opacity-20 text-[var(--foreground)]'
                                            : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                                        } disabled:opacity-50`}
                                      >
                                        <StatusBadge status={option.id} />
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenStatusId(null)}
                                  />
                                </>
                              )}
                            </div>

                            {/* Date de dépôt */}
                            <div className="col-span-4 text-sm text-[var(--muted)]">
                              {suivi.date_depot
                                ? new Date(suivi.date_depot).toLocaleDateString('fr-FR')
                                : '–'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-end pt-4 border-t border-[var(--border)]">
          <Button variant="secondary" onClick={onClose} disabled={isUpdating}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
