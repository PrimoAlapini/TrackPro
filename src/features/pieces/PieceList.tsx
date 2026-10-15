import { useState } from 'react'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Database } from '@/types/database'

type Piece = Database['public']['Tables']['pieces']['Row']

interface PieceListProps {
  pieces: Piece[]
  isLoading: boolean
  onAddClick: () => void
  onEdit: (piece: Piece) => void
  onDelete: (id: string) => Promise<void>
  onReorder: (pieces: Array<{ id: string; ordre: number }>) => Promise<void>
}

export function PieceList({
  pieces,
  isLoading,
  onAddClick,
  onEdit,
  onDelete,
  onReorder,
}: PieceListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)

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

  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    setDraggedId(pieceId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = pieces.findIndex((p) => p.id === draggedId)
    const targetIndex = pieces.findIndex((p) => p.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newPieces = [...pieces]
    const [draggedPiece] = newPieces.splice(draggedIndex, 1)
    newPieces.splice(targetIndex, 0, draggedPiece)

    const reorderedPieces = newPieces.map((p, idx) => ({
      id: p.id,
      ordre: idx,
    }))

    await onReorder(reorderedPieces)
    setDraggedId(null)
  }

  if (!pieces.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<Plus className="w-12 h-12" />}
            title="Aucune pièce configurée"
            description="Créez votre première pièce pour commencer le suivi."
            action={
              <Button onClick={onAddClick} variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une pièce
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
        <CardTitle>Catalogue de pièces</CardTitle>
        <Button onClick={onAddClick} size="sm" variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              draggable
              onDragStart={(e) => handleDragStart(e, piece.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, piece.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] cursor-move transition-colors ${
                draggedId === piece.id ? 'opacity-50 bg-[var(--input)]' : 'hover:bg-[var(--input)]'
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
                  onClick={() => onEdit(piece)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-[var(--foreground)] hover:bg-[var(--input)] rounded-lg transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setDeleteId(piece.id)}
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
        title="Supprimer la pièce"
        message="Cette action supprimera la pièce et tout le suivi associé. Cette action est irréversible."
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
