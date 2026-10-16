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
      size="xl" // Élargissement du conteneur principal
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <Avatar
              initials={getInitials(member.nom)}
              color={member.couleur_avatar as any}
              size="lg"
              className="w-14 h-14"
            />
            <div>
              <h2 className="text-[22px] font-bold text-[var(--foreground)]">{member.nom}</h2>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {memberDossiers.length} dossier{memberDossiers.length !== 1 ? 's' : ''} · {deposeeCount} / {memberSuiviAll.length} pièces déposées
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors border border-[var(--border)]"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>

        {/* Progression globale */}
        <div className="bg-[var(--input)] p-4 rounded-xl border border-[var(--border)] space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-[var(--muted)]">
            <span>Progression globale</span>
            <span className="text-[var(--foreground)] font-semibold">{globalPct}%</span>
          </div>
          <div className="h-2 bg-[var(--track)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(globalPct)})]`}
              style={{ width: `${globalPct}%` }}
            />
          </div>
        </div>

        {/* Liste des dossiers */}
        {memberDossiers.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="Ce membre n'est affecté à aucun dossier"
            description="Une fois affecté à un dossier, ses pièces apparaîtront ici."
            action={null}
          />
        ) : (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-3 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-thumb]:rounded-full">
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
                  className="bg-[var(--input)] border border-[var(--border)] rounded-2xl p-6 space-y-5"
                >
                  {/* Header Dossier */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]">
                          TRK-{dossier.id.slice(0, 3).toUpperCase()}
                        </span>
                        <p className="font-semibold text-[var(--foreground)] text-base">{dossier.nom}</p>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]">
                        {deposee} / {dossierPieces.length} pièces
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-1.5 bg-[var(--track)] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(dossierPct)})]`}
                          style={{ width: `${dossierPct}%` }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[11px] text-[var(--muted)]">{dossierPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Tableau pièces */}
                  {dossierPieces.length === 0 ? (
                    <p className="text-sm text-[var(--muted)] text-center py-3">
                      Aucune pièce dans ce dossier
                    </p>
                  ) : (
                    <div className="pt-3 space-y-3 border-t border-[var(--border)]">
                      {/* En-tête des colonnes avec espacement plus confortable (5/4/3) */}
                      <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider grid grid-cols-12 gap-4 px-3">
                        <div className="col-span-5">Pièce</div>
                        <div className="col-span-4">Statut</div>
                        <div className="col-span-3 text-right">Déposée le</div>
                      </div>

                      <div className="space-y-2.5">
                        {dossierPieces.map((piece) => {
                          const suivi = dossierSuivi.find((s) => s.piece_id === piece.id)
                          if (!suivi) return null

                          return (
                            <div
                              key={piece.id}
                              className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]"
                            >
                              {/* Nom de la pièce */}
                              <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                                <FileText className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                                <span className="text-sm text-[var(--foreground)] truncate font-medium">
                                  {piece.nom}
                                </span>
                              </div>

                              {/* Statut & Dropdown élargi */}
                              <div className="col-span-4 relative">
                                <button
                                  onClick={() =>
                                    setOpenStatusId(
                                      openStatusId === suivi.id ? null : suivi.id
                                    )
                                  }
                                  className="group flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--input)] hover:border-[var(--muted)] transition-all w-full text-left"
                                  aria-haspopup="listbox"
                                  disabled={isUpdating}
                                >
                                  <div className="flex items-center min-w-0 truncate whitespace-nowrap">
                                    <StatusBadge status={suivi.statut} />
                                  </div>
                                  <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors flex-shrink-0" />
                                </button>

                                {/* Dropdown menu */}
                                {openStatusId === suivi.id && (
                                  <>
                                    <div className="absolute top-full left-0 mt-1.5 w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-1 space-y-0.5">
                                      {STATUS_OPTIONS.map((option) => (
                                        <button
                                          key={option.id}
                                          onClick={() =>
                                            handleStatusChange(suivi.id, option.id)
                                          }
                                          disabled={isUpdating}
                                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between gap-2 whitespace-nowrap ${
                                            suivi.statut === option.id
                                              ? 'bg-[var(--input)] font-semibold text-[var(--foreground)]'
                                              : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                                          } disabled:opacity-50`}
                                        >
                                          <StatusBadge status={option.id} />
                                          {/* <span className="text-[var(--muted)] text-[11px] font-normal">
                                            {option.label} */}
                                          {/* </span> */}
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
                              <div className="col-span-3 text-xs text-right text-[var(--muted)] whitespace-nowrap pr-1">
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
    </Modal>
  )
}