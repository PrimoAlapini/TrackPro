import { useState } from 'react'
import { useMembers, useCreateMember, useDeleteMember } from '@/features/membres/api'
import { useDossiers } from '@/features/dossiers/api'
import { usePieces } from '@/features/pieces/api'
import { useSuiviPieces, useUpdateSuiviPiece } from '@/features/suivi/api'
import { useConfirm, useAlert } from '@/contexts/DialogContext'
import { MemberDetailModal } from '@/features/membres/MemberDetailModal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { Users, Plus, Trash2 } from 'lucide-react'

export function Members() {
  const { data: membres = [], isLoading, error } = useMembers()
  const { data: dossiers = [] } = useDossiers()
  const { data: pieces = [] } = usePieces()
  const createMember = useCreateMember()
  const deleteMember = useDeleteMember()
  const confirm = useConfirm()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', couleur_avatar: 'primary' })
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Get all suivi for selected member across all dossiers
  const selectedMembre = membres.find((m) => m.id === selectedMemberId)
  const { data: allSuivi = [] } = useSuiviPieces(undefined) // Get all suivi (no dossier filter)

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMember.mutateAsync(formData)
    setFormData({ nom: '', couleur_avatar: 'primary' })
    setShowForm(false)
  }

  const handleDeleteMember = async (id: string) => {
    const confirmed = await confirm({
      title: 'Supprimer le membre',
      message: 'Êtes-vous sûr de vouloir supprimer ce membre de l\'annuaire ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteMember.mutateAsync(id)
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

  // Get dossiers where selected member is assigned
  const memberDossiers = selectedMemberId
    ? dossiers.filter((d) =>
        allSuivi.some((s) => s.membre_id === selectedMemberId && s.dossier_id === d.id)
      )
    : []

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-[30px] font-bold text-[var(--foreground)]">Membres</h1>
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-[var(--danger)] font-medium">Erreur lors du chargement</p>
              <p className="text-[var(--muted)] text-sm mt-1">{error instanceof Error ? error.message : 'Une erreur est survenue'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-[30px] font-bold text-[var(--foreground)]">Membres</h1>
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner size="lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-bold text-[var(--foreground)]">Membres</h1>
          <p className="text-[var(--muted)] mt-1 text-sm lg:text-base">
            Gérez les personnes de votre annuaire et consultez leurs dossiers.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          icon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Ajouter
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau membre</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)]"
                  placeholder="Nom du membre"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={createMember.isPending}
                >
                  Ajouter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {membres.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="Aucun membre"
              description="Commencez par ajouter des personnes à votre annuaire."
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowForm(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Ajouter un membre
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="grid gap-4">
              {membres.map((membre) => {
                const memberSuivi = allSuivi.filter((s) => s.membre_id === membre.id)
                const memberDossiers = dossiers.filter((d) =>
                  memberSuivi.some((s) => s.dossier_id === d.id)
                )
                const memberPieces = pieces.filter((p) =>
                  memberDossiers.some((d) => d.id === p.dossier_id)
                )
                const deposees = memberSuivi.filter((s) => s.statut === 'deposee').length
                const progressPct = memberPieces.length > 0 ? Math.round((deposees / memberPieces.length) * 100) : 0

                return (
                  <div
                    key={membre.id}
                    className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--input)] transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedMemberId(membre.id)
                      setShowDetailModal(true)
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar
                        initials={getInitials(membre.nom)}
                        color={membre.couleur_avatar as any}
                      />
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{membre.nom}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {memberDossiers.length} dossier{memberDossiers.length !== 1 ? 's' : ''} · {progressPct}% de progression
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMember(membre.id)
                      }}
                      className="p-2 text-[var(--muted)] hover:bg-[var(--danger)] hover:text-white rounded-lg transition-colors"
                      aria-label="Supprimer"
                      disabled={deleteMember.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedMemberId(null)
        }}
        title={selectedMembre ? `Dossiers de ${selectedMembre.nom}` : ''}
        size="lg"
      >
        {selectedMembre && (
          <div className="space-y-4">
            {memberDossiers.length === 0 ? (
              <p className="text-[var(--muted)] text-center py-4">Aucun dossier assigné</p>
            ) : (
              memberDossiers.map((dossier) => {
                const dossierSuivi = allSuivi.filter(
                  (s) => s.dossier_id === dossier.id && s.membre_id === selectedMemberId
                )
                const dossierPieces = pieces.filter((p) => p.dossier_id === dossier.id)
                const deposees = dossierSuivi.filter((s) => s.statut === 'deposee').length

                return (
                  <div key={dossier.id} className="p-4 border border-[var(--border)] rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{dossier.nom}</h3>
                        <p className="text-sm text-[var(--muted)]">{dossier.description}</p>
                      </div>
                      <Button variant="secondary" size="sm">
                        Voir détails
                      </Button>
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      {deposees}/{dossierPieces.length} pièces déposées
                    </div>
                    {dossierPieces.length > 0 && (
                      <div className="space-y-2">
                        {dossierPieces.map((piece) => {
                          const suivi = dossierSuivi.find((s) => s.piece_id === piece.id)
                          return (
                            <div key={piece.id} className="flex justify-between items-center text-xs">
                              <span className="text-[var(--foreground)]">{piece.nom}</span>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded ${
                                    suivi?.statut === 'deposee'
                                      ? 'bg-[var(--badge-success-bg)] text-[var(--badge-success-fg)]'
                                      : suivi?.statut === 'en_cours'
                                        ? 'bg-[var(--badge-progress-bg)] text-[var(--badge-progress-fg)]'
                                        : 'bg-[var(--badge-danger-bg)] text-[var(--badge-danger-fg)]'
                                  }`}
                                >
                                  {suivi?.statut === 'deposee' ? 'Déposée' : suivi?.statut === 'en_cours' ? 'En cours' : 'Non déposée'}
                                </span>
                                {suivi?.date_depot && (
                                  <span className="text-[var(--muted)]">
                                    {new Date(suivi.date_depot).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
  