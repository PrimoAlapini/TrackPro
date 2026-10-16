import { useQuery } from '@tanstack/react-query'
import { 
  getPublicDossiers, 
  getPublicPieces, 
  getPublicSuiviPieces, 
  getPublicMembers 
} from '@/lib/publicApi'
import type { Database } from '@/types/database'

type Dossier = Database['public']['Tables']['dossiers']['Row']
type Piece = Database['public']['Tables']['pieces']['Row']
type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']
type Membre = Database['public']['Tables']['membres']['Row']

export function usePublicDossiers() {
  return useQuery({
    queryKey: ['public-dossiers'],
    queryFn: async () => {
      const data = await getPublicDossiers()
      return (data as Dossier[]) || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePublicPieces(dossierId?: string) {
  return useQuery({
    queryKey: dossierId ? ['public-pieces', dossierId] : ['public-pieces'],
    queryFn: async () => {
      const data = await getPublicPieces(dossierId)
      return (data as Piece[]) || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicSuiviPieces(dossierId?: string) {
  return useQuery({
    queryKey: dossierId ? ['public-suivi', dossierId] : ['public-suivi'],
    queryFn: async () => {
      const data = await getPublicSuiviPieces(dossierId)
      return (data as SuiviPiece[]) || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicMembers() {
  return useQuery({
    queryKey: ['public-membres'],
    queryFn: async () => {
      const data = await getPublicMembers()
      return (data as Membre[]) || []
    },
    staleTime: 5 * 60 * 1000,
  })
}
