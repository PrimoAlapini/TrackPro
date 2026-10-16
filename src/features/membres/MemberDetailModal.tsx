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
  isPublic?: boolean
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
  isPublic = false,
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
      size="xl" // Augmentation de la largeur du modal
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <Avatar
              initials={getInitials(member.nom)}
              color={member.couleur_avatar as any}
              size="lg"
              className="w-16 h-16 text-lg font-semibold shadow-sm"
            />
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{member.nom}</h2>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {memberDossiers.length} dossier{memberDossiers.length !== 1 ? 's' : ''} assigné{memberDossiers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-[var(--input)] rounded-xl transition-colors border border-[var(--border)] text-[var(--foreground)]"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Progress Card */}
        <div className="bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-[var(--foreground)]">Progression globale</span>
            <span className="font-semibold text-[var(--foreground)]">
              {deposeeCount} / {memberSuiviAll.length} pièces déposées ({globalPct}%)
            </span>
          </div>
          <div className="h-2.5 bg-[var(--track)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(globalPct)})]`}
              style={{ width: `${globalPct}%` }}
            />
          </div>
        </div>

        {/* Dossiers Container avec Scroll Émincé */}
        {memberDossiers.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="Ce membre n'est affecté à aucun dossier"
            description="Une fois affecté à un dossier, ses pièces apparaîtront ici."
            action={null}
          />
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
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
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  {/* Header Dossier */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md bg-[var(--input)] text-[var(--muted)] border border-[var(--border)]">
                          TRK-{dossier.id.slice(0, 4).toUpperCase()}
                        </span>
                        <h3 className="font-semibold text-base text-[var(--foreground)]">{dossier.nom}</h3>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-medium text-[var(--foreground)] bg-[var(--input)] px-3 py-1 rounded-full border border-[var(--border)]">
                        {deposee} / {dossierPieces.length} validées
                      </span>
                    </div>
                  </div>

                  {/* Progress bar Dossier */}
                  <div className="space-y-1">
                    <div className="h-1.5 bg-[var(--track)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(dossierPct)})]`}
                        style={{ width: `${dossierPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Tableau pièces */}
                  {dossierPieces.length === 0 ? (
                    <p className="text-sm text-[var(--muted)] text-center py-2">
                      Aucune pièce dans ce dossier
                    </p>
                  ) : (
                    <div className="pt-2 space-y-2 border-t border-[var(--border)]">
                      <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider grid grid-cols-12 gap-3 px-1">
                        <div className="col-span-5">Pièce</div>
                        <div className="col-span-4">Statut</div>
                        <div className="col-span-3 text-right">Déposée le</div>
                      </div>
                      
                      <div className="space-y-1.5">
                        {dossierPieces.map((piece) => {
                          const suivi = dossierSuivi.find((s) => s.piece_id === piece.id)
                          if (!suivi) return null

                          return (
                            <div
                              key={piece.id}
                              className="grid grid-cols-12 gap-3 items-center p-2 rounded-xl hover:bg-[var(--input)] transition-colors border border-transparent hover:border-[var(--border)]"
                            >
                              {/* Pièce */}
                              <div className="col-span-5 flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-[var(--input)] text-[var(--muted)] border border-[var(--border)] flex-shrink-0">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-medium text-[var(--foreground)] truncate">
                                  {piece.nom}
                                </span>
                              </div>

                              {/* Statut */}
                              {isPublic ? (
                                <div className="col-span-7">
                                  <StatusBadge status={suivi.statut} />
                                </div>
                              ) : (
                                <div className="col-span-4 relative">
                                  <button
                                    onClick={() =>
                                      setOpenStatusId(
                                        openStatusId === suivi.id ? null : suivi.id
                                      )
                                    }
                                    className="flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--input)] border border-[var(--border)] hover:border-[var(--muted)] transition-colors w-full text-sm"
                                    aria-haspopup="listbox"
                                    disabled={isUpdating}
                                  >
                                    <StatusBadge status={suivi.statut} />
                                    <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] flex-shrink-0" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {openStatusId === suivi.id && (
                                    <>
                                      <div className="absolute top-full left-0 mt-1 w-44 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                                        {STATUS_OPTIONS.map((option) => (
                                          <button
                                            key={option.id}
                                            onClick={() =>
                                              handleStatusChange(suivi.id, option.id)
                                            }
                                            disabled={isUpdating}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                                              suivi.statut === option.id
                                                ? 'bg-[var(--primary)] bg-opacity-15 text-[var(--foreground)] font-medium'
                                                : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                                            } disabled:opacity-50`}
                                          >
                                            <StatusBadge status={option.id} />
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
                              )}

                              {/* Date de dépôt */}
                              <div className={`${isPublic ? 'hidden' : 'col-span-3'} text-xs text-right text-[var(--muted)] font-medium`}>
                                {suivi.date_depot
                                  ? new Date(suivi.date_depot).toLocaleDateString('fr-FR')
                                  : '–'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
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

      {/* Style CSS pour un scrollbar émincé et moderne */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
      `}</style>
    </Modal>
  )
}