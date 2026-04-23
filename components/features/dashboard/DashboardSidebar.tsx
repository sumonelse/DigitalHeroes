'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import type { Profile } from '@/types/database'
import { signOut } from '@/app/actions/auth'

interface Props { profile: Profile }

const NAV = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/scores',
    label: 'My Scores',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6M9 16h4M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 3h6v3H9V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/draws',
    label: 'Draws',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/charities',
    label: 'My Charity',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/winners',
    label: 'Winnings',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 15l-4 5h8l-4-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 5H5v8a7 7 0 0014 0V5h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

export function DashboardSidebar({ profile }: Props) {
  const pathname = usePathname()
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-depth/50 backdrop-blur-xl sticky top-0 h-screen">
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald to-[#00c4a0] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="7" r="5" stroke="#08080e" strokeWidth="2" />
              <path d="M7 7 L11 17 L15 7" stroke="#08080e" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white">Digital Heroes</div>
            <div className="text-[10px] font-semibold tracking-widest text-emerald uppercase">Golf With Purpose</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                active
                  ? 'bg-emerald/10 text-emerald border border-emerald/15'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-emerald/8 rounded-xl border border-emerald/15"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${active ? 'text-emerald' : 'group-hover:text-white/80'}`}>
                {item.icon}
              </span>
              <span className="relative z-10">{item.label}</span>
              {active && (
                <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-emerald" />
              )}
            </Link>
          )
        })}

        {profile.is_admin && (
          <div className="pt-4 border-t border-white/5">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith('/admin') ? 'bg-violet/10 text-violet border border-violet/15' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald/30 to-sapphire/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{profile.full_name ?? 'Player'}</div>
            <div className="text-xs text-white/30 truncate">{profile.email}</div>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-white/30 hover:text-white/70 transition-colors" title="Sign out">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
