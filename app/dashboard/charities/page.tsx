import { createClient, getAuthUser } from '@/lib/supabase/server'
import { CharitySelector } from '@/components/features/charities/CharitySelector'

export const metadata = { title: 'Choose Your Charity' }
export const dynamic = 'force-dynamic'

export default async function CharitiesPage() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const [{ data: charities }, { data: subscription }] = await Promise.all([
    supabase.from('charities').select('*').neq('status', 'inactive').order('featured_order', { ascending: true, nullsFirst: false }),
    supabase.from('subscriptions').select('selected_charity_id, charity_percentage').eq('user_id', user.id).single(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Your Charity</h1>
        <p className="text-white/40 mt-1">
          Choose who benefits from your subscription. Minimum 10% goes to your chosen cause.
        </p>
      </div>
      <CharitySelector
        charities={charities ?? []}
        selectedId={subscription?.selected_charity_id ?? null}
        percentage={subscription?.charity_percentage ?? 10}
      />
    </div>
  )
}
