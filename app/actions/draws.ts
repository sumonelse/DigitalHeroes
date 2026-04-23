'use server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient, getAuthUser } from '@/lib/supabase/server'
import { z } from 'zod'

export async function enterDraw(drawId: string) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    // Check eligibility
    const { data: eligibility } = await supabase.rpc('check_draw_eligibility', { p_user_id: user.id })
    if (!eligibility?.eligible) {
      const reason = !eligibility?.sub_active
        ? 'Active subscription required.'
        : `You need ${eligibility?.scores_needed} more score(s) to enter.`
      return { success: false, error: reason }
    }

    // Get current scores
    const { data: scores } = await supabase.rpc('get_user_scores', { p_user_id: user.id })
    if (!scores || scores.length !== 5) {
      return { success: false, error: 'You need exactly 5 scores to enter the draw.' }
    }

    const submittedScores = scores.map((s: any) => s.score)

    // Enter draw
    const { error } = await supabase.from('draw_entries').upsert({
      draw_id: drawId,
      user_id: user.id,
      submitted_scores: submittedScores,
    }, { onConflict: 'draw_id,user_id' })

    if (error) throw error

    revalidatePath('/draws')
    revalidatePath('/dashboard')
    return { success: true, scores: submittedScores }

  } catch (err) {
    console.error('[enterDraw]', err)
    return { success: false, error: 'Failed to enter draw.' }
  }
}

export async function getActiveDrawWithEntry() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const { data: draw } = await supabase
    .from('draws')
    .select('*, prize_pools(*)')
    .not('status', 'eq', 'archived')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!draw) return { draw: null, entry: null, eligibility: null }

  const { data: entry } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', draw.id)
    .eq('user_id', user.id)
    .single()

  const { data: eligibility } = await supabase.rpc('check_draw_eligibility', { p_user_id: user.id })

  return { draw, entry: entry ?? null, eligibility }
}

// ── Admin Actions ─────────────────────────────────────────────

export async function adminRunDrawSimulation(drawId: string) {
  const user = await getAuthUser()
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { success: false, error: 'Admin only.' }

  const serviceClient = await createServiceClient()

  // Get draw logic
  const { data: draw } = await serviceClient.from('draws').select('logic_type').eq('id', drawId).single()
  if (!draw) return { success: false, error: 'Draw not found.' }

  // Generate simulation numbers
  const { data: numbers } = await serviceClient.rpc('generate_draw_numbers', { p_logic: draw.logic_type })

  // Store simulation result (don't save to winning_numbers yet)
  await serviceClient.from('draws').update({
    simulation_runs: serviceClient.sql`simulation_runs + 1`,
    status: 'simulating',
    admin_notes: `Last sim: [${numbers?.join(', ')}]`,
  }).eq('id', drawId)

  revalidatePath('/admin/draws')
  return { success: true, numbers }
}

export async function adminPublishDraw(drawId: string, confirmedNumbers?: number[]) {
  const user = await getAuthUser()
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { success: false, error: 'Admin only.' }

  const serviceClient = await createServiceClient()

  // Generate final numbers if not provided
  let winningNumbers = confirmedNumbers
  if (!winningNumbers) {
    const { data: draw } = await serviceClient.from('draws').select('logic_type').eq('id', drawId).single()
    const { data: numbers } = await serviceClient.rpc('generate_draw_numbers', { p_logic: draw?.logic_type ?? 'random' })
    winningNumbers = numbers
  }

  // Set winning numbers
  await serviceClient.from('draws').update({
    winning_numbers: winningNumbers,
    draw_ran_at: new Date().toISOString(),
  }).eq('id', drawId)

  // Process results
  const { data: results } = await serviceClient.rpc('process_draw_results', { p_draw_id: drawId })

  // Handle jackpot rollover
  const next = await serviceClient.from('prize_pools')
    .select('id, rollover_amount_gbp')
    .eq('period_month', new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2)
    .eq('period_year', new Date().getMonth() + 2 > 12 ? new Date().getFullYear() + 1 : new Date().getFullYear())
    .single()

  if ((results as any)?.jackpot_rolled && next.data) {
    const { data: currentPool } = await serviceClient.from('prize_pools').select('jackpot_pool_gbp').eq('id', (await serviceClient.from('draws').select('prize_pool_id').eq('id', drawId).single()).data?.prize_pool_id ?? '').single()
    if (currentPool) {
      await serviceClient.from('prize_pools').update({
        rollover_amount_gbp: next.data.rollover_amount_gbp + currentPool.jackpot_pool_gbp,
      }).eq('id', next.data.id)
    }
  }

  // Publish
  await serviceClient.from('draws').update({
    status: 'published',
    published_at: new Date().toISOString(),
  }).eq('id', drawId)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'draw_published',
    table_name: 'draws',
    record_id: drawId,
    new_data: { winning_numbers: winningNumbers, results },
  })

  revalidatePath('/admin/draws')
  revalidatePath('/draws')
  revalidatePath('/dashboard')
  return { success: true, winningNumbers, results }
}

export async function adminUpdateDrawLogic(drawId: string, logic: 'random' | 'algorithmic') {
  const user = await getAuthUser()
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { success: false, error: 'Admin only.' }

  await supabase.from('draws').update({ logic_type: logic }).eq('id', drawId)
  revalidatePath('/admin/draws')
  return { success: true }
}
