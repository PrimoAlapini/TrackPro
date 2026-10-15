import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Database } from '@/types/database'

type Membre = Database['public']['Tables']['membres']['Row']

interface MemberListProps {
  members: Membre[]
  isLoading: boolean
  onAddClick: () => void
  onEdit: (member: Membre) => void
  onDelete: (id: string) => Promise<void>
}

export function MemberList({
  members,
  isLoading,
  onAddClick,
  onEdit,
  onDelete,
}: MemberListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await onDelete(deleteId)
      setDeleteId(null)
    } finally {
      setIsDeleting(false)
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

  if (!members.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<Plus className="w-12 h-12" />}
            title="Aucun membre"
            description="Ajoutez votre premier membre pour l'affecter aux dossiers."
            action={
              <Button onClick={onAddClick} variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un membre
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Membres</CardTitle>
        <Button onClick={onAddClick} size="sm" variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--input)] transition-colors"
            >
              <Avatar
                initials={getInitials(member.nom)}
                color={member.couleur_avatar as any}
                size="md"
              />

              <div className="flex-1">
                <p className="font-medium text-[var(--foreground)]">{member.nom}</p>
                <p className="text-xs text-[var(--muted)]">
                  Créé le {new Date(member.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(member)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-[var(--foreground)] hover:bg-[var(--input)] rounded-lg transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setDeleteId(member.id)}
                  disabled={isLoading || !!deleteId}
                  className="p-1 text-[var(--danger)] hover:bg-[var(--danger)] hover:bg-opacity-10 rounded-lg transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer le membre"
        message="Cette action supprimera le membre et son suivi associé de tous les dossiers. Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Card>
  )
}
