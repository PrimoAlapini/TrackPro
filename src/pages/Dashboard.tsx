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
import { DocumentLoader } from '@/components/ui/DocumentLoader'
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
  const queries = isPublic
    ? { dossiers: publicDossiers, pieces: publicPieces, suivi: publicSuiviPieces, membres: publicMembers }
    : { dossiers: privateDossiers, pieces: privatePieces, suivi: privateSuiviPieces, membres: privateMembers }

  const { data: dossiers = [] } = queries.dossiers
  const { data: pieces = [] } = queries.pieces
  const { data: suiviList = [] } = queries.suivi
  const { data: membres = [] } = queries.membres

  // Check if data is loading (using presence of data as a proxy)
  const isLoading = (dossiers.length === 0 || pieces.length === 0 || suiviList.length === 0 || membres.length === 0) && activeDossierId

  const [personCurrentPage, setPersonCurrentPage] = useState(1)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [pieceSearchQuery, setPieceSearchQuery] = useState('')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')

  const ITEMS_PER_PAGE = 5
  const PIECE_PER_PAGE = 8

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
  const displayPieces = filteredPieces.slice(0, PIECE_PER_PAGE)

  // Filter members by search query AND validation status
  const filteredDossierMembers = useMemo(() => {
    return dossierMembers.filter((member) => {
      // 1. Filtre texte (recherche)
      const matchesSearch = member.nom.toLowerCase().includes(memberSearchQuery.toLowerCase())

      // 2. Calcul de la progression du membre
      const memberSuivi = suiviList.filter((s) => s.membre_id === member.id)
      const progress = personProgress(memberSuivi, pieces.length)
      const validProgress = progress && progress > 0 ? progress : 0

      // 3. Filtre de statut (Tous / Tout validé / Rien validé)
      let matchesStatus = true
      if (statusFilter === 'completed') {
        matchesStatus = validProgress === 100
      } else if (statusFilter === 'pending') {
        matchesStatus = validProgress === 0
      }

      return matchesSearch && matchesStatus
    })
  }, [dossierMembers, memberSearchQuery, statusFilter, suiviList, pieces.length])

  // Calcul des stats de validation par personne
  const validationStats = useMemo(() => {
    let completedCount = 0; // 100% validé
    let pendingCount = 0;   // 0% ou rien validé
    let partialCount = 0;   // Entre les deux (optionnel, selon si vous voulez un 3e segment)

    dossierMembers.forEach((member) => {
      const memberSuivi = suiviList.filter((s) => s.membre_id === member.id);
      const progress = personProgress(memberSuivi, pieces.length);
      const validProgress = progress && progress > 0 ? progress : 0;

      if (validProgress === 100) {
        completedCount++;
      } else if (validProgress === 0) {
        pendingCount++;
      } else {
        partialCount++;
      }
    });

    return {
      completed: completedCount,
      pending: pendingCount,
      partial: partialCount,
      total: dossierMembers.length,
    };
  }, [dossierMembers, suiviList, pieces.length]);

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
  // Show loader while data is loading
  if (isLoading && activeDossierId) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-[30px] font-bold text-(--foreground)">Tableau de bord</h1>
        </div>
        <div className='mt-60'>
          <DocumentLoader size="lg" />
        </div>
      </div>
    )
  }

  if (!activeDossierId || !activeDossier) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
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
    <div className="max-w-7xl mx-auto space-y-6">
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
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="text-lg">Progression par pièce</CardTitle>
            <div className="flex items-center gap-2 bg-[var(--input)] border border-[var(--border)] rounded-lg px-3 py-2 w-48 transition-colors focus-within:border-[var(--muted)]">
              <Search className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={pieceSearchQuery}
                onChange={(e) => {
                  setPieceSearchQuery(e.target.value)
                  setPersonCurrentPage(1)
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-w-0"
              />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 overflow-hidden pt-1">
            {displayPieces.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-[var(--muted)] text-center">
                  Aucune pièce trouvée
                </p>
              </div>
            ) : (
              <>
                {/* Conteneur avec hauteur fixe / scroll et 7 éléments max affichés */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <BarChart
                    data={filteredPieces.map((piece) => {
                      const progress = pieceProgress(suiviList, piece.id, dossierMembers.length)
                      return {
                        label: piece.nom,
                        value: progress.percentage,
                        color: `var(--${pieceBarColor(progress.percentage)})`,
                      }
                    })}
                  />
                </div>

                {/* Indicateur discret du nombre de pièces visibles / filtrées */}
                <div className="pt-2 mt-auto border-t border-[var(--border)] text-xs text-[var(--muted)] text-center">
                  {filteredPieces.length} pièce{filteredPieces.length !== 1 ? 's' : ''} (défilez pour tout voir)
                </div>
              </>
            )}
          </CardContent>

          {/* Pensez à ajuster votre constante en haut du composant : const PIECE_PER_PAGE = 7 */}

          {/* CSS pour le scrollbar fin */}
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
        </Card>

        {/* Person Progress - with pagination and clickable members */}
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="flex flex-col gap-3 pb-3">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-lg">Progression par personne</CardTitle>
              <div className="flex items-center gap-2 bg-[var(--input)] rounded-lg px-3 py-1.5 w-40">
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
            </div>

            {/* Boutons de filtres stylisés */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setPersonCurrentPage(1)
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === 'all'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                  : 'bg-[var(--input)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
              >
                Tous
              </button>
              <button
                onClick={() => {
                  setStatusFilter('completed')
                  setPersonCurrentPage(1)
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[var(--input)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
              >
                Tout validé
              </button>
              <button
                onClick={() => {
                  setStatusFilter('pending')
                  setPersonCurrentPage(1)
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === 'pending'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-[var(--input)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
              >
                Rien validé
              </button>
            </div>
          </CardHeader>

          {/* CardContent configuré en flex-1 flex flex-col */}
          <CardContent className="flex flex-col flex-1 justify-between overflow-hidden pt-1">

            {/* Zone de contenu principale qui prend TOUT l'espace disponible (`flex-1`) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {paginatedMembers.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-[var(--muted)] text-center">Aucun membre trouvé</p>
                </div>
              ) : (
                <div className="space-y-3 pr-1">
                  {paginatedMembers.map((member) => {
                    const memberSuivi = suiviList.filter((s) => s.membre_id === member.id)
                    const progress = personProgress(memberSuivi, pieces.length)
                    const validProgress = progress && progress > 0 ? progress : 0
                    const maxValue = 100

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleMemberClick(member.id)}
                        className="group cursor-pointer space-y-1 p-1 rounded-lg hover:bg-[var(--input)] transition-colors"
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
                        <div className="w-full h-2 bg-[var(--track)] rounded-full overflow-hidden p-0.5 border border-[var(--border)] border-opacity-40">
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
              )}
            </div>

            {/* Bloc de pagination scellé en bas */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto min-h-[48px]">
              <p className="text-xs text-[var(--muted)]">
                Page {personCurrentPage} / {personTotalPages || 1} · {filteredDossierMembers.length} personne{filteredDossierMembers.length !== 1 ? 's' : ''}
              </p>
              {personTotalPages > 1 && (
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
              )}
            </div>
          </CardContent>

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
        </Card>
      </div>

      {/* Status distribution - Donut + Bar charts */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des validations par personne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="flex justify-center">
              <Donut
                total={validationStats.total}
                segments={[
                  { value: validationStats.completed, color: '#10B981', label: 'Tout validé' },
                  { value: validationStats.pending, color: '#EF4444', label: 'Rien validé' },
                  // Si vous avez des cas intermédiaires (entre 1% et 99%), vous pouvez ajouter un segment :
                  ...(validationStats.partial > 0 ? [{ value: validationStats.partial, color: '#F59E0B', label: 'En cours' }] : []),
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
        isPublic={true}
      />
    </div>
  )
}
