import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Membre = Database['public']['Tables']['membres']['Row']
type MembreInsert = Database['public']['Tables']['membres']['Insert']

export function useMembers() {
  return useQuery({
    queryKey: ['membres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .order('nom', { ascending: true })

      if (error) {
        console.warn('Error fetching members:', error)
        return []
      }
      return data as Membre[]
    },
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['membres', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Membre
    },
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (membre: MembreInsert) => {
      const { data, error } = await supabase
        .from('membres')
        .insert([membre])
        .select()
        .single()

      if (error) throw error
      return data as Membre
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
    },
  })
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (membre: Database['public']['Tables']['membres']['Update']) => {
      if (!id) throw new Error('Member ID is required')
      const { data, error } = await supabase
        .from('membres')
        .update(membre)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Membre
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
    },
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('membres')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
    },
  })
}
