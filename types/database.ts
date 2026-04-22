// Auto-generated TypeScript types from Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          country: string | null
          handicap: number | null
          home_club: string | null
          is_admin: boolean
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan: 'monthly' | 'yearly'
          status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          trial_end: string | null
          monthly_fee_gbp: number
          charity_percentage: number
          selected_charity_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      golf_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          score_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['golf_scores']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['golf_scores']['Insert']>
      }
      charities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          logo_url: string | null
          cover_image_url: string | null
          website_url: string | null
          registration_no: string | null
          country: string | null
          category: string | null
          status: 'active' | 'inactive' | 'featured'
          featured_order: number | null
          total_raised_gbp: number
          supporter_count: number
          upcoming_events: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['charities']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['charities']['Insert']>
      }
      draws: {
        Row: {
          id: string
          prize_pool_id: string | null
          period_month: number
          period_year: number
          status: 'pending' | 'simulating' | 'published' | 'archived'
          logic_type: 'random' | 'algorithmic'
          winning_numbers: number[] | null
          draw_ran_at: string | null
          published_at: string | null
          simulation_runs: number
          total_entries: number
          total_winners: number
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['draws']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['draws']['Insert']>
      }
      draw_entries: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          submitted_scores: number[]
          matched_count: number | null
          is_winner: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['draw_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['draw_entries']['Insert']>
      }
      winners: {
        Row: {
          id: string
          draw_id: string
          draw_entry_id: string
          user_id: string
          match_type: '5-match' | '4-match' | '3-match'
          prize_amount_gbp: number
          status: 'pending' | 'verified' | 'rejected' | 'paid'
          proof_url: string | null
          proof_uploaded_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          review_notes: string | null
          payment_status: 'pending' | 'paid' | 'failed'
          payment_reference: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['winners']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['winners']['Insert']>
      }
      prize_pools: {
        Row: {
          id: string
          period_month: number
          period_year: number
          total_pool_gbp: number
          jackpot_pool_gbp: number
          match4_pool_gbp: number
          match3_pool_gbp: number
          active_subscribers: number
          jackpot_rolled_over: boolean
          rollover_amount_gbp: number
          is_finalized: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['prize_pools']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['prize_pools']['Insert']>
      }
      platform_settings: {
        Row: { key: string; value: Json; description: string | null; updated_by: string | null; updated_at: string }
        Insert: Omit<Database['public']['Tables']['platform_settings']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['platform_settings']['Insert']>
      }
    }
    Functions: {
      get_user_scores: { Args: { p_user_id: string }; Returns: { id: string; score: number; score_date: string; created_at: string }[] }
      check_draw_eligibility: { Args: { p_user_id: string }; Returns: Json }
      get_admin_stats: { Args: Record<string, never>; Returns: Json }
      generate_draw_numbers: { Args: { p_logic: 'random' | 'algorithmic' }; Returns: number[] }
      process_draw_results: { Args: { p_draw_id: string }; Returns: Json }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type GolfScore = Database['public']['Tables']['golf_scores']['Row']
export type Charity = Database['public']['Tables']['charities']['Row']
export type Draw = Database['public']['Tables']['draws']['Row']
export type DrawEntry = Database['public']['Tables']['draw_entries']['Row']
export type Winner = Database['public']['Tables']['winners']['Row']
export type PrizePool = Database['public']['Tables']['prize_pools']['Row']

export type SubscriptionPlan = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
export type DrawStatus = 'pending' | 'simulating' | 'published' | 'archived'
export type WinnerStatus = 'pending' | 'verified' | 'rejected' | 'paid'
