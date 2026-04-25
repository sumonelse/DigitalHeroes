'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types'

export type ProfileUpdateResult = { success: boolean; error?: string }

export async function updateProfile(data: {
  full_name?: string
  phone?: string
  home_club?: string
  handicap?: number | null
  onboarding_complete?: boolean
}): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Failed to update profile' }
  }
}