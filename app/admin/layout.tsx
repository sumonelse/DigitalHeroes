import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthProfile } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAuthProfile()
  if (!profile?.is_admin) redirect('/dashboard')

  const adminNav = [
    { href: '/admin', label: 'Overview', emoji: '📊' },
    { href: '/admin/users', label: 'Users', emoji: '👥' },
    { href: '/admin/draws', label: 'Draws', emoji: '🎯' },
    { href: '/admin/charities', label: 'Charities', emoji: '💚' },
    { href: '/admin/winners', label: 'Winners', emoji: '🏆' },
    { href: '/admin/analytics', label: 'Analytics', emoji: '📈' },
  ]

  return (
    <div className="min-h-screen bg-void">
      {/* Admin top bar */}
      <header className="sticky top-0 z-50 border-b border-violet/20 bg-depth/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-void bg-violet px-2 py-0.5 rounded-md uppercase tracking-wider">Admin</span>
                <span className="font-display text-lg font-bold text-white">Control Panel</span>
              </div>
              <div className="text-xs text-white/30">Digital Heroes Platform Management</div>
            </div>
          </div>
          <div className="text-xs text-white/30">
            Signed in as <span className="text-violet font-semibold">{profile.email}</span>
          </div>
        </div>

        {/* Admin nav tabs */}
        <div className="flex gap-1 px-6 pb-0 max-w-[1600px] mx-auto overflow-x-auto">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white border-b-2 border-transparent hover:border-violet/40 transition-all whitespace-nowrap"
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
