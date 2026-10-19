import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Dossier = Database["public"]["Tables"]["dossiers"]["Row"];
type DossierInsert = Database["public"]["Tables"]["dossiers"]["Insert"];

export function useDossiers() {
  return useQuery({
    queryKey: ["dossiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Error fetching dossiers:", error);
        // Return empty array on error to allow public access to work
        return [];
      }
      return data as Dossier[];
    },
  });
}

export function useDossier(id: string) {
  return useQuery({
    queryKey: ["dossiers", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Dossier;
    },
  });
}

export function useCreateDossier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dossier: DossierInsert) => {
      const { data, error } = await (supabase.from("dossiers") as any).insert(
        [dossier]).select().single();

      if (error) throw error;
      return data as Dossier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useUpdateDossier(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      dossier: Database["public"]["Tables"]["dossiers"]["Update"],
    ) => {
      if (!id) throw new Error("Dossier ID is required");
      const { data, error } = await (supabase.from('dossiers') as any)
        .update(dossier as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Dossier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useDeleteDossier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dossiers").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}
