import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Piece = Database['public']['Tables']['pieces']['Row']
type PieceInsert = Database['public']['Tables']['pieces']['Insert']

export function usePieces(dossierId?: string) {
  return useQuery({
    queryKey: dossierId ? ['pieces', dossierId] : ['pieces'],
    queryFn: async () => {
      let query = supabase.from('pieces').select('*').order('ordre', { ascending: true })
      
      if (dossierId) {
        query = query.eq('dossier_id', dossierId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error fetching pieces:', error)
        return []
      }
      return data as Piece[]
    },
  })
}

export function usePiece(id: string) {
  return useQuery({
    queryKey: ['pieces', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pieces')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Piece
    },
  })
}

export function useCreatePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (piece: PieceInsert) => {
      const { data, error } = await supabase
        .from('pieces')
        .insert([piece])
        .select()
        .single()

      if (error) throw error
      return data as Piece
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] })
      queryClient.invalidateQueries({ queryKey: ['suivi', data.dossier_id] })
      queryClient.invalidateQueries({ queryKey: ['suivi'] })
    },
  })
}

export function useUpdatePiece(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (piece: Database['public']['Tables']['pieces']['Update']) => {
      if (!id) throw new Error('Piece ID is required')
      const { data, error } = await supabase
        .from('pieces')
        .update(piece)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Piece
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] })
    },
  })
}

export function useDeletePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pieces')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] })
    },
  })
}

export function useUpdatePiecesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pieces: Array<{ id: string; ordre: number }>) => {
      const updates = pieces.map(p =>
        supabase.from('pieces').update({ ordre: p.ordre }).eq('id', p.id)
      )
      await Promise.all(updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] })
    },
  })
}
