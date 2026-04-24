'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import type { Profile } from '@/types'
import { signOut } from '@/app/actions/auth'

const NAV_MOBILE = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/scores', label: 'Scores' },
  { href: '/dashboard/draws', label: 'Draws' },
  { href: '/dashboard/charities', label: 'Charity' },
  { href: '/dashboard/winners', label: 'Wins' },
]

export function DashboardMobileNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-depth/80 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="font-display text-lg font-bold text-white">Digital Heroes</Link>
        <button onClick={() => setMenuOpen(true)} className="text-white/60 hover:text-white transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-depth border-l border-white/10 z-50 flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-lg font-bold text-white">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {NAV_MOBILE.map(item => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-emerald/10 text-emerald border border-emerald/15' : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5">
                  Settings
                </Link>
              </nav>

              <div className="border-t border-white/10 pt-6">
                <div className="text-sm font-medium text-white mb-1">{profile.full_name}</div>
                <div className="text-xs text-white/40 mb-4">{profile.email}</div>
                <form action={signOut}>
                  <button type="submit" className="text-sm text-rose hover:text-rose/80 transition-colors">Sign out</button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom mobile tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-depth/90 backdrop-blur-xl border-t border-white/5 flex">
        {NAV_MOBILE.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                active ? 'text-emerald' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span className={`w-1 h-1 rounded-full mb-1 transition-all ${active ? 'bg-emerald scale-150' : 'bg-transparent'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
