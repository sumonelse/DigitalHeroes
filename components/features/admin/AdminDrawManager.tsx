'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Draw, PrizePool } from '@/types/database'
import { adminRunDrawSimulation, adminPublishDraw, adminUpdateDrawLogic } from '@/app/actions/draws'

interface DrawWithPool extends Draw { prize_pools: PrizePool | null }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function DrawBall({ number, delay = 0 }: { number: number; delay?: number }) {
  return (
    <motion.div
      className="draw-ball"
      initial={{ y: -40, opacity: 0, scale: 0.5 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      {String(number).padStart(2, '0')}
    </motion.div>
  )
}

export function AdminDrawManager({ draws }: { draws: DrawWithPool[] }) {
  const [simNumbers, setSimNumbers] = useState<Record<string, number[]>>({})
  const [loading, setLoading] = useState<Record<string, string>>({})
  const [published, setPublished] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setStatus = (id: string, status: string) =>
    setLoading(prev => ({ ...prev, [id]: status }))

  const handleSimulate = async (draw: DrawWithPool) => {
    setStatus(draw.id, 'simulating')
    setErrors(prev => ({ ...prev, [draw.id]: '' }))
    const result = await adminRunDrawSimulation(draw.id)
    if (result.success && result.numbers) {
      setSimNumbers(prev => ({ ...prev, [draw.id]: result.numbers! }))
    } else {
      setErrors(prev => ({ ...prev, [draw.id]: result.error ?? 'Simulation failed' }))
    }
    setStatus(draw.id, '')
  }

  const handlePublish = async (draw: DrawWithPool, numbers?: number[]) => {
    if (!confirm(`Publish draw for ${MONTHS[draw.period_month - 1]} ${draw.period_year}? This cannot be undone.`)) return
    setStatus(draw.id, 'publishing')
    const result = await adminPublishDraw(draw.id, numbers)
    if (result.success) {
      setPublished(prev => ({ ...prev, [draw.id]: true }))
    } else {
      setErrors(prev => ({ ...prev, [draw.id]: (result as any).error ?? 'Publish failed' }))
    }
    setStatus(draw.id, '')
  }

  const handleLogicChange = async (drawId: string, logic: 'random' | 'algorithmic') => {
    await adminUpdateDrawLogic(drawId, logic)
  }

  return (
    <div className="space-y-6">
      {draws.map((draw, idx) => {
        const isPublished = published[draw.id] || draw.status === 'published'
        const isBusy      = !!loading[draw.id]
        const simNums     = simNumbers[draw.id]
        const pool        = draw.prize_pools
        const monthLabel  = `${MONTHS[draw.period_month - 1]} ${draw.period_year}`

        return (
          <motion.div
            key={draw.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`glass rounded-card overflow-hidden ${
              isPublished ? 'border-emerald/20' : draw.status === 'pending' ? 'border-gold/15' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-display text-xl font-bold text-white">{monthLabel}</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isPublished            ? 'bg-emerald/10 text-emerald' :
                    draw.status === 'simulating' ? 'bg-gold/10 text-gold' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {isPublished ? 'Published' : draw.status}
                  </span>
                  {draw.simulation_runs > 0 && (
                    <span className="text-xs text-white/30">{draw.simulation_runs} sim{draw.simulation_runs > 1 ? 's' : ''} run</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span>{draw.total_entries} entries</span>
                  <span>·</span>
                  <span>{draw.total_winners} winners</span>
                  {pool && <><span>·</span><span>Pool: ₹{Math.floor(pool.total_pool_gbp).toLocaleString('en-IN')}</span></>}
                </div>
              </div>

              {/* Logic toggle */}
              {!isPublished && (
                <div className="flex items-center gap-2 glass rounded-xl p-1">
                  {(['random', 'algorithmic'] as const).map(logic => (
                    <button
                      key={logic}
                      onClick={() => handleLogicChange(draw.id, logic)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        draw.logic_type === logic
                          ? 'bg-emerald/20 text-emerald border border-emerald/30'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {logic === 'random' ? '🎲 Random' : '📊 Algorithmic'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prize pool breakdown */}
            {pool && (
              <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
                {[
                  { label: 'Jackpot (40%)', val: pool.jackpot_pool_gbp, color: 'text-gold' },
                  { label: '4-Match (35%)', val: pool.match4_pool_gbp, color: 'text-emerald' },
                  { label: '3-Match (25%)', val: pool.match3_pool_gbp, color: 'text-[#4488ff]' },
                ].map(tier => (
                  <div key={tier.label} className="bg-depth/40 px-6 py-4">
                    <div className={`font-display text-xl font-bold ${tier.color}`}>
                      ₹{Math.floor(tier.val).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{tier.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {isPublished && draw.winning_numbers ? (
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Winning Numbers</p>
                  <div className="flex gap-3">
                    {draw.winning_numbers.map((n, i) => (
                      <DrawBall key={i} number={n} delay={i * 0.08} />
                    ))}
                  </div>
                  <p className="text-xs text-white/30 mt-4">
                    Published {draw.published_at ? new Date(draw.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Simulation results */}
                  <AnimatePresence>
                    {simNums && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-gold rounded-2xl p-5"
                      >
                        <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">
                          Simulation Result — {draw.logic_type === 'algorithmic' ? 'Weighted' : 'Random'}
                        </p>
                        <div className="flex gap-3 mb-3">
                          {simNums.map((n, i) => <DrawBall key={i} number={n} delay={i * 0.1} />)}
                        </div>
                        <p className="text-xs text-white/40">
                          This is a preview. Simulate again for different numbers, or publish these.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors[draw.id] && (
                    <p className="text-rose text-sm bg-rose/10 border border-rose/20 rounded-xl px-4 py-3">
                      {errors[draw.id]}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleSimulate(draw)}
                      disabled={isBusy}
                      className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading[draw.id] === 'simulating' ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : '🎲'}
                      Run Simulation
                    </button>

                    <button
                      onClick={() => handlePublish(draw, simNums)}
                      disabled={isBusy}
                      className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading[draw.id] === 'publishing' ? '⏳ Publishing…' : '🚀 Publish Draw'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}

      {draws.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl">No draws yet.</p>
          <p className="text-sm mt-2">Create a prize pool from the Overview page to get started.</p>
        </div>
      )}
    </div>
  )
}
