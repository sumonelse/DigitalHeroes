'use server'
import { revalidatePath } from 'next/cache'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { z } from 'zod'

const ScoreSchema = z.object({
  score: z.number().int().min(1).max(45, 'Score must be between 1 and 45'),
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  notes: z.string().max(200).optional(),
})

export type ScoreActionResult = {
  success: boolean
  error?: string
  data?: { id: string; score: number; score_date: string; created_at: string }
}

export async function addScore(formData: FormData): Promise<ScoreActionResult> {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    const parsed = ScoreSchema.safeParse({
      score: Number(formData.get('score')),
      score_date: formData.get('score_date'),
      notes: formData.get('notes') || undefined,
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    // Verify active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (!sub || sub.status !== 'active') {
      return { success: false, error: 'Active subscription required to log scores.' }
    }

    // Check for duplicate date (unique constraint will also catch this)
    const { data: existing } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('score_date', parsed.data.score_date)
      .single()

    if (existing) {
      return { success: false, error: 'A score already exists for this date. Please edit or delete it first.' }
    }

    // Insert — rolling 5-score trigger handles pruning
    const { data, error } = await supabase
      .from('golf_scores')
      .insert({
        user_id: user.id,
        score: parsed.data.score,
        score_date: parsed.data.score_date,
        notes: parsed.data.notes,
      })
      .select('id, score, score_date')
      .single()

    if (error) throw error

    revalidatePath('/scores')
    revalidatePath('/dashboard')
    return { success: true, data: data! }

  } catch (err) {
    console.error('[addScore]', err)
    return { success: false, error: 'Failed to save score. Please try again.' }
  }
}

export async function updateScore(
  scoreId: string,
  formData: FormData
): Promise<ScoreActionResult> {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    const parsed = ScoreSchema.safeParse({
      score: Number(formData.get('score')),
      score_date: formData.get('score_date'),
      notes: formData.get('notes') || undefined,
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    // If date is changing, check for conflict
    const { data: current } = await supabase
      .from('golf_scores')
      .select('score_date')
      .eq('id', scoreId)
      .eq('user_id', user.id)
      .single()

    if (!current) return { success: false, error: 'Score not found.' }

    if (current.score_date !== parsed.data.score_date) {
      const { data: conflict } = await supabase
        .from('golf_scores')
        .select('id')
        .eq('user_id', user.id)
        .eq('score_date', parsed.data.score_date)
        .neq('id', scoreId)
        .single()

      if (conflict) {
        return { success: false, error: 'A score already exists for this date.' }
      }
    }

    const { data, error } = await supabase
      .from('golf_scores')
      .update({
        score: parsed.data.score,
        score_date: parsed.data.score_date,
        notes: parsed.data.notes,
      })
      .eq('id', scoreId)
      .eq('user_id', user.id) // RLS double-check
      .select('id, score, score_date')
      .single()

    if (error) throw error

    revalidatePath('/scores')
    revalidatePath('/dashboard')
    return { success: true, data: data! }

  } catch (err) {
    console.error('[updateScore]', err)
    return { success: false, error: 'Failed to update score.' }
  }
}

export async function deleteScore(scoreId: string): Promise<ScoreActionResult> {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    const { error } = await supabase
      .from('golf_scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/scores')
    revalidatePath('/dashboard')
    return { success: true }

  } catch (err) {
    console.error('[deleteScore]', err)
    return { success: false, error: 'Failed to delete score.' }
  }
}

export async function getUserScores() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_user_scores', { p_user_id: user.id })
  if (error) throw error
  return data ?? []
}

export async function getDrawEligibility() {
  const user = await getAuthUser()
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('check_draw_eligibility', { p_user_id: user.id })
  if (error) throw error
  return data as { eligible: boolean; sub_active: boolean; score_count: number; scores_needed: number }
}
