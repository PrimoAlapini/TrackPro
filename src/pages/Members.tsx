import { useState } from 'react'
import { useMembers, useCreateMember, useDeleteMember } from '@/features/membres/api'
import { useDossiers } from '@/features/dossiers/api'
import { usePieces } from '@/features/pieces/api'
import { useSuiviPieces, useUpdateSuiviPieceDynamic } from '@/features/suivi/api'
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
  const { data: allSuivi = [] } = useSuiviPieces(undefined)
  const createMember = useCreateMember()
  const deleteMember = useDeleteMember()
  const updateSuiviPiece = useUpdateSuiviPieceDynamic()
  const confirm = useConfirm()
  const alert = useAlert()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', couleur_avatar: 'primary' })
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

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

  const handleStatusChange = async (followId: string, newStatus: any) => {
    setIsUpdatingStatus(true)
    try {
      await updateSuiviPiece.mutateAsync({
        suiviId: followId,
        update: { statut: newStatus },
      })
    } catch (err) {
      await alert({
        title: 'Erreur',
        message: err instanceof Error ? err.message : 'Impossible de mettre à jour le statut',
        variant: 'error',
      })
    } finally {
      setIsUpdatingStatus(false)
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
      <MemberDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedMemberId(null)
        }}
        member={selectedMemberId ? membres.find((m) => m.id === selectedMemberId) || null : null}
        dossiers={dossiers}
        pieces={pieces}
        suiviList={allSuivi}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdatingStatus}
      />
    </div>
  )
}
