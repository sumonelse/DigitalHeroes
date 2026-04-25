'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitWinnerProof(winnerId: string, proofUrl: string) {
  const supabase = await createClient()

  if (!proofUrl || !proofUrl.trim()) {
    return { success: false, error: 'Proof URL is required.' }
  }

  const { error } = await supabase.rpc('submit_winner_proof', {
    p_winner_id: winnerId,
    p_proof_url: proofUrl.trim(),
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/winners')
  return { success: true }
}