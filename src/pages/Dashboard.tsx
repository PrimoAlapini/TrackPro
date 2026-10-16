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
import { Folder, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

type Counts = { deposee: number; en_cours: number; non_deposee: number; total: number }

const STATUS_BARS = [
  { key: 'deposee', label: 'Déposées', color: 'var(--success, #10B981)' },
  { key: 'en_cours', label: 'En cours', color: 'var(--cyan, #22D3EE)' },
  { key: 'non_deposee', label: 'Non déposées', color: 'var(--destructive, #EF4444)' },
] as const

function StatusBars({ counts }: { counts: Counts }) {
  const items = STATUS_BARS.map((s) => {
    const value = counts[s.key as keyof typeof counts]
    const pct = counts.total > 0 ? Math.round((value / counts.total) * 100) : 0
    return { ...s, value, pct }
  })

  return (
    <div className="w-full">
      {/* Zone du graphique : les barres partent toutes de la même ligne de base (0 %) */}
      <div className="relative mt-12 h-56">
        {[100, 50, 0].map((v) => (
          <div
            key={v}
            aria-hidden="true"
            className="absolute inset-x-0 flex translate-y-1/2 items-center gap-3"
            style={{ bottom: `${v}%` }}
          >
            <span className="w-10 text-right text-xs text-[var(--muted-foreground)]">{v}%</span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>
        ))}
        <ul className="absolute inset-y-0 left-[52px] right-0 grid grid-cols-3">
          {items.map((it) => (
            <li key={it.key} className="relative flex justify-center">
              <span className="sr-only">
                {it.label} : {it.value} sur {counts.total} ({it.pct} %)
              </span>
              <div className="relative h-full w-14 sm:w-16" aria-hidden="true">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-t-xl transition-[height] duration-500"
                  style={{ height: `${it.pct}%`, backgroundColor: it.color }}
                />
                <div
                  className="absolute inset-x-0 mb-1.5 flex flex-col items-center leading-tight"
                  style={{ bottom: `${it.pct}%` }}
                >
                  <span className="text-lg font-bold" style={{ color: it.color }}>
                    {it.value}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">{it.pct}%</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Libellés sous chaque barre */}
      <ul className="mt-3 grid grid-cols-3 pl-[52px]">
        {items.map((it) => (
          <li key={it.key} className="text-center text-sm font-medium text-[var(--foreground)]">
            {it.label}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-[var(--border)] pt-4 text-center text-sm text-[var(--muted-foreground)]">
        Total : <span className="font-bold text-[var(--foreground)]">{counts.total} pièces</span>
      </p>
      {counts.total === 0 && (
        <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
          Aucune pièce à suivre pour ce dossier.
        </p>
      )}
    </div>
  )
}

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
  const [pieceSearchQuery, setPieceSearchQuery] = useState('')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const ITEMS_PER_PAGE = 5

  const activeDossier = dossiers.find((d) => d.id === activeDossierId)

  // Get unique members in active dossier
  const dossierMembers = suiviList
    .map((s) => s.membre_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((id) => membres.find((m) => m.id === id))
    .filter(Boolean) as typeof membres

  // Filter pieces by search query
  const filteredPieces = useMemo(() => {
    return pieces.filter((piece) =>
      piece.nom.toLowerCase().includes(pieceSearchQuery.toLowerCase())
    )
  }, [pieces, pieceSearchQuery])

  // Limit filtered pieces to 5, rest in scroll
  const displayPieces = filteredPieces.slice(0, ITEMS_PER_PAGE)
  const hasMorePieces = filteredPieces.length > ITEMS_PER_PAGE

  // Filter members by search query
  const filteredDossierMembers = useMemo(() => {
    return dossierMembers.filter((member) =>
      member.nom.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
  }, [dossierMembers, memberSearchQuery])

  // Pagination for persons
  const personTotalPages = Math.ceil(filteredDossierMembers.length / ITEMS_PER_PAGE)
  const paginatedMembers = useMemo(() => {
    const start = (personCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredDossierMembers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDossierMembers, personCurrentPage])

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
        <h1 className="text-[30px] font-black text-[var(--foreground)]">Tableau de bord</h1>
        <div className="mt-3 space-y-1">
          <h2 className="text-lg font-extrabold text-[var(--foreground)]">{activeDossier.nom}</h2>
          {activeDossier.description && (
            <p className="text-sm text-[var(--muted)]">{activeDossier.description}</p>
          )}
        </div>
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
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">Progression par pièce</CardTitle>
            <div className="flex items-center gap-2 bg-[var(--input)] rounded-lg px-3 py-2 w-40">
              <Search className="w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={pieceSearchQuery}
                onChange={(e) => {
                  setPieceSearchQuery(e.target.value)
                  setPersonCurrentPage(1)
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
              />
            </div>
          </CardHeader>
          <CardContent>
            {displayPieces.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-4">Aucune pièce trouvée</p>
            ) : (
              <>
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
                    {displayPieces.length} / {filteredPieces.length} pièces affichées (scrollez pour plus)
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Person Progress - with pagination and clickable members */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">Progression par personne</CardTitle>
            <div className="flex items-center gap-2 bg-[var(--input)] rounded-lg px-3 py-2 w-40">
              <Search className="w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={memberSearchQuery}
                onChange={(e) => {
                  setMemberSearchQuery(e.target.value)
                  setPersonCurrentPage(1)
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {paginatedMembers.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-4">Aucun membre trouvé</p>
            ) : (
              <>
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
                      Page {personCurrentPage} / {personTotalPages} · {filteredDossierMembers.length} personne{filteredDossierMembers.length !== 1 ? 's' : ''}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status distribution - Donut + Bar charts */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="flex justify-center">
              <Donut
                total={counts.total}
                segments={[
                  { value: counts.deposee, color: '#10B981', label: 'Déposées' },
                  { value: counts.en_cours, color: '#22D3EE', label: 'En cours' },
                  { value: counts.non_deposee, color: '#EF4444', label: 'Non déposées' },
                ]}
              />
            </div>
            <StatusBars counts={counts} />
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
