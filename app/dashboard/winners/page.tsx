import { createClient, getAuthUser } from '@/lib/supabase/server'
import { WinnersPortal } from '@/components/features/dashboard/WinnersPortal'

export const metadata = { title: 'My Winnings' }
export const dynamic = 'force-dynamic'

export default async function WinnersPage() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const { data: winners } = await supabase
    .from('winners')
    .select('*, draws(period_month, period_year, winning_numbers)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">My Winnings</h1>
        <p className="text-white/40 mt-1">Track your prizes, upload verification proof, and monitor payouts.</p>
      </div>
      <WinnersPortal winners={winners ?? []} userId={user.id} />
    </div>
  )
}
