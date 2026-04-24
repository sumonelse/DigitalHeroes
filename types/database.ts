export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: number
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charities: {
        Row: {
          category: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          featured_order: number | null
          id: string
          logo_url: string | null
          name: string
          registration_no: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["charity_status"]
          supporter_count: number
          total_raised_gbp: number
          upcoming_events: Json | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
          registration_no?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["charity_status"]
          supporter_count?: number
          total_raised_gbp?: number
          upcoming_events?: Json | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          registration_no?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["charity_status"]
          supporter_count?: number
          total_raised_gbp?: number
          upcoming_events?: Json | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      charity_contributions: {
        Row: {
          amount_gbp: number
          charity_id: string
          created_at: string
          id: string
          period_month: number
          period_year: number
          status: Database["public"]["Enums"]["payment_status"]
          stripe_transfer_id: string | null
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_gbp: number
          charity_id: string
          created_at?: string
          id?: string
          period_month: number
          period_year: number
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_transfer_id?: string | null
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_gbp?: number
          charity_id?: string
          created_at?: string
          id?: string
          period_month?: number
          period_year?: number
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_transfer_id?: string | null
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charity_contributions_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_contributions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_entries: {
        Row: {
          created_at: string
          draw_id: string
          id: string
          is_winner: boolean
          matched_count: number | null
          submitted_scores: number[]
          user_id: string
        }
        Insert: {
          created_at?: string
          draw_id: string
          id?: string
          is_winner?: boolean
          matched_count?: number | null
          submitted_scores: number[]
          user_id: string
        }
        Update: {
          created_at?: string
          draw_id?: string
          id?: string
          is_winner?: boolean
          matched_count?: number | null
          submitted_scores?: number[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_entries_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      draws: {
        Row: {
          admin_notes: string | null
          created_at: string
          draw_ran_at: string | null
          id: string
          logic_type: Database["public"]["Enums"]["draw_logic"]
          period_month: number
          period_year: number
          prize_pool_id: string | null
          published_at: string | null
          simulation_runs: number
          status: Database["public"]["Enums"]["draw_status"]
          total_entries: number
          total_winners: number
          updated_at: string
          winning_numbers: number[] | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          draw_ran_at?: string | null
          id?: string
          logic_type?: Database["public"]["Enums"]["draw_logic"]
          period_month: number
          period_year: number
          prize_pool_id?: string | null
          published_at?: string | null
          simulation_runs?: number
          status?: Database["public"]["Enums"]["draw_status"]
          total_entries?: number
          total_winners?: number
          updated_at?: string
          winning_numbers?: number[] | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          draw_ran_at?: string | null
          id?: string
          logic_type?: Database["public"]["Enums"]["draw_logic"]
          period_month?: number
          period_year?: number
          prize_pool_id?: string | null
          published_at?: string | null
          simulation_runs?: number
          status?: Database["public"]["Enums"]["draw_status"]
          total_entries?: number
          total_winners?: number
          updated_at?: string
          winning_numbers?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "draws_prize_pool_id_fkey"
            columns: ["prize_pool_id"]
            isOneToOne: false
            referencedRelation: "prize_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      golf_scores: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          score: number
          score_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          score: number
          score_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          score?: number
          score_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "golf_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_pools: {
        Row: {
          active_subscribers: number
          created_at: string
          id: string
          is_finalized: boolean
          jackpot_pool_gbp: number
          jackpot_rolled_over: boolean
          match3_pool_gbp: number
          match4_pool_gbp: number
          period_month: number
          period_year: number
          rollover_amount_gbp: number
          total_pool_gbp: number
          updated_at: string
        }
        Insert: {
          active_subscribers?: number
          created_at?: string
          id?: string
          is_finalized?: boolean
          jackpot_pool_gbp?: number
          jackpot_rolled_over?: boolean
          match3_pool_gbp?: number
          match4_pool_gbp?: number
          period_month: number
          period_year: number
          rollover_amount_gbp?: number
          total_pool_gbp?: number
          updated_at?: string
        }
        Update: {
          active_subscribers?: number
          created_at?: string
          id?: string
          is_finalized?: boolean
          jackpot_pool_gbp?: number
          jackpot_rolled_over?: boolean
          match3_pool_gbp?: number
          match4_pool_gbp?: number
          period_month?: number
          period_year?: number
          rollover_amount_gbp?: number
          total_pool_gbp?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          handicap: number | null
          home_club: string | null
          id: string
          is_admin: boolean
          onboarding_complete: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          handicap?: number | null
          home_club?: string | null
          id: string
          is_admin?: boolean
          onboarding_complete?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          handicap?: number | null
          home_club?: string | null
          id?: string
          is_admin?: boolean
          onboarding_complete?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      score_frequency_cache: {
        Row: {
          frequency: number
          last_updated: string
          score: number
          weight: number
        }
        Insert: {
          frequency?: number
          last_updated?: string
          score: number
          weight?: number
        }
        Update: {
          frequency?: number
          last_updated?: string
          score?: number
          weight?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          charity_percentage: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          monthly_fee_gbp: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          selected_charity_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          charity_percentage?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_fee_gbp?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          selected_charity_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          charity_percentage?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_fee_gbp?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          selected_charity_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_selected_charity_id_fkey"
            columns: ["selected_charity_id"]
            isOneToOne: false
            referencedRelation: "charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      winners: {
        Row: {
          created_at: string
          draw_entry_id: string
          draw_id: string
          id: string
          match_type: string
          paid_at: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          prize_amount_gbp: number
          proof_uploaded_at: string | null
          proof_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["winner_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draw_entry_id: string
          draw_id: string
          id?: string
          match_type: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          prize_amount_gbp: number
          proof_uploaded_at?: string | null
          proof_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["winner_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draw_entry_id?: string
          draw_id?: string
          id?: string
          match_type?: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          prize_amount_gbp?: number
          proof_uploaded_at?: string | null
          proof_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["winner_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winners_draw_entry_id_fkey"
            columns: ["draw_entry_id"]
            isOneToOne: false
            referencedRelation: "draw_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_subscribers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_subscribers_view: {
        Row: {
          charity_name: string | null
          charity_percentage: number | null
          country: string | null
          current_period_end: string | null
          email: string | null
          full_name: string | null
          id: string | null
          monthly_fee_gbp: number | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          score_count: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_jackpot_rollover: {
        Args: { p_new_pool_id: string }
        Returns: number
      }
      check_draw_eligibility: {
        Args: { p_user_id: string }
        Returns: Json
      }
      generate_draw_numbers: {
        Args: { p_logic?: Database["public"]["Enums"]["draw_logic"] }
        Returns: number[]
      }
      get_admin_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      get_user_scores: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          score: number
          score_date: string
        }[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      process_draw_results: {
        Args: { p_draw_id: string }
        Returns: Json
      }
      recalculate_prize_pool: {
        Args: { p_pool_id: string }
        Returns: undefined
      }
      submit_winner_proof: {
        Args: { p_proof_url: string; p_winner_id: string }
        Returns: undefined
      }
      update_charity_preference: {
        Args: { p_charity_id?: string; p_charity_percentage?: number }
        Returns: undefined
      }
    }
    Enums: {
      charity_status: "active" | "inactive" | "featured"
      draw_logic: "random" | "algorithmic"
      draw_status: "pending" | "simulating" | "published" | "archived"
      payment_status: "pending" | "paid" | "failed"
      subscription_plan: "monthly" | "yearly"
      subscription_status: "active" | "inactive" | "cancelled" | "past_due" | "trialing"
      winner_status: "pending" | "verified" | "rejected" | "paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      charity_status: ["active", "inactive", "featured"],
      draw_logic: ["random", "algorithmic"],
      draw_status: ["pending", "simulating", "published", "archived"],
      payment_status: ["pending", "paid", "failed"],
      subscription_plan: ["monthly", "yearly"],
      subscription_status: ["active", "inactive", "cancelled", "past_due", "trialing"],
      winner_status: ["pending", "verified", "rejected", "paid"],
    },
  },
} as const