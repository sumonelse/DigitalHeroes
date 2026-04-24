import type { Database } from './database'
export type { Json, Database } from './database'
export type Enums = Database['public']['Enums']

export type SubscriptionPlan = 'monthly' | 'yearly'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type Charity = Database['public']['Tables']['charities']['Row']
export type CharityInsert = Database['public']['Tables']['charities']['Insert']
export type CharityUpdate = Database['public']['Tables']['charities']['Update']

export type GolfScore = Database['public']['Tables']['golf_scores']['Row']
export type GolfScoreInsert = Database['public']['Tables']['golf_scores']['Insert']
export type GolfScoreUpdate = Database['public']['Tables']['golf_scores']['Update']

export type Draw = Database['public']['Tables']['draws']['Row']
export type DrawInsert = Database['public']['Tables']['draws']['Insert']
export type DrawUpdate = Database['public']['Tables']['draws']['Update']

export type DrawEntry = Database['public']['Tables']['draw_entries']['Row']
export type DrawEntryInsert = Database['public']['Tables']['draw_entries']['Insert']

export type PrizePool = Database['public']['Tables']['prize_pools']['Row']
export type PrizePoolInsert = Database['public']['Tables']['prize_pools']['Insert']
export type PrizePoolUpdate = Database['public']['Tables']['prize_pools']['Update']

export type Winner = Database['public']['Tables']['winners']['Row']
export type WinnerInsert = Database['public']['Tables']['winners']['Insert']
export type WinnerUpdate = Database['public']['Tables']['winners']['Update']