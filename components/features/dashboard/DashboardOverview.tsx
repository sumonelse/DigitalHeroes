'use client'
import { motion } from 'motion/react'
import Link from 'next/link'
import type { Subscription, GolfScore, Draw, DrawEntry, Winner, PrizePool } from '@/types/database'

interface Props {
  subscription: (Subscription & { charities?: { name: string; short_description: string } | null }) | null
  scores: { id: string; score: number; score_date: string; created_at: string }[]
  currentDraw: (Draw & { prize_pools: PrizePool | null }) | null
  myEntry: (DrawEntry & { draws: Pick<Draw, 'period_month' | 'period_year' | 'winning_numbers' | 'status'> | null })[]
  winners: Winner[]
  eligibility: { eligible: boolean; sub_active: boolean; score_count: number; scores_needed: number } | null
  userId: string
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 45) * 100
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald to-[#00c4a0] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-emerald font-bold font-display text-sm w-6 text-right">{score}</span>
    </div>
  )
}

export function DashboardOverview({ subscription, scores, currentDraw, myEntry, winners, eligibility, userId }: Props) {
  const isActive    = subscription?.status === 'active'
  const scoreCount  = scores.length
  const totalWon    = winners.reduce((a, w) => a + w.prize_amount_gbp, 0)
  const pendingWins = winners.filter(w => w.status === 'pending').length
  const renewDate   = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } } }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 mt-1">Your complete overview — scores, draws, and impact.</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {/* ── Subscription card ─────────────────────────────── */}
        <motion.div variants={item} className={`rounded-card p-6 ${isActive ? 'glass-emerald' : 'glass border-rose/20 bg-rose/5'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Subscription</p>
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                isActive ? 'bg-emerald/10 text-emerald' : 'bg-rose/10 text-rose'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${isActive ? 'animate-pulse' : ''}`} />
                {isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-white capitalize">{subscription?.plan ?? '—'}</div>
              <div className="text-xs text-white/30">{subscription?.plan === 'monthly' ? '£9.99/mo' : '£99.99/yr'}</div>
            </div>
          </div>
          {renewDate && (
            <p className="text-xs text-white/30 mb-4">
              {subscription?.cancel_at_period_end ? 'Cancels' : 'Renews'} {renewDate}
            </p>
          )}
          <Link href="/dashboard/settings" className="text-xs font-semibold text-emerald hover:text-emerald/70 transition-colors">
            Manage subscription →
          </Link>
        </motion.div>

        {/* ── Scores card ───────────────────────────────────── */}
        <motion.div variants={item} className="glass rounded-card p-6 xl:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Your Scores</p>
              <p className="text-sm text-white/60">
                {scoreCount}/5 scores recorded
                {eligibility?.scores_needed ? ` — need ${eligibility.scores_needed} more` : ''}
              </p>
            </div>
            <Link href="/dashboard/scores" className="text-xs font-semibold text-emerald hover:text-emerald/70 transition-colors">
              Manage →
            </Link>
          </div>

          {scoreCount === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">⛳</div>
              <p className="text-white/40 text-sm">No scores yet. Log your first round!</p>
              <Link href="/dashboard/scores" className="btn-primary mt-4 py-2 px-5 text-sm inline-flex">
                Add Score
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.slice(0, 5).map((s, i) => (
                <div key={s.id}>
                  <div className="flex justify-between text-xs text-white/30 mb-1">
                    <span>{new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-white/20">#{i + 1}</span>
                  </div>
                  <ScoreBar score={s.score} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Eligibility / Draw entry card ─────────────────── */}
        <motion.div variants={item} className={`rounded-card p-6 ${eligibility?.eligible ? 'glass-gold' : 'glass'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Current Draw</p>
          {currentDraw ? (
            <>
              <div className="font-display text-2xl font-bold text-white mb-1">
                {MONTH_NAMES[(currentDraw.period_month ?? 1) - 1]} {currentDraw.period_year}
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${
                currentDraw.status === 'published' ? 'bg-emerald/10 text-emerald' :
                currentDraw.status === 'pending'   ? 'bg-gold/10 text-gold' :
                'bg-white/10 text-white/60'
              }`}>
                {currentDraw.status.charAt(0).toUpperCase() + currentDraw.status.slice(1)}
              </div>

              {currentDraw.prize_pools && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'Jackpot', val: currentDraw.prize_pools.jackpot_pool_gbp },
                    { label: '4-Match', val: currentDraw.prize_pools.match4_pool_gbp },
                    { label: '3-Match', val: currentDraw.prize_pools.match3_pool_gbp },
                  ].map(t => (
                    <div key={t.label} className="text-center">
                      <div className="text-sm font-bold text-white">£{Math.floor(t.val).toLocaleString()}</div>
                      <div className="text-[10px] text-white/30">{t.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {eligibility?.eligible ? (
                <Link href="/dashboard/draws" className="btn-gold w-full text-center text-sm py-3 rounded-xl inline-flex items-center justify-center font-bold">
                  ✦ Enter Draw
                </Link>
              ) : (
                <div className="text-xs text-white/40">
                  {!eligibility?.sub_active
                    ? 'Subscribe to enter draws'
                    : `Log ${eligibility?.scores_needed} more score(s) to be eligible`}
                </div>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm">No active draw at the moment.</p>
          )}
        </motion.div>

        {/* ── Charity card ──────────────────────────────────── */}
        <motion.div variants={item} className="glass rounded-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Charity Contribution</p>
          {subscription?.charities ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-3">
                <span className="text-lg">💚</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-1">{subscription.charities.name}</h3>
              <p className="text-sm text-white/40 mb-4">{subscription.charities.short_description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display text-2xl font-bold text-emerald">{subscription.charity_percentage}%</span>
                  <span className="text-xs text-white/30 ml-1">of subscription</span>
                </div>
                <Link href="/dashboard/charities" className="text-xs font-semibold text-emerald hover:text-emerald/70 transition-colors">
                  Change →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-white/40 text-sm mb-3">No charity selected yet.</p>
              <Link href="/dashboard/charities" className="btn-primary py-2 px-5 text-sm inline-flex">
                Choose Charity
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── Winnings card ─────────────────────────────────── */}
        <motion.div variants={item} className={`rounded-card p-6 xl:col-span-1 ${pendingWins > 0 ? 'glass-gold' : 'glass'}`}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Winnings</p>
            {pendingWins > 0 && (
              <span className="text-xs font-bold text-gold bg-gold/10 px-2.5 py-1 rounded-full animate-pulse">
                {pendingWins} pending
              </span>
            )}
          </div>

          <div className="font-display text-4xl font-bold text-white mb-1">
            £{totalWon.toFixed(2)}
          </div>
          <div className="text-xs text-white/30 mb-6">Total won, all time</div>

          {winners.length > 0 ? (
            <div className="space-y-2">
              {winners.slice(0, 3).map(w => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gold text-xs">
                      {w.match_type === '5-match' ? '🏆' : w.match_type === '4-match' ? '🥇' : '🥈'}
                    </span>
                    <span className="text-white/60">{w.match_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">£{w.prize_amount_gbp.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      w.status === 'paid'     ? 'bg-emerald/10 text-emerald' :
                      w.status === 'verified' ? 'bg-sapphire/10 text-[#4488ff]' :
                      w.status === 'rejected' ? 'bg-rose/10 text-rose' :
                      'bg-gold/10 text-gold'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm">No wins yet — keep playing!</p>
          )}

          {winners.length > 0 && (
            <Link href="/dashboard/winners" className="block text-xs font-semibold text-white/40 hover:text-white mt-4 transition-colors">
              View all winnings →
            </Link>
          )}
        </motion.div>

        {/* ── Recent draw entries ───────────────────────────── */}
        <motion.div variants={item} className="glass rounded-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Recent Draw Entries</p>
          {myEntry.length === 0 ? (
            <p className="text-white/30 text-sm">You haven't entered any draws yet.</p>
          ) : (
            <div className="space-y-4">
              {myEntry.map(entry => {
                const draw = entry.draws
                const matched = entry.matched_count ?? null
                return (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {draw ? `${MONTH_NAMES[(draw.period_month ?? 1) - 1]} ${draw.period_year}` : 'Draw'}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {entry.submitted_scores.map((s, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              draw?.winning_numbers?.includes(s)
                                ? 'bg-emerald/20 text-emerald'
                                : 'bg-white/5 text-white/30'
                            }`}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {matched !== null ? (
                      <div className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                        matched >= 5 ? 'bg-gold/20 text-gold' :
                        matched >= 4 ? 'bg-emerald/20 text-emerald' :
                        matched >= 3 ? 'bg-sapphire/20 text-[#4488ff]' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {matched} matched
                      </div>
                    ) : (
                      <span className="text-xs text-white/30">Pending</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
