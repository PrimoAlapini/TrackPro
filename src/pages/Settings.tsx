import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDossiers, useDeleteDossier } from '@/features/dossiers/api'
import { useDossier } from '@/contexts/DossierContext'
import { useSuiviPieces } from '@/features/suivi/api'
import { useMembers } from '@/features/membres/api'
import { usePieces } from '@/features/pieces/api'
import { useConfirm, useAlert } from '@/contexts/DialogContext'
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm'
import { DossierForm } from '@/features/dossiers/DossierForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Edit2, Trash2, Folder, Plus } from 'lucide-react'
import { pieceBarColor } from '@/lib/stats'
import type { Database } from '@/types/database'

type Dossier = Database['public']['Tables']['dossiers']['Row']

export function SettingsPage() {
  const { user } = useAuth()
  const { activeDossierId, setActiveDossierId } = useDossier()
  const { data: dossiers = [] } = useDossiers()
  const { data: pieces = [] } = usePieces(undefined)
  const { data: allSuivi = [] } = useSuiviPieces(undefined)
  const { data: membres = [] } = useMembers()
  const deleteDossier = useDeleteDossier()
  const confirm = useConfirm()
  const alert = useAlert()

  const [showDossierForm, setShowDossierForm] = useState(false)
  const [editingDossierId, setEditingDossierId] = useState<string | null>(null)

  const editingDossier = dossiers.find((d) => d.id === editingDossierId)

  const getTRKCode = (id: string) => `TRK-${id.slice(0, 3).toUpperCase()}`

  const getDossierStats = (dossierId: string) => {
    const dossierSuivi = allSuivi.filter((s) => s.dossier_id === dossierId)
    const dossierMembers = new Set(dossierSuivi.map((s) => s.membre_id))
    const dossierPieces = pieces.filter((p) => p.dossier_id === dossierId)
    const deposited = dossierSuivi.filter((s) => s.statut === 'deposee').length
    const total = dossierSuivi.length
    const percentage = total > 0 ? Math.round((deposited / total) * 100) : 0

    return {
      memberCount: dossierMembers.size,
      pieceCount: dossierPieces.length,
      deposited,
      total,
      percentage,
      members: Array.from(dossierMembers)
        .map((id) => membres.find((m) => m.id === id))
        .filter(Boolean) as typeof membres,
    }
  }

  const handleDeleteDossier = async (dossier: Dossier) => {
    const confirmed = await confirm({
      title: 'Supprimer le dossier',
      message: `Êtes-vous sûr de vouloir supprimer "${dossier.nom}" ? Les pièces et le suivi du dossier seront aussi supprimés. Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    })
    if (confirmed) {
      try {
        await deleteDossier.mutateAsync(dossier.id)
        // If deleted dossier was active, switch to first remaining or none
        if (activeDossierId === dossier.id) {
          const remaining = dossiers.filter((d) => d.id !== dossier.id)
          if (remaining.length > 0) {
            setActiveDossierId(remaining[0].id)
          } else {
            setActiveDossierId(null)
          }
        }
      } catch (err) {
        await alert({
          title: 'Erreur',
          message: err instanceof Error ? err.message : 'Impossible de supprimer le dossier',
          variant: 'error',
        })
      }
    }
  }

  const handleDossierSubmit = async (data: any) => {
    try {
      if (editingDossierId) {
        // TODO: Implement update
        console.log('Update dossier:', editingDossierId, data)
      }
      setShowDossierForm(false)
      setEditingDossierId(null)
    } catch (error) {
      console.error('Erreur:', error)
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

  return (
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[30px] font-bold text-[var(--foreground)]">Paramètres</h1>
        <p className="text-[var(--muted)] mt-1 text-sm lg:text-base">
          Gérez vos dossiers et votre compte.
        </p>
      </div>

      {/* Two-column layout: Dossiers (left) + Compte (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 lg:gap-6">
        {/* Dossiers Section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Dossiers</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-1">
                Tous les dossiers enregistrés sur la plateforme.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingDossierId(null)
                setShowDossierForm(true)
              }}
              icon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Nouveau dossier
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {dossiers.length === 0 ? (
              <EmptyState
                icon={<Folder className="w-12 h-12" />}
                title="Aucun dossier"
                description="Créez un dossier pour commencer le suivi."
                action={
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingDossierId(null)
                      setShowDossierForm(true)
                    }}
                  >
                    Créer un dossier
                  </Button>
                }
              />
            ) : (
              dossiers.map((dossier) => {
                const stats = getDossierStats(dossier.id)
                const isActive = activeDossierId === dossier.id

                return (
                  <div
                    key={dossier.id}
                    className={`p-4 bg-[var(--input)] border rounded-[14px] space-y-3 ${
                      isActive ? 'border-[var(--primary)]' : 'border-[var(--border)]'
                    }`}
                  >
                    {/* Header: name + badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{dossier.nom}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{getTRKCode(dossier.id)}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {isActive && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--primary)] text-white rounded-full">
                            Dossier actif
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {dossier.description && (
                      <p className="text-sm text-[var(--muted)]">{dossier.description}</p>
                    )}

                    {/* Info Grid: 2 columns */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[var(--muted)]">Début</p>
                        <p className="font-medium text-[var(--foreground)]">
                          {dossier.date_debut ? new Date(dossier.date_debut).toLocaleDateString('fr-FR') : '–'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--muted)]">Date limite</p>
                        <p className="font-medium text-[var(--foreground)]">
                          {dossier.date_limite ? new Date(dossier.date_limite).toLocaleDateString('fr-FR') : '–'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--muted)]">Resp. collecte</p>
                        <p className="font-medium text-[var(--foreground)]">
                          {dossier.responsable_collecte || '–'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--muted)]">Resp. revue</p>
                        <p className="font-medium text-[var(--foreground)]">
                          {dossier.responsable_revue || '–'}
                        </p>
                      </div>
                    </div>

                    {/* Members + Pieces + Progress */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                      {/* Avatars + counts */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {stats.members.length > 0 && (
                            <div className="flex -space-x-2">
                              {stats.members.slice(0, 4).map((member) => (
                                <Avatar
                                  key={member.id}
                                  initials={getInitials(member.nom)}
                                  color={member.couleur_avatar as any}
                                  size="sm"
                                  className="w-6 h-6 border border-[var(--card)]"
                                />
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-[var(--muted)]">
                            {stats.memberCount} personne{stats.memberCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {stats.pieceCount} pièce{stats.pieceCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="h-2 bg-[var(--track)] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all bg-[var(--${pieceBarColor(stats.percentage)})]`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-right text-[var(--muted)]">{stats.percentage}%</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                      <Button
                        variant={isActive ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          if (!isActive) {
                            setActiveDossierId(dossier.id)
                          }
                        }}
                        disabled={isActive || deleteDossier.isPending}
                        className="flex-1"
                      >
                        {isActive ? 'Dossier actif' : 'Activer'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingDossierId(dossier.id)
                          setShowDossierForm(true)
                        }}
                        disabled={deleteDossier.isPending}
                        aria-label={`Modifier le dossier ${dossier.nom}`}
                        icon={<Edit2 className="w-4 h-4" />}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteDossier(dossier)}
                        disabled={deleteDossier.isPending}
                        aria-label={`Supprimer le dossier ${dossier.nom}`}
                        icon={<Trash2 className="w-4 h-4 text-[var(--danger)]" />}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Compte Section */}
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Email
                  </label>
                  <p className="text-[var(--muted)]">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Compte créé le {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <ChangePasswordForm />
        </div>
      </div>

      {/* Dossier Form Modal */}
      <DossierForm
        isOpen={showDossierForm}
        onClose={() => {
          setShowDossierForm(false)
          setEditingDossierId(null)
        }}
        onSubmit={handleDossierSubmit}
        isLoading={false}
        initialData={
          editingDossier
            ? {
                nom: editingDossier.nom,
                description: editingDossier.description || undefined,
                date_debut: editingDossier.date_debut,
                date_limite: editingDossier.date_limite,
                responsable_collecte: editingDossier.responsable_collecte || undefined,
                responsable_revue: editingDossier.responsable_revue || undefined,
              }
            : undefined
        }
        title={editingDossierId ? 'Modifier le dossier' : 'Créer un dossier'}
      />
    </div>
  )
}
