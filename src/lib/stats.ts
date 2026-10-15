import type { Database } from '@/types/database'

type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']

export interface StatusCounts {
  deposee: number
  en_cours: number
  non_deposee: number
  total: number
}

export interface StatusPercents extends StatusCounts {
  deposee_pct: number
  en_cours_pct: number
  non_deposee_pct: number
}

export interface PieceProgress {
  count: number
  total: number
  percentage: number
}

/**
 * Calculate person progress in a dossier: deposees / totalPieces of that dossier, rounded
 * Used for members list and dashboard
 */
export function personProgress(
  suivi: SuiviPiece[],
  totalPiecesInDossier: number
): number {
  if (totalPiecesInDossier === 0) return 0
  const deposees = suivi.filter((s) => s.statut === 'deposee').length
  return Math.round((deposees / totalPiecesInDossier) * 100)
}

/**
 * Calculate piece progress: count of deposees / totalMembers in dossier
 * Used for pieces list and dashboard
 */
export function pieceProgress(
  suivi: SuiviPiece[],
  pieceId: string,
  totalMembersInDossier: number
): PieceProgress {
  if (totalMembersInDossier === 0) return { count: 0, total: totalMembersInDossier, percentage: 0 }
  const pieceSuivi = suivi.filter((s) => s.piece_id === pieceId)
  const deposees = pieceSuivi.filter((s) => s.statut === 'deposee').length
  return {
    count: deposees,
    total: totalMembersInDossier,
    percentage: Math.round((deposees / totalMembersInDossier) * 100),
  }
}

/**
 * Calculate status counts and percentages for dossier
 * All counts are from suivi_pieces of the active dossier
 */
export function statusCounts(suivi: SuiviPiece[]): StatusPercents {
  const total = suivi.length
  const deposee = suivi.filter((s) => s.statut === 'deposee').length
  const en_cours = suivi.filter((s) => s.statut === 'en_cours').length
  const non_deposee = suivi.filter((s) => s.statut === 'non_deposee').length

  return {
    deposee,
    en_cours,
    non_deposee,
    total,
    deposee_pct: total === 0 ? 0 : Math.round((deposee / total) * 100),
    en_cours_pct: total === 0 ? 0 : Math.round((en_cours / total) * 100),
    non_deposee_pct: total === 0 ? 0 : Math.round((non_deposee / total) * 100),
  }
}

/**
 * Get bar color based on percentage
 * 100 -> success
 * >= 67 -> secondary
 * >= 34 -> primary
 * else -> warning
 */
export function pieceBarColor(percentage: number): 'success' | 'secondary' | 'primary' | 'warning' {
  if (percentage === 100) return 'success'
  if (percentage >= 67) return 'secondary'
  if (percentage >= 34) return 'primary'
  return 'warning'
}
