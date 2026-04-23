import { createClient, getAuthUser } from '@/lib/supabase/server'
import { SettingsPanel } from '@/components/features/dashboard/SettingsPanel'

export const metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*, charities(name)').eq('user_id', user.id).single(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Settings</h1>
        <p className="text-white/40 mt-1">Manage your account, subscription, and preferences.</p>
      </div>
      <SettingsPanel profile={profile!} subscription={subscription} />
    </div>
  )
}
