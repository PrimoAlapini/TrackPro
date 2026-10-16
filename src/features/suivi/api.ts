import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type SuiviPiece = Database['public']['Tables']['suivi_pieces']['Row']

export function useSuiviPieces(dossierId: string | undefined = undefined) {
  return useQuery({
    queryKey: dossierId ? ['suivi', dossierId] : ['suivi'],
    enabled: true, // Always enabled, can be undefined to get all
    queryFn: async () => {
      let query = supabase.from('suivi_pieces').select('*')
      
      if (dossierId) {
        query = query.eq('dossier_id', dossierId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error fetching suivi pieces:', error)
        return []
      }
      return data as SuiviPiece[]
    },
  })
}

export function useUpdateSuiviPiece(suiviId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      update: Database['public']['Tables']['suivi_pieces']['Update']
    ) => {
      if (!suiviId) throw new Error('Suivi ID is required')
      const { data, error } = await supabase
        .from('suivi_pieces')
        .update(update)
        .eq('id', suiviId)
        .select()
        .single()

      if (error) throw error
      return data as SuiviPiece
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suivi', data.dossier_id] })
    },
  })
}

/**
 * Update suivi piece with ID passed in mutation (not hook init)
 * Useful when ID is dynamic/unknown at hook call time
 */
export function useUpdateSuiviPieceDynamic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      suiviId,
      update,
    }: {
      suiviId: string
      update: Database['public']['Tables']['suivi_pieces']['Update']
    }) => {
      if (!suiviId) throw new Error('Suivi ID is required')
      const { data, error } = await supabase
        .from('suivi_pieces')
        .update(update)
        .eq('id', suiviId)
        .select()
        .single()

      if (error) throw error
      return data as SuiviPiece
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suivi', data.dossier_id] })
      queryClient.invalidateQueries({ queryKey: ['suivi'] })
      queryClient.invalidateQueries({ queryKey: ['dossiers'] })
      queryClient.invalidateQueries({ queryKey: ['membres'] })
    },
  })
}

export function useAddMemberToDossier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dossierId,
      memberId,
    }: {
      dossierId: string
      memberId: string
    }) => {
      const { error } = await supabase
        .from('dossier_membres')
        .insert([{ dossier_id: dossierId, membre_id: memberId }])

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suivi', variables.dossierId] })
      queryClient.invalidateQueries({ queryKey: ['suivi'] })
      queryClient.invalidateQueries({ queryKey: ['dossiers'] })
      queryClient.invalidateQueries({ queryKey: ['dossier_members', variables.dossierId] })
      queryClient.invalidateQueries({ queryKey: ['membres'] })
    },
  })
}

export function useRemoveMemberFromDossier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dossierId,
      memberId,
    }: {
      dossierId: string
      memberId: string
    }) => {
      const { error } = await supabase
        .from('dossier_membres')
        .delete()
        .eq('dossier_id', dossierId)
        .eq('membre_id', memberId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suivi', variables.dossierId] })
      queryClient.invalidateQueries({ queryKey: ['suivi'] })
      queryClient.invalidateQueries({ queryKey: ['dossiers'] })
      queryClient.invalidateQueries({ queryKey: ['dossier_members', variables.dossierId] })
      queryClient.invalidateQueries({ queryKey: ['membres'] })
    },
  })
}

export function useDossierMembers(dossierId: string | undefined) {
  return useQuery({
    queryKey: ['dossier_members', dossierId],
    enabled: !!dossierId,
    queryFn: async () => {
      if (!dossierId) throw new Error('Dossier ID is required')
      const { data, error } = await supabase
        .from('dossier_membres')
        .select('membre_id')
        .eq('dossier_id', dossierId)

      if (error) throw error
      return data.map((dm: any) => dm.membre_id)
    },
  })
}
