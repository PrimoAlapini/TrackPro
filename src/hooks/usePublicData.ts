import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Dossier = Database['public']['Tables']['dossiers']['Row']
type Piece = Database['public']['Tables']['pieces']['Row']
type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']
type Membre = Database['public']['Tables']['membres']['Row']

/**
 * Public hooks - use direct Supabase queries with better error handling
 * These will work if RLS policies allow anonymous reads
 */

export function usePublicDossiers() {
  return useQuery({
    queryKey: ['public-dossiers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('dossiers')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('RLS may be blocking public access to dossiers:', error.message)
          return []
        }
        return (data as Dossier[]) || []
      } catch (error) {
        console.error('Error fetching public dossiers:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

export function usePublicPieces(dossierId?: string) {
  return useQuery({
    queryKey: dossierId ? ['public-pieces', dossierId] : ['public-pieces'],
    queryFn: async () => {
      try {
        let query = supabase
          .from('pieces')
          .select('*')
          .order('ordre', { ascending: true })
        
        if (dossierId) {
          query = query.eq('dossier_id', dossierId)
        }

        const { data, error } = await query

        if (error) {
          console.warn('RLS may be blocking public access to pieces:', error.message)
          return []
        }
        return (data as Piece[]) || []
      } catch (error) {
        console.error('Error fetching public pieces:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function usePublicSuiviPieces(dossierId?: string) {
  return useQuery({
    queryKey: dossierId ? ['public-suivi', dossierId] : ['public-suivi'],
    queryFn: async () => {
      try {
        let query = supabase.from('suivi_pieces').select('*')
        
        if (dossierId) {
          query = query.eq('dossier_id', dossierId)
        }

        const { data, error } = await query

        if (error) {
          console.warn('RLS may be blocking public access to suivi_pieces:', error.message)
          return []
        }
        return (data as SuiviPiece[]) || []
      } catch (error) {
        console.error('Error fetching public suivi pieces:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function usePublicMembers() {
  return useQuery({
    queryKey: ['public-membres'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('membres')
          .select('*')
          .order('nom', { ascending: true })

        if (error) {
          console.warn('RLS may be blocking public access to membres:', error.message)
          return []
        }
        return (data as Membre[]) || []
      } catch (error) {
        console.error('Error fetching public members:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
