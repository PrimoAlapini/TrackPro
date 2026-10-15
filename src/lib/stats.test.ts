import { describe, it, expect } from 'vitest'
import { personProgress, pieceProgress, statusCounts, pieceBarColor } from './stats'
import type { Database } from '@/types/database'

type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']

// Reference dataset: 4 members × 6 pieces in ONE dossier = 24 lines
const DOSSIER_ID = 'dossier-001'
const mockSuivi: SuiviPiece[] = [
  // Member 1 (Marc): 4 déposées, 1 en cours, 1 non déposée
  { id: '1', dossier_id: DOSSIER_ID, piece_id: 'piece-1', membre_id: 'member-1', statut: 'deposee', date_depot: '2026-10-01', created_at: '', updated_at: '' },
  { id: '2', dossier_id: DOSSIER_ID, piece_id: 'piece-2', membre_id: 'member-1', statut: 'deposee', date_depot: '2026-10-02', created_at: '', updated_at: '' },
  { id: '3', dossier_id: DOSSIER_ID, piece_id: 'piece-3', membre_id: 'member-1', statut: 'deposee', date_depot: '2026-10-03', created_at: '', updated_at: '' },
  { id: '4', dossier_id: DOSSIER_ID, piece_id: 'piece-4', membre_id: 'member-1', statut: 'deposee', date_depot: '2026-10-04', created_at: '', updated_at: '' },
  { id: '5', dossier_id: DOSSIER_ID, piece_id: 'piece-5', membre_id: 'member-1', statut: 'en_cours', date_depot: null, created_at: '', updated_at: '' },
  { id: '6', dossier_id: DOSSIER_ID, piece_id: 'piece-6', membre_id: 'member-1', statut: 'non_deposee', date_depot: null, created_at: '', updated_at: '' },

  // Member 2 (Sophie): 4 déposées, 2 non déposées
  { id: '7', dossier_id: DOSSIER_ID, piece_id: 'piece-1', membre_id: 'member-2', statut: 'deposee', date_depot: '2026-10-01', created_at: '', updated_at: '' },
  { id: '8', dossier_id: DOSSIER_ID, piece_id: 'piece-2', membre_id: 'member-2', statut: 'deposee', date_depot: '2026-10-02', created_at: '', updated_at: '' },
  { id: '9', dossier_id: DOSSIER_ID, piece_id: 'piece-3', membre_id: 'member-2', statut: 'deposee', date_depot: '2026-10-03', created_at: '', updated_at: '' },
  { id: '10', dossier_id: DOSSIER_ID, piece_id: 'piece-4', membre_id: 'member-2', statut: 'deposee', date_depot: '2026-10-04', created_at: '', updated_at: '' },
  { id: '11', dossier_id: DOSSIER_ID, piece_id: 'piece-5', membre_id: 'member-2', statut: 'non_deposee', date_depot: null, created_at: '', updated_at: '' },
  { id: '12', dossier_id: DOSSIER_ID, piece_id: 'piece-6', membre_id: 'member-2', statut: 'non_deposee', date_depot: null, created_at: '', updated_at: '' },

  // Member 3 (Jean): 3 déposées, 1 en cours, 2 non déposées
  { id: '13', dossier_id: DOSSIER_ID, piece_id: 'piece-1', membre_id: 'member-3', statut: 'deposee', date_depot: '2026-10-01', created_at: '', updated_at: '' },
  { id: '14', dossier_id: DOSSIER_ID, piece_id: 'piece-2', membre_id: 'member-3', statut: 'deposee', date_depot: '2026-10-02', created_at: '', updated_at: '' },
  { id: '15', dossier_id: DOSSIER_ID, piece_id: 'piece-3', membre_id: 'member-3', statut: 'deposee', date_depot: '2026-10-03', created_at: '', updated_at: '' },
  { id: '16', dossier_id: DOSSIER_ID, piece_id: 'piece-4', membre_id: 'member-3', statut: 'en_cours', date_depot: null, created_at: '', updated_at: '' },
  { id: '17', dossier_id: DOSSIER_ID, piece_id: 'piece-5', membre_id: 'member-3', statut: 'non_deposee', date_depot: null, created_at: '', updated_at: '' },
  { id: '18', dossier_id: DOSSIER_ID, piece_id: 'piece-6', membre_id: 'member-3', statut: 'non_deposee', date_depot: null, created_at: '', updated_at: '' },

  // Member 4 (Lena): 3 déposées, 2 en cours, 1 non déposée
  { id: '19', dossier_id: DOSSIER_ID, piece_id: 'piece-1', membre_id: 'member-4', statut: 'deposee', date_depot: '2026-10-01', created_at: '', updated_at: '' },
  { id: '20', dossier_id: DOSSIER_ID, piece_id: 'piece-2', membre_id: 'member-4', statut: 'deposee', date_depot: '2026-10-02', created_at: '', updated_at: '' },
  { id: '21', dossier_id: DOSSIER_ID, piece_id: 'piece-3', membre_id: 'member-4', statut: 'deposee', date_depot: '2026-10-03', created_at: '', updated_at: '' },
  { id: '22', dossier_id: DOSSIER_ID, piece_id: 'piece-4', membre_id: 'member-4', statut: 'en_cours', date_depot: null, created_at: '', updated_at: '' },
  { id: '23', dossier_id: DOSSIER_ID, piece_id: 'piece-5', membre_id: 'member-4', statut: 'en_cours', date_depot: null, created_at: '', updated_at: '' },
  { id: '24', dossier_id: DOSSIER_ID, piece_id: 'piece-6', membre_id: 'member-4', statut: 'non_deposee', date_depot: null, created_at: '', updated_at: '' },
]

describe('stats functions', () => {
  describe('personProgress', () => {
    it('should calculate Marc (member-1) progress: 4/6 = 67%', () => {
      const marcSuivi = mockSuivi.filter((s) => s.membre_id === 'member-1')
      const result = personProgress(marcSuivi, 6) // 6 pieces in dossier
      expect(result).toBe(67)
    })

    it('should calculate Sophie (member-2) progress: 4/6 = 67%', () => {
      const sophieSuivi = mockSuivi.filter((s) => s.membre_id === 'member-2')
      const result = personProgress(sophieSuivi, 6)
      expect(result).toBe(67)
    })

    it('should calculate Jean (member-3) progress: 3/6 = 50%', () => {
      const jeanSuivi = mockSuivi.filter((s) => s.membre_id === 'member-3')
      const result = personProgress(jeanSuivi, 6)
      expect(result).toBe(50)
    })

    it('should calculate Lena (member-4) progress: 3/6 = 50%', () => {
      const lenaSuivi = mockSuivi.filter((s) => s.membre_id === 'member-4')
      const result = personProgress(lenaSuivi, 6)
      expect(result).toBe(50)
    })

    it('should return 0 when no pieces in dossier', () => {
      const result = personProgress([], 0)
      expect(result).toBe(0)
    })
  })

  describe('pieceProgress', () => {
    it('should calculate piece-1 progress: 4/4 members = 100%', () => {
      const result = pieceProgress(mockSuivi, 'piece-1', 4)
      expect(result).toEqual({ count: 4, total: 4, percentage: 100 })
    })

    it('should calculate piece-2 progress: 4/4 members = 100%', () => {
      const result = pieceProgress(mockSuivi, 'piece-2', 4)
      expect(result).toEqual({ count: 4, total: 4, percentage: 100 })
    })

    it('should calculate piece-3 progress: 4/4 members = 100%', () => {
      const result = pieceProgress(mockSuivi, 'piece-3', 4)
      expect(result).toEqual({ count: 4, total: 4, percentage: 100 })
    })

    it('should calculate piece-4 progress: 2/4 members = 50%', () => {
      const result = pieceProgress(mockSuivi, 'piece-4', 4)
      expect(result).toEqual({ count: 2, total: 4, percentage: 50 })
    })

    it('should calculate piece-5 progress: 1/4 members = 25%', () => {
      const result = pieceProgress(mockSuivi, 'piece-5', 4)
      expect(result).toEqual({ count: 1, total: 4, percentage: 25 })
    })

    it('should calculate piece-6 progress: 0/4 members = 0%', () => {
      const result = pieceProgress(mockSuivi, 'piece-6', 4)
      expect(result).toEqual({ count: 0, total: 4, percentage: 0 })
    })

    it('should return 0 when no members in dossier', () => {
      const result = pieceProgress([], 'piece-1', 0)
      expect(result).toEqual({ count: 0, total: 0, percentage: 0 })
    })
  })

  describe('statusCounts', () => {
    it('should calculate correct totals: 14 déposées (58%), 5 en cours (21%), 5 non déposées (21%)', () => {
      const result = statusCounts(mockSuivi)
      expect(result).toEqual({
        deposee: 14,
        en_cours: 5,
        non_deposee: 5,
        total: 24,
        deposee_pct: 58,
        en_cours_pct: 21,
        non_deposee_pct: 21,
      })
    })

    it('should handle empty suivi array', () => {
      const result = statusCounts([])
      expect(result).toEqual({
        deposee: 0,
        en_cours: 0,
        non_deposee: 0,
        total: 0,
        deposee_pct: 0,
        en_cours_pct: 0,
        non_deposee_pct: 0,
      })
    })
  })

  describe('pieceBarColor', () => {
    it('should return success for 100%', () => {
      expect(pieceBarColor(100)).toBe('success')
    })

    it('should return secondary for 67-99%', () => {
      expect(pieceBarColor(67)).toBe('secondary')
      expect(pieceBarColor(80)).toBe('secondary')
      expect(pieceBarColor(99)).toBe('secondary')
    })

    it('should return primary for 34-66%', () => {
      expect(pieceBarColor(34)).toBe('primary')
      expect(pieceBarColor(50)).toBe('primary')
      expect(pieceBarColor(66)).toBe('primary')
    })

    it('should return warning for 0-33%', () => {
      expect(pieceBarColor(0)).toBe('warning')
      expect(pieceBarColor(15)).toBe('warning')
      expect(pieceBarColor(33)).toBe('warning')
    })
  })
})
