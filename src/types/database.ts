export type Database = {
  public: {
    Tables: {
      dossiers: {
        Row: {
          id: string
          user_id: string
          nom: string
          description: string | null
          date_debut: string
          date_limite: string
          responsable_collecte: string | null
          responsable_revue: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          nom: string
          description?: string | null
          date_debut: string
          date_limite: string
          responsable_collecte?: string | null
          responsable_revue?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom?: string
          description?: string | null
          date_debut?: string
          date_limite?: string
          responsable_collecte?: string | null
          responsable_revue?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pieces: {
        Row: {
          id: string
          dossier_id: string
          nom: string
          description: string | null
          ordre: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dossier_id: string
          nom: string
          description?: string | null
          ordre: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dossier_id?: string
          nom?: string
          description?: string | null
          ordre?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      membres: {
        Row: {
          id: string
          user_id: string
          nom: string
          couleur_avatar: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          nom: string
          couleur_avatar: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom?: string
          couleur_avatar?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dossier_membres: {
        Row: {
          dossier_id: string
          membre_id: string
          created_at: string
        }
        Insert: {
          dossier_id: string
          membre_id: string
          created_at?: string
        }
        Update: {
          dossier_id?: string
          membre_id?: string
          created_at?: string
        }
        Relationships: []
      }
      suivi_pieces: {
        Row: {
          id: string
          dossier_id: string
          piece_id: string
          membre_id: string
          statut: 'deposee' | 'en_cours' | 'non_deposee'
          date_depot: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dossier_id: string
          piece_id: string
          membre_id: string
          statut?: 'deposee' | 'en_cours' | 'non_deposee'
          date_depot?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dossier_id?: string
          piece_id?: string
          membre_id?: string
          statut?: 'deposee' | 'en_cours' | 'non_deposee'
          date_depot?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
