import { useState, useMemo } from 'react'
import { useMembers, useCreateMember, useDeleteMember, useUpdateMember as useUpdateMemberAPI } from '@/features/membres/api'
import { useDossiers } from '@/features/dossiers/api'
import { usePieces } from '@/features/pieces/api'
import { useSuiviPieces, useUpdateSuiviPieceDynamic } from '@/features/suivi/api'
import { useConfirm, useAlert } from '@/contexts/DialogContext'
import { MemberDetailModal } from '@/features/membres/MemberDetailModal'
import { MemberForm } from '@/features/membres/MemberForm'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { DocumentLoader } from '@/components/ui/DocumentLoader'
import { Users, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Search } from 'lucide-react'

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

  const [showMemberForm, setShowMemberForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [selectedDossierFilter, setSelectedDossierFilter] = useState<string | null>(null)

  // Always call hooks unconditionally, but use empty string as placeholder
  const updateMemberHook = useUpdateMemberAPI(editingMember?.id || '')

  const MEMBERS_PER_PAGE = 7

  // Filtrer par recherche et dossier
  const filteredMembers = useMemo(() => {
    let result = membres.filter((m) =>
      m.nom.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter by dossier if selected
    if (selectedDossierFilter) {
      result = result.filter((m) => {
        const memberSuivi = allSuivi.filter((s) => s.membre_id === m.id)
        return memberSuivi.some((s) => s.dossier_id === selectedDossierFilter)
      })
    }

    return result
  }, [membres, searchQuery, selectedDossierFilter, allSuivi])

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE)
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * MEMBERS_PER_PAGE
    return filteredMembers.slice(start, start + MEMBERS_PER_PAGE)
  }, [filteredMembers, currentPage])

  const handleAddMember = async (data: any) => {
    if (Array.isArray(data)) {
      // Multi-add
      for (const member of data) {
        await createMember.mutateAsync(member)
      }
    } else if (editingMember) {
      // Update
      await updateMemberHook.mutateAsync(data)
      setEditingMember(null)
    } else {
      // Single add
      await createMember.mutateAsync(data)
    }
  }

  const handleEditMember = (member: any) => {
    setEditingMember(member)
    setShowMemberForm(true)
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

  const handleCloseForm = () => {
    setShowMemberForm(false)
    setEditingMember(null)
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
          <div className="flex justify-center py-12">
            <DocumentLoader size="lg" />
          </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-bold text-[var(--foreground)]">Membres</h1>
          <p className="text-[var(--muted)] mt-1 text-sm lg:text-base">
            Gérez les personnes de votre annuaire et consultez leurs dossiers.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowMemberForm(true)}
          icon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Ajouter
        </Button>
      </div>

      {/* Recherche et Filtres */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)]"
          />
        </div>

        {/* Filtre Dossiers */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedDossierFilter(null)
              setCurrentPage(1)
            }}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedDossierFilter === null
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--input)] text-[var(--foreground)] hover:bg-[var(--border)]'
            }`}
          >
            Tous les dossiers
          </button>
          {dossiers.map((dossier) => (
            <button
              key={dossier.id}
              onClick={() => {
                setSelectedDossierFilter(dossier.id)
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedDossierFilter === dossier.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--input)] text-[var(--foreground)] hover:bg-[var(--border)]'
              }`}
            >
              {dossier.nom}
            </button>
          ))}
        </div>

        {/* Compteur */}
        <p className="text-sm text-[var(--muted)]">
          {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} {selectedDossierFilter ? 'dans ce dossier' : ''} · <span className="font-medium">{membres.length} au total</span>
        </p>
      </div>

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="Aucun membre"
              description={searchQuery || selectedDossierFilter ? 'Aucun membre ne correspond à votre recherche.' : 'Commencez par ajouter des personnes à votre annuaire.'}
              action={
                !searchQuery && !selectedDossierFilter && (
                  <Button
                    variant="primary"
                    onClick={() => setShowMemberForm(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Ajouter un membre
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <div className="grid gap-4">
                {paginatedMembers.map((membre) => {
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
                      className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--input)] transition-colors"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => {
                          setSelectedMemberId(membre.id)
                          setShowDetailModal(true)
                        }}
                      >
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
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditMember(membre)
                          }}
                          className="p-2 text-[var(--muted)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"
                          aria-label="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
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
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--muted)]">
                    Page {currentPage} sur {totalPages} · {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      icon={<ChevronRight className="w-4 h-4" />}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
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

      {/* Add/Edit Member Form Modal */}
      <MemberForm
        isOpen={showMemberForm}
        onClose={handleCloseForm}
        onSubmit={handleAddMember}
        isLoading={createMember.isPending || updateMemberHook.isPending}
        initialData={editingMember}
        title={editingMember ? 'Modifier le membre' : 'Ajouter un membre'}
        isEditing={!!editingMember}
      />
    </div>
  )
}
