'use client'
import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { enterDraw } from '@/app/actions/draws'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Draw {
  id: string
  period_month: number
  period_year: number
  status: string
  winning_numbers: number[] | null
  prize_pools: {
    jackpot_pool_gbp: number
    match4_pool_gbp: number
    match3_pool_gbp: number
    jackpot_rolled_over: boolean
  } | null
}

interface DrawEntryRecord {
  submitted_scores: number[]
  matched_count: number | null
  is_winner: boolean
}

interface Props {
  draw: Draw | null
  entry: DrawEntryRecord | null
  eligibility: { eligible: boolean; sub_active: boolean; score_count: number; scores_needed: number } | null
  scores: { id: string; score: number; score_date: string }[]
  pastDraws: any[]
  userId: string
}

function DrawBall({ number, highlighted = false, delay = 0, size = 'lg' }: {
  number: number; highlighted?: boolean; delay?: number; size?: 'sm' | 'lg'
}) {
  return (
    <motion.div
      className={`${size === 'lg' ? 'draw-ball' : 'w-10 h-10 text-base rounded-full'} flex items-center justify-center font-display font-bold
        ${highlighted
          ? 'border-emerald bg-emerald/20 text-emerald shadow-[0_0_20px_rgba(0,232,122,0.4)]'
          : size === 'sm' ? 'bg-white/5 border border-white/15 text-white/50' : ''
        }`}
      initial={{ scale: 0, opacity: 0, y: -30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      {String(number).padStart(2, '0')}
    </motion.div>
  )
}

export function DrawEntry({ draw, entry, eligibility, scores, pastDraws, userId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [enteredEntry, setEnteredEntry] = useState(entry)
  const [error, setError] = useState('')
  const [justEntered, setJustEntered] = useState(false)

  const handleEnter = () => {
    if (!draw) return
    setError('')
    startTransition(async () => {
      const result = await enterDraw(draw.id)
      if (result.success) {
        setEnteredEntry({ submitted_scores: result.scores!, matched_count: null, is_winner: false })
        setJustEntered(true)
      } else {
        setError(result.error ?? 'Failed to enter draw')
      }
    })
  }

  const pool = draw?.prize_pools
  const monthLabel = draw ? `${MONTHS[draw.period_month - 1]} ${draw.period_year}` : ''

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main draw card */}
      <div className="xl:col-span-2 space-y-5">
        {draw ? (
          <>
            {/* Draw header */}
            <div className="glass rounded-card p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
                    {draw.status === 'published' ? 'Draw Results' : 'Current Draw'}
                  </p>
                  <h2 className="font-display text-3xl font-bold text-white">{monthLabel}</h2>
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  draw.status === 'published' ? 'bg-emerald/10 text-emerald' :
                  draw.status === 'pending'   ? 'bg-gold/10 text-gold' :
                  'bg-white/10 text-white/60'
                }`}>
                  {draw.status === 'pending' ? 'Open for entry' : draw.status}
                </div>
              </div>

              {/* Prize tiers */}
              {pool && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: 'Jackpot', val: pool.jackpot_pool_gbp, color: 'gold', rolled: pool.jackpot_rolled_over },
                    { label: '4-Match', val: pool.match4_pool_gbp, color: 'emerald' },
                    { label: '3-Match', val: pool.match3_pool_gbp, color: 'sapphire' },
                  ].map(tier => (
                    <div key={tier.label} className={`rounded-2xl p-4 text-center ${
                      tier.color === 'gold' ? 'glass-gold' :
                      tier.color === 'emerald' ? 'glass-emerald' :
                      'glass'
                    }`}>
                      {tier.rolled && (
                        <div className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1">+ Rollover</div>
                      )}
                      <div className={`font-display text-2xl font-bold ${
                        tier.color === 'gold' ? 'text-gold' :
                        tier.color === 'emerald' ? 'text-emerald' :
                        'text-[#4488ff]'
                      }`}>
                        £{Math.floor(tier.val).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{tier.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Published — show winning numbers */}
              {draw.status === 'published' && draw.winning_numbers && (
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Winning Numbers</p>
                  <div className="flex gap-3 flex-wrap">
                    {draw.winning_numbers.map((n, i) => (
                      <DrawBall
                        key={i}
                        number={n}
                        highlighted={enteredEntry?.submitted_scores.includes(n)}
                        delay={i * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending — entry area */}
              {draw.status === 'pending' && (
                <div>
                  {enteredEntry ? (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5"
                      >
                        {justEntered && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 glass-emerald rounded-2xl"
                          >
                            <div className="w-8 h-8 rounded-full bg-emerald/20 border border-emerald/30 flex items-center justify-center text-emerald text-lg">✓</div>
                            <div>
                              <p className="text-sm font-semibold text-emerald">You're in the draw!</p>
                              <p className="text-xs text-white/50">Draw runs at end of month. Good luck!</p>
                            </div>
                          </motion.div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Your Entered Numbers</p>
                          <div className="flex gap-3 flex-wrap">
                            {enteredEntry.submitted_scores.map((n, i) => (
                              <DrawBall key={i} number={n} delay={i * 0.07} />
                            ))}
                          </div>
                          <p className="text-xs text-white/30 mt-3">
                            Your numbers are locked in. Scores are updated automatically if you edit them.
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Your Numbers (from your 5 scores)</p>
                        {scores.length === 5 ? (
                          <div className="flex gap-3 flex-wrap">
                            {scores.map((s, i) => (
                              <DrawBall key={s.id} number={s.score} delay={i * 0.07} />
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="draw-ball border-dashed opacity-30 text-white/20">?</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-rose text-sm bg-rose/10 border border-rose/20 rounded-xl px-4 py-3"
                        >
                          {error}
                        </motion.p>
                      )}

                      {eligibility?.eligible ? (
                        <button
                          onClick={handleEnter}
                          disabled={isPending}
                          className="btn-gold w-full py-4 text-base justify-center rounded-2xl disabled:opacity-60"
                        >
                          {isPending ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              Entering draw…
                            </>
                          ) : (
                            '✦ Enter This Month\'s Draw'
                          )}
                        </button>
                      ) : (
                        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                          <p className="text-white/50 text-sm mb-3">
                            {!eligibility?.sub_active
                              ? 'You need an active subscription to enter draws.'
                              : `You need ${eligibility.scores_needed} more score${eligibility.scores_needed > 1 ? 's' : ''} to enter this draw.`}
                          </p>
                          <a
                            href={!eligibility?.sub_active ? '/dashboard/settings' : '/dashboard/scores'}
                            className="text-emerald text-sm font-semibold hover:text-emerald/70 transition-colors"
                          >
                            {!eligibility?.sub_active ? 'Manage subscription →' : 'Add scores →'}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass rounded-card p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">No Active Draw</h2>
            <p className="text-white/40">The next draw will be set up soon by the admin. Check back shortly.</p>
          </div>
        )}

        {/* Past draws */}
        {pastDraws.length > 0 && (
          <div className="glass rounded-card p-6">
            <h3 className="font-display text-lg font-bold text-white mb-5">Past Draws</h3>
            <div className="space-y-4">
              {pastDraws.map(pd => {
                const userEntry = pd.draw_entries?.[0]
                const matched = userEntry?.matched_count
                return (
                  <div key={pd.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {MONTHS_SHORT[pd.period_month - 1]} {pd.period_year}
                      </div>
                      {userEntry && (
                        <div className="flex gap-1 mt-1">
                          {userEntry.submitted_scores?.map((s: number, i: number) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                pd.winning_numbers?.includes(s) ? 'bg-emerald/20 text-emerald' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {pd.winning_numbers && (
                        <div className="flex gap-1">
                          {pd.winning_numbers.slice(0, 5).map((n: number, i: number) => (
                            <span key={i} className="w-7 h-7 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {matched !== null && matched !== undefined && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          matched >= 5 ? 'bg-gold/20 text-gold' :
                          matched >= 4 ? 'bg-emerald/20 text-emerald' :
                          matched >= 3 ? 'bg-[#4488ff]/20 text-[#4488ff]' :
                          'bg-white/5 text-white/30'
                        }`}>
                          {matched} matched
                        </span>
                      )}
                      {!userEntry && <span className="text-xs text-white/20">Not entered</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right panel — How the draw works */}
      <div className="space-y-5">
        <div className="glass rounded-card p-6">
          <h3 className="font-display text-lg font-bold text-white mb-5">How the Draw Works</h3>
          <div className="space-y-4">
            {[
              { icon: '⛳', step: '1. Log 5 scores', desc: 'Enter your Stableford rounds — each score becomes a draw number.' },
              { icon: '✦', step: '2. Auto-entered', desc: 'Once you have 5 scores and an active subscription, enter the draw.' },
              { icon: '🎯', step: '3. Monthly draw', desc: 'At month end, 5 winning numbers are drawn — random or weighted.' },
              { icon: '🏆', step: '4. Win prizes', desc: 'Match 3, 4, or all 5 numbers to claim your share of the prize pool.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{item.step}</div>
                  <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-card p-6">
          <h3 className="font-display text-base font-bold text-white mb-4">Prize Pool Split</h3>
          <div className="space-y-3">
            {[
              { match: '5 Numbers', pct: '40%', label: 'Jackpot', color: 'text-gold' },
              { match: '4 Numbers', pct: '35%', label: 'Major prize', color: 'text-emerald' },
              { match: '3 Numbers', pct: '25%', label: 'Minor prize', color: 'text-[#4488ff]' },
            ].map(tier => (
              <div key={tier.match} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-white">{tier.match}</div>
                  <div className="text-xs text-white/30">{tier.label}</div>
                </div>
                <span className={`font-display text-lg font-bold ${tier.color}`}>{tier.pct}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/20 mt-4">
            Jackpot rolls over if no 5-match winner. Prizes split equally among multiple winners in same tier.
          </p>
        </div>
      </div>
    </div>
  )
}
