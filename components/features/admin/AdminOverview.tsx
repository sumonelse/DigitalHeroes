'use client'
import { motion } from 'motion/react'
import Link from 'next/link'
import { adminCreateNextMonthPool } from '@/app/actions/admin'
import { useState } from 'react'

interface Stats {
  total_users: number
  active_subscribers: number
  total_charity_raised: number
  current_prize_pool: number
  pending_winners: number
  total_draws_run: number
}

interface RevenueMonth {
  period_month: number
  period_year: number
  total_pool_gbp: number
  active_subscribers: number
}

interface Props { stats: Stats | null; revenue: RevenueMonth[] }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function AdminOverview({ stats, revenue }: Props) {
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  const handleCreatePool = async () => {
    setCreating(true)
    const result = await adminCreateNextMonthPool()
    setMsg(result.success ? '✓ Next month pool created!' : `Error: ${(result as any).error}`)
    setCreating(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const statCards = [
    { label: 'Total Users',         value: stats?.total_users ?? 0,          color: 'white',   icon: '👥', href: '/admin/users' },
    { label: 'Active Subscribers',  value: stats?.active_subscribers ?? 0,   color: 'emerald', icon: '✅', href: '/admin/users' },
    { label: 'Charity Raised',      value: `₹${(stats?.total_charity_raised ?? 0).toFixed(0)}`, color: 'gold', icon: '💚', href: '/admin/charities' },
    { label: 'Current Prize Pool',  value: `₹${(stats?.current_prize_pool ?? 0).toFixed(0)}`, color: 'sapphire', icon: '🎯', href: '/admin/draws' },
    { label: 'Pending Winners',     value: stats?.pending_winners ?? 0,      color: stats?.pending_winners ? 'rose' : 'white', icon: '🏆', href: '/admin/winners' },
    { label: 'Total Draws Run',     value: stats?.total_draws_run ?? 0,      color: 'violet', icon: '📋', href: '/admin/draws' },
  ]

  const maxPool = Math.max(...revenue.map(r => r.total_pool_gbp), 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Platform Overview</h1>
          <p className="text-white/40 mt-1">Real-time stats and controls for Digital Heroes.</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-emerald"
            >
              {msg}
            </motion.span>
          )}
          <button
            onClick={handleCreatePool}
            disabled={creating}
            className="btn-primary py-2.5 px-5 text-sm disabled:opacity-60"
          >
            {creating ? 'Creating…' : '+ Create Next Month Pool'}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={card.href} className={`block glass rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 ${
              card.color === 'emerald' ? 'hover:glass-emerald' :
              card.color === 'gold'    ? 'hover:glass-gold' :
              card.color === 'rose'    ? 'hover:border-rose/30 hover:bg-rose/5' :
              'hover:border-white/15'
            }`}>
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className={`font-display text-2xl font-bold mb-1 ${
                card.color === 'emerald'  ? 'text-emerald' :
                card.color === 'gold'     ? 'text-gold' :
                card.color === 'sapphire' ? 'text-[#4488ff]' :
                card.color === 'violet'   ? 'text-violet' :
                card.color === 'rose'     ? 'text-rose' :
                'text-white'
              }`}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              <div className="text-xs text-white/40 leading-tight">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      {revenue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-card p-6 mb-6"
        >
          <h2 className="font-display text-xl font-bold text-white mb-6">Prize Pool — Last 6 Months</h2>
          <div className="flex items-end gap-3 h-40">
            {[...revenue].reverse().map((m, i) => {
              const pct = (m.total_pool_gbp / maxPool) * 100
              return (
                <div key={`${m.period_year}-${m.period_month}`} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-white/50 font-mono">₹{Math.floor(m.total_pool_gbp / 100000)}L</div>
                  <div className="w-full flex items-end" style={{ height: '100px' }}>
                    <motion.div
                      className="w-full bg-gradient-to-t from-emerald to-emerald/40 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="text-xs text-white/30">{MONTHS[m.period_month - 1]}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/draws', label: 'Manage Draws', desc: 'Run simulations and publish results', icon: '🎯', color: 'emerald' },
          { href: '/admin/winners', label: 'Verify Winners', desc: `${stats?.pending_winners ?? 0} pending reviews`, icon: '🏆', color: 'gold' },
          { href: '/admin/users', label: 'User Management', desc: 'Edit profiles and subscriptions', icon: '👥', color: 'sapphire' },
          { href: '/admin/charities', label: 'Charity Directory', desc: 'Add and manage charity listings', icon: '💚', color: 'violet' },
        ].map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.07 }}
          >
            <Link href={action.href} className="block glass rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 h-full group">
              <div className="text-3xl mb-4">{action.icon}</div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-emerald transition-colors">{action.label}</h3>
              <p className="text-xs text-white/40">{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
