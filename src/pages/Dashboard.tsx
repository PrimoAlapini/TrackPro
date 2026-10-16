import { useState, useMemo } from 'react'
import { useDossier } from '@/contexts/DossierContext'
import { useDossiers } from '@/features/dossiers/api'
import { usePieces } from '@/features/pieces/api'
import { useSuiviPieces } from '@/features/suivi/api'
import { useMembers } from '@/features/membres/api'
import { usePublicDossiers, usePublicPieces, usePublicSuiviPieces, usePublicMembers } from '@/hooks/usePublicData'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart } from '@/components/charts/BarChart'
import { Donut } from '@/components/charts/Donut'
import { MemberDetailModal } from '@/features/membres/MemberDetailModal'
import { statusCounts, personProgress, pieceProgress, pieceBarColor } from '@/lib/stats'
import { Folder, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

interface DashboardProps {
  isPublic?: boolean
}

export function Dashboard({ isPublic = false }: DashboardProps) {
  const { activeDossierId } = useDossier()
  
  // Always call all hooks (required by React)
  const privateDossiers = useDossiers()
  const privatePieces = usePieces(activeDossierId || undefined)
  const privateSuiviPieces = useSuiviPieces(activeDossierId || undefined)
  const privateMembers = useMembers()
  
  const publicDossiers = usePublicDossiers()
  const publicPieces = usePublicPieces(activeDossierId || undefined)
  const publicSuiviPieces = usePublicSuiviPieces(activeDossierId || undefined)
  const publicMembers = usePublicMembers()

  // Select data based on mode
  const { data: dossiers = [] } = isPublic ? publicDossiers : privateDossiers
  const { data: pieces = [] } = isPublic ? publicPieces : privatePieces
  const { data: suiviList = [] } = isPublic ? publicSuiviPieces : privateSuiviPieces
  const { data: membres = [] } = isPublic ? publicMembers : privateMembers

  const [personCurrentPage, setPersonCurrentPage] = useState(1)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const ITEMS_PER_PAGE = 5

  const activeDossier = dossiers.find((d) => d.id === activeDossierId)

  // Get unique members in active dossier
  const dossierMembers = suiviList
    .map((s) => s.membre_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((id) => membres.find((m) => m.id === id))
    .filter(Boolean) as typeof membres

  // Pagination for persons
  const personTotalPages = Math.ceil(dossierMembers.length / ITEMS_PER_PAGE)
  const paginatedMembers = useMemo(() => {
    const start = (personCurrentPage - 1) * ITEMS_PER_PAGE
    return dossierMembers.slice(start, start + ITEMS_PER_PAGE)
  }, [dossierMembers, personCurrentPage])

  // Limit pieces to 5, rest in scroll
  const displayPieces = pieces.slice(0, ITEMS_PER_PAGE)
  const hasMorePieces = pieces.length > ITEMS_PER_PAGE

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId)
    setShowMemberModal(true)
  }

  const handleStatusChange = async (_followId: string, _newStatus: any) => {
    // In public mode, this won't be called
    // In private mode, this would be handled by the parent
  }

  if (!activeDossierId || !activeDossier) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[30px] font-bold text-[var(--foreground)]">Tableau de bord</h1>
        </div>
        <Card>
          <CardContent>
            <EmptyState
              icon={<Folder className="w-12 h-12" />}
              title="Aucun dossier sélectionné"
              description="Sélectionnez un dossier pour voir les statistiques."
              action={null}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats
  const counts = statusCounts(suiviList)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-bold text-[var(--foreground)]">Tableau de bord</h1>
        <p className="text-[var(--muted)] mt-1">{activeDossier.nom}</p>
      </div>

      {/* KPI Cards - 1 col mobile, 2 tablet, 4 desktop with responsive gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-[var(--muted)] text-sm mb-3">Total des pièces</p>
            <p className="text-3xl font-bold text-[var(--foreground)]">{pieces.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[var(--muted)] text-sm mb-3">Membres assignés</p>
            <p className="text-3xl font-bold text-[var(--foreground)]">{dossierMembers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[var(--muted)] text-sm mb-3">Déposées</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[var(--success)]">{counts.deposee}</p>
              <p className="text-sm text-[var(--muted)]">{counts.deposee_pct}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[var(--muted)] text-sm mb-3">Non déposées</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[var(--danger)]">{counts.non_deposee}</p>
              <p className="text-sm text-[var(--muted)]">{counts.non_deposee_pct}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Stacked on mobile, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Piece Progress - with scroll */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression par pièce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`${hasMorePieces ? 'overflow-y-auto max-h-96' : ''}`}>
              <BarChart
                data={displayPieces.map((piece) => {
                  const progress = pieceProgress(suiviList, piece.id, dossierMembers.length)
                  return {
                    label: piece.nom,
                    value: progress.percentage,
                    color: `var(--${pieceBarColor(progress.percentage)})`,
                  }
                })}
              />
            </div>
            {hasMorePieces && (
              <p className="text-xs text-[var(--muted)] mt-3 text-center">
                {displayPieces.length} / {pieces.length} pièces affichées (scrollez pour plus)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Person Progress - with pagination and clickable members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression par personne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
  <div className="space-y-3.5">
    {paginatedMembers.map((member) => {
      const memberSuivi = suiviList.filter((s) => s.membre_id === member.id)
      const progress = personProgress(memberSuivi, pieces.length)
      const validProgress = progress && progress > 0 ? progress : 0
      const maxValue = 100

      return (
        <div
          key={member.id}
          onClick={() => handleMemberClick(member.id)}
          className="group cursor-pointer space-y-1.5 p-1 rounded-lg hover:bg-[var(--input)] transition-colors"
        >
          {/* Entête membre & pourcentage */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Avatar
                initials={getInitials(member.nom)}
                color={member.couleur_avatar as any}
                size="sm"
              />
              <span className="text-[var(--foreground)] font-medium group-hover:text-[var(--primary)] transition-colors">
                {member.nom}
              </span>
            </div>
            <span className="text-[var(--muted)] font-semibold">
              {validProgress}%
            </span>
          </div>

          {/* Piste & Barre émincée */}
          <div className="w-full h-2.5 bg-[var(--track)] rounded-full overflow-hidden p-0.5 border border-[var(--border)] border-opacity-40">
            {validProgress > 0 && (
              <div
                className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                style={{
                  width: `${(validProgress / maxValue) * 100}%`,
                  backgroundColor: `var(--${member.couleur_avatar})`,
                }}
              />
            )}
          </div>
        </div>
      )
    })}
  </div>

  {/* Pagination */}
  {personTotalPages > 1 && (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--muted)]">
        Page {personCurrentPage} / {personTotalPages} · {dossierMembers.length} personne{dossierMembers.length !== 1 ? 's' : ''}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPersonCurrentPage((p) => Math.max(1, p - 1))}
          disabled={personCurrentPage === 1}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Préc.
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPersonCurrentPage((p) => Math.min(personTotalPages, p + 1))}
          disabled={personCurrentPage === personTotalPages}
          icon={<ChevronRight className="w-4 h-4" />}
        >
          Suiv.
        </Button>
      </div>
    </div>
  )}
</CardContent>
        </Card>
      </div>

      {/* Donut chart - takes full width, centered */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des statuts</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center overflow-x-auto">
          <div className="flex justify-center min-w-full lg:min-w-0">
            <Donut
              total={counts.total}
              segments={[
                { value: counts.deposee, color: '#10B981', label: 'Déposées' },
                { value: counts.en_cours, color: '#22D3EE', label: 'En cours' },
                { value: counts.non_deposee, color: '#EF4444', label: 'Non déposées' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      <MemberDetailModal
        isOpen={showMemberModal}
        onClose={() => {
          setShowMemberModal(false)
          setSelectedMemberId(null)
        }}
        member={selectedMemberId ? membres.find((m) => m.id === selectedMemberId) || null : null}
        dossiers={dossiers}
        pieces={pieces}
        suiviList={suiviList}
        onStatusChange={handleStatusChange}
        isPublic={isPublic}
      />
    </div>
  )
}
