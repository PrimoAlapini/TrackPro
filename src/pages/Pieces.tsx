import { useState } from 'react'
import { Eye, FileText, GripVertical, Edit2, Trash2, Users } from 'lucide-react'
import { useDossier } from '@/contexts/DossierContext'
import { usePieces, useCreatePiece, useUpdatePiece, useDeletePiece, useUpdatePiecesOrder } from '@/features/pieces/api'
import { useSuiviPieces, useUpdateSuiviPieceDynamic, useAddMemberToDossier, useRemoveMemberFromDossier, useDossierMembers } from '@/features/suivi/api'
import { useMembers, useCreateMember } from '@/features/membres/api'
import { useDossiers } from '@/features/dossiers/api'
import { PieceStatusModal } from '@/features/suivi/PieceStatusModal'
import { PieceModal } from '@/features/pieces/PieceModal'
import { MemberAssignmentModal } from '@/features/dossiers/MemberAssignmentModal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useConfirm, useAlert } from '@/contexts/DialogContext'
import { Spinner } from '@/components/ui/Spinner'
import { pieceBarColor } from '@/lib/stats'
import type { Database } from '@/types/database'

type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']
type DossierMembre = Database['public']['Tables']['dossier_membres']['Row']

export function Pieces() {
  const { activeDossierId } = useDossier()
  const confirm = useConfirm()
  const { data: dossiers = [] } = useDossiers()
  const { data: pieces = [], isLoading: piecesIsLoading } = usePieces(activeDossierId || undefined)
  const { data: membres = [] } = useMembers()
  const { data: suiviList = [], isLoading: suiviIsLoading } = useSuiviPieces(activeDossierId || undefined)
  const { data: dossierMembres = [] } = useDossierMembers(activeDossierId || undefined)

  // Mutations
  const createPiece = useCreatePiece()
  const updatePiece = useUpdatePiece('')
  const deletePiece = useDeletePiece()
  const updatePiecesOrder = useUpdatePiecesOrder()
  const updateSuiviPiece = useUpdateSuiviPieceDynamic()
  const addMemberToDossier = useAddMemberToDossier()
  const removeMemberFromDossier = useRemoveMemberFromDossier()
  const createMember = useCreateMember()
  const alert = useAlert()

  // State
  const [showPieceModal, setShowPieceModal] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<any>(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedStatusModal, setSelectedStatusModal] = useState(false)
  const [selectedSuivi, setSelectedSuivi] = useState<SuiviPiece | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null)

  const activeDossier = dossiers.find((d) => d.id === activeDossierId)
  const assignedMembers = dossierMembres.map((dm) => ({
    dossier_id: activeDossierId!,
    membre_id: dm,
    created_at: '',
  })) as DossierMembre[]

  const dossierMembers = membres.filter((m) => dossierMembres.includes(m.id))

  // Select first member by default
  const memberId = selectedMemberId || dossierMembres[0]
  const selectedMember = membres.find((m) => m.id === memberId)
  const memberSuivi = suiviList.filter((s) => s.membre_id === memberId)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAddPiece = async (data: any) => {
    if (!activeDossierId) return
    await createPiece.mutateAsync({
      dossier_id: activeDossierId,
      nom: data.nom,
      description: data.description || null,
      ordre: pieces.length,
    } as any)
  }

  const handleUpdatePiece = async (data: any) => {
    if (!selectedPiece) return
    await updatePiece.mutateAsync({
      nom: data.nom,
      description: data.description || null,
    } as any)
  }

  const handleDeletePiece = async (id: string) => {
    const confirmed = await confirm({
      title: 'Supprimer la pièce',
      message: 'Êtes-vous sûr de vouloir supprimer cette pièce ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    })
    if (confirmed) {
      await deletePiece.mutateAsync(id)
    }
  }

  const handleReorderPieces = async (reordered: Array<{ id: string; ordre: number }>) => {
    await updatePiecesOrder.mutateAsync(reordered)
  }

  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    setDraggedPieceId(pieceId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedPieceId || draggedPieceId === targetId) return

    const draggedIndex = pieces.findIndex((p) => p.id === draggedPieceId)
    const targetIndex = pieces.findIndex((p) => p.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newPieces = [...pieces]
    const [draggedPiece] = newPieces.splice(draggedIndex, 1)
    newPieces.splice(targetIndex, 0, draggedPiece)

    const reorderedPieces = newPieces.map((p, idx) => ({
      id: p.id,
      ordre: idx,
    }))

    await handleReorderPieces(reorderedPieces)
    setDraggedPieceId(null)
  }

  const handleOpenStatusModal = (suivi: SuiviPiece) => {
    setSelectedSuivi(suivi)
    setSelectedStatusModal(true)
  }

  const handleUpdateStatus = async (newStatus: SuiviPiece['statut']) => {
    if (!selectedSuivi) return
    await updateSuiviPiece.mutateAsync({
      suiviId: selectedSuivi.id,
      update: { statut: newStatus },
    })
  }

  const handleAssignMember = async (memberId: string) => {
    if (!activeDossierId) return
    await addMemberToDossier.mutateAsync({ dossierId: activeDossierId, memberId })
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!activeDossierId) return
    await removeMemberFromDossier.mutateAsync({ dossierId: activeDossierId, memberId })
  }

  const handleCreateAndAssignMember = async (name: string) => {
    if (!activeDossierId) return
    try {
      // Crée le nouveau membre
      const newMember = await createMember.mutateAsync({
        nom: name,
        couleur_avatar: 'primary',
      })
      // L'assigne automatiquement au dossier
      await addMemberToDossier.mutateAsync({
        dossierId: activeDossierId,
        memberId: newMember.id,
      })
    } catch (err) {
      await alert({
        title: 'Erreur',
        message: err instanceof Error ? err.message : 'Impossible de créer et assigner le membre',
        variant: 'error',
      })
    }
  }

  if (!activeDossierId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[30px] font-bold text-[var(--foreground)]">Pièces du dossier</h1>
        </div>
        <Card>
          <CardContent>
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="Aucun dossier sélectionné"
              description="Sélectionnez un dossier pour voir et gérer ses pièces."
              action={null}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (piecesIsLoading || suiviIsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[30px] font-bold text-[var(--foreground)]">Pièces du dossier</h1>
          <p className="text-[var(--muted)] mt-1">{activeDossier?.nom}</p>
        </div>
        <Card>
          <CardContent className="flex justify-center py-12">
            <Spinner size="lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold text-[var(--foreground)]">Pièces du dossier</h1>
        <p className="text-[var(--muted)] mt-1">{activeDossier?.nom}</p>
      </div>

      {/* Pieces Management Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>Gestion des pièces</CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedPiece(null)
              setShowPieceModal(true)
            }}
            icon={<FileText className="w-4 h-4" />}
          >
            Ajouter une pièce
          </Button>
        </CardHeader>
        <CardContent>
          {pieces.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="Aucune pièce"
              description="Commencez par ajouter les pièces à collecter pour ce dossier."
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowPieceModal(true)}
                  icon={<FileText className="w-4 h-4" />}
                >
                  Ajouter une pièce
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {pieces.map((piece) => (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, piece.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, piece.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] cursor-move transition-colors ${
                    draggedPieceId === piece.id ? 'opacity-50 bg-[var(--input)]' : 'hover:bg-[var(--input)]'
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-[var(--muted)] flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-[var(--foreground)]">{piece.nom}</p>
                    {piece.description && (
                      <p className="text-sm text-[var(--muted)]">{piece.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPiece(piece)
                        setShowPieceModal(true)
                      }}
                      className="p-1 text-[var(--muted)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"
                      aria-label="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePiece(piece.id)}
                      className="p-1 text-[var(--muted)] hover:bg-[var(--danger)] hover:text-white rounded-lg transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Assignment Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>Membres concernés ({dossierMembers.length})</CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMemberModal(true)}
            icon={<Users className="w-4 h-4" />}
          >
            Affecter
          </Button>
        </CardHeader>
        <CardContent>
          {dossierMembers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="Aucun membre affecté"
              description="Affectez des membres pour commencer le suivi des pièces."
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowMemberModal(true)}
                  icon={<Users className="w-4 h-4" />}
                >
                  Affecter des membres
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {/* Member tabs */}
              <div className="flex flex-wrap gap-2">
                {dossierMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors font-medium text-sm ${
                      memberId === member.id
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--input)] text-[var(--foreground)] hover:opacity-70'
                    }`}
                  >
                    <Avatar
                      initials={getInitials(member.nom)}
                      color={member.couleur_avatar as any}
                      size="sm"
                    />
                    {member.nom}
                  </button>
                ))}
              </div>
              
              {/* Selected member progress */}
              {selectedMember && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={getInitials(selectedMember.nom)}
                      color={selectedMember.couleur_avatar as any}
                      size="sm"
                      className="w-10 h-10"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--foreground)] text-sm">{selectedMember.nom}</p>
                      <p className="text-xs text-[var(--muted)]">
                        Dossier #{activeDossier?.id?.slice(0, 3).toUpperCase()} · {memberSuivi.filter((s) => s.statut === 'deposee').length} / {memberSuivi.length} pièces
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {memberSuivi.length > 0 ? Math.round((memberSuivi.filter((s) => s.statut === 'deposee').length / memberSuivi.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  {memberSuivi.length > 0 && (
                    <div className="mt-2 h-2 bg-[var(--track)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 bg-[var(--${pieceBarColor(Math.round((memberSuivi.filter((s) => s.statut === 'deposee').length / memberSuivi.length) * 100))})]`}
                        style={{
                          width: `${Math.round((memberSuivi.filter((s) => s.statut === 'deposee').length / memberSuivi.length) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suivi Table */}
      {dossierMembers.length > 0 && pieces.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Suivi des pièces</CardTitle>
              {selectedMember && (
                <p className="text-sm text-[var(--muted)] mt-1">
                  Dossier #{activeDossier?.id?.slice(0, 3).toUpperCase()} · {memberSuivi.filter((s) => s.statut === 'deposee').length} / {memberSuivi.length} pièces déposées
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-2 text-left font-semibold text-[var(--foreground)]">
                      Pièce
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-[var(--foreground)]">
                      Statut
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-[var(--foreground)]">
                      Date de dépôt
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-[var(--foreground)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberSuivi.map((suivi) => {
                    const piece = pieces.find((p) => p.id === suivi.piece_id)
                    if (!piece) return null

                    return (
                      <tr
                        key={suivi.id}
                        className="border-b border-[var(--border)] hover:bg-[var(--input)] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                          {piece.nom}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={suivi.statut} />
                        </td>
                        <td className="px-4 py-3 text-[var(--muted)]">
                          {suivi.date_depot
                            ? new Date(suivi.date_depot).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleOpenStatusModal(suivi)}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 rounded-lg transition-colors"
                            aria-label="Voir/modifier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PieceModal
        isOpen={showPieceModal}
        onClose={() => {
          setShowPieceModal(false)
          setSelectedPiece(null)
        }}
        onSubmit={selectedPiece ? handleUpdatePiece : handleAddPiece}
        isLoading={createPiece.isPending || updatePiece.isPending}
        initialData={selectedPiece}
        title={selectedPiece ? 'Modifier la pièce' : 'Ajouter une pièce'}
      />

      <MemberAssignmentModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        members={membres}
        assignedMembers={assignedMembers}
        onAssign={handleAssignMember}
        onRemove={handleRemoveMember}
        onCreateAndAssign={handleCreateAndAssignMember}
        isLoading={addMemberToDossier.isPending || removeMemberFromDossier.isPending || createMember.isPending}
      />

      <PieceStatusModal
        isOpen={selectedStatusModal}
        onClose={() => {
          setSelectedStatusModal(false)
          setSelectedSuivi(null)
        }}
        piece={
          selectedSuivi && pieces.find((p) => p.id === selectedSuivi.piece_id)
            ? {
                nom: pieces.find((p) => p.id === selectedSuivi.piece_id)!.nom,
                description: pieces.find((p) => p.id === selectedSuivi.piece_id)!.description,
              }
            : null
        }
        membre={selectedMember || null}
        currentStatus={selectedSuivi?.statut || 'non_deposee'}
        onSubmit={handleUpdateStatus}
        isLoading={updateSuiviPiece.isPending}
      />
    </div>
  )
}
