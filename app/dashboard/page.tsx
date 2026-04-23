import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/server'
import { getDrawEligibility } from '@/app/actions/scores'
import { DashboardOverview } from '@/components/features/dashboard/DashboardOverview'

export const metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const [
    { data: subscription },
    { data: scores },
    { data: currentDraw },
    { data: myEntry },
    { data: winners },
  ] = await Promise.all([
    supabase.from('subscriptions').select('*, charities(name, short_description)').eq('user_id', userId).single(),
    supabase.rpc('get_user_scores', { p_user_id: userId }),
    supabase.from('draws').select('*, prize_pools(*)').not('status', 'eq', 'archived').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('draw_entries').select('*, draws(period_month, period_year, winning_numbers, status)').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
    supabase.from('winners').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
  ])

  return { subscription, scores: scores ?? [], currentDraw, myEntry: myEntry ?? [], winners: winners ?? [] }
}

export default async function DashboardPage() {
  const user = await getAuthUser()
  const [data, eligibility] = await Promise.all([
    getDashboardData(user.id),
    getDrawEligibility().catch(() => null),
  ])

  return <DashboardOverview {...data} eligibility={eligibility} userId={user.id} />
}
