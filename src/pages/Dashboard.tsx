import { useDossier } from '@/contexts/DossierContext'
import { useDossiers } from '@/features/dossiers/api'
import { usePieces } from '@/features/pieces/api'
import { useSuiviPieces } from '@/features/suivi/api'
import { useMembers } from '@/features/membres/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart } from '@/components/charts/BarChart'
import { Donut } from '@/components/charts/Donut'
import { statusCounts, personProgress, pieceProgress, pieceBarColor } from '@/lib/stats'
import { Folder } from 'lucide-react'

export function Dashboard() {
  const { activeDossierId } = useDossier()
  const { data: dossiers = [] } = useDossiers()
  const { data: pieces = [] } = usePieces(activeDossierId || undefined)
  const { data: suiviList = [] } = useSuiviPieces(activeDossierId || undefined)
  const { data: membres = [] } = useMembers()

  const activeDossier = dossiers.find((d) => d.id === activeDossierId)

  // Get unique members in active dossier
  const dossierMembers = suiviList
    .map((s) => s.membre_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((id) => membres.find((m) => m.id === id))
    .filter(Boolean) as typeof membres

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
              description="Sélectionnez ou créez un dossier pour voir les statistiques."
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
        {/* Piece Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression par pièce</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <BarChart
              data={pieces.map((piece) => {
                const progress = pieceProgress(suiviList, piece.id, dossierMembers.length)
                return {
                  label: piece.nom,
                  value: progress.percentage,
                  color: `var(--${pieceBarColor(progress.percentage)})`,
                }
              })}
            />
          </CardContent>
        </Card>

        {/* Person Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progression par personne</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <BarChart
              data={dossierMembers.map((member) => {
                const memberSuivi = suiviList.filter((s) => s.membre_id === member.id)
                const progress = personProgress(memberSuivi, pieces.length)
                return {
                  label: member.nom,
                  value: progress,
                  color: `var(--${member.couleur_avatar})`,
                }
              })}
            />
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
    </div>
  )
}
