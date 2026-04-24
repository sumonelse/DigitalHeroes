'use client'
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import type { PrizePool as PrizePoolType, Charity } from '@/types/database'

/* ── Prize Pool ─────────────────────────────────────────────── */
interface PrizePoolProps { pool: PrizePoolType | null }
export function PrizePool({ pool }: PrizePoolProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const jackpot = pool?.jackpot_pool_gbp ?? 425000
  const match4  = pool?.match4_pool_gbp  ?? 371875
  const match3  = pool?.match3_pool_gbp  ?? 265625

  const tiers = [
    { label: 'Jackpot', match: '5-Number Match', amount: jackpot, pct: '40%', color: 'gold', rollover: true },
    { label: 'Major',   match: '4-Number Match', amount: match4,  pct: '35%', color: 'emerald', rollover: false },
    { label: 'Minor',   match: '3-Number Match', amount: match3,  pct: '25%', color: 'sapphire', rollover: false },
  ]

  return (
    <section ref={ref} className="py-24 relative">
      <div className="container-hero">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-gold text-sm font-semibold tracking-widest uppercase mb-4"
          >
            Current Prize Pool
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Real prizes, every month.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg"
          >
            Auto-calculated from active subscribers — fully transparent.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-card p-8 text-center overflow-hidden ${
                tier.color === 'gold'     ? 'glass-gold glow-gold' :
                tier.color === 'emerald' ? 'glass-emerald glow-emerald' :
                'glass border-sapphire/20'
              }`}
            >
              {tier.rollover && (
                <div className="absolute top-4 right-4 text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                  Jackpot
                </div>
              )}
              <div className={`text-sm font-semibold uppercase tracking-widest mb-2 ${
                tier.color === 'gold' ? 'text-gold' : tier.color === 'emerald' ? 'text-emerald' : 'text-sapphire'
              }`}>{tier.label}</div>
              <div className="font-display text-5xl font-bold text-white mb-1">
                ₹{Math.floor(tier.amount).toLocaleString('en-IN')}
              </div>
              <div className="text-white/40 text-sm mb-6">{tier.match}</div>
              <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
                tier.color === 'gold' ? 'bg-gold/10 text-gold' : tier.color === 'emerald' ? 'bg-emerald/10 text-emerald' : 'bg-sapphire/10 text-[#4488ff]'
              }`}>
                {tier.pct} of pool
                {tier.rollover && ' + rollovers'}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-white/30 text-sm mt-8"
        >
          Prize pools grow with every new subscriber. Jackpot rolls over if no 5-match winner.
        </motion.p>
      </div>
    </section>
  )
}

/* ── Charity Spotlight ──────────────────────────────────────── */
interface CharitySpotlightProps { charities: Charity[] }
export function CharitySpotlight({ charities }: CharitySpotlightProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const fallback: Partial<Charity>[] = [
    { id: '1', name: 'Irish Heart Foundation', short_description: 'Fighting heart disease and stroke', category: 'Health', total_raised_gbp: 14820, supporter_count: 312 },
    { id: '2', name: 'Pieta House', short_description: 'Mental health & suicide prevention', category: 'Mental Health', total_raised_gbp: 11340, supporter_count: 241 },
    { id: '3', name: 'GOAL Ireland', short_description: 'International humanitarian aid', category: 'Aid', total_raised_gbp: 9180, supporter_count: 198 },
  ]

  const displayed = charities.length ? charities : fallback as Charity[]

  return (
    <section ref={ref} className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-depth/30 to-transparent pointer-events-none" />
      <div className="container-hero relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              className="text-emerald text-sm font-semibold tracking-widest uppercase mb-4"
            >
              Charity Partners
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-bold text-white"
            >
              Your game,
              <br />
              <span className="text-white/40">their impact.</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Link href="/charities" className="btn-secondary mt-8 md:mt-0">
              All Charities →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayed.map((charity, i) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-card p-6 hover:glass-emerald hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              {/* Charity icon placeholder */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald/20 to-emerald/5 border border-emerald/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💚</span>
              </div>

              <div className="text-xs font-semibold text-emerald uppercase tracking-widest mb-2">
                {charity.category}
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{charity.name}</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">{charity.short_description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="text-lg font-bold text-white">
                    ₹{Math.floor(charity.total_raised_gbp ?? 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-white/30">raised total</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{charity.supporter_count}</div>
                  <div className="text-xs text-white/30">supporters</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Pricing Section ────────────────────────────────────────── */
const MONTHLY_PRICE = 999

const YEARLY_PRICE  = 8330
export function PricingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const plans = [
    {
      id: 'monthly',
      label: 'Monthly',
      price: MONTHLY_PRICE,
      period: 'per month',
      tagline: 'Pay as you play',
      features: [
        'All 5 monthly draw numbers',
        'Unlimited score entries',
        'Charity contribution (10%+)',
        'Live prize pool tracking',
        'Mobile-first dashboard',
        'Winner prize portal',
      ],
      cta: 'Start Monthly',
      highlight: false,
    },
    {
      id: 'yearly',
      label: 'Yearly',
      price: YEARLY_PRICE,
      period: 'per year',
      tagline: `Save ₹${((MONTHLY_PRICE * 12 - YEARLY_PRICE)/100).toFixed(0)} vs monthly`,
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority draw entry',
        'Exclusive yearly badge',
        'Early access to features',
        'VIP charity events',
      ],
      cta: 'Best Value — Join Yearly',
      highlight: true,
    },
  ]

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
      <div className="container-hero relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-gold text-sm font-semibold tracking-widest uppercase mb-4"
          >
            Simple Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mb-4"
          >
            One subscription.
            <br />
            <span className="text-white/40">Infinite purpose.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-card p-8 relative overflow-hidden ${
                plan.highlight
                  ? 'bg-gradient-to-br from-emerald/10 via-emerald/5 to-transparent border border-emerald/30 glow-emerald'
                  : 'glass'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald to-transparent" />
              )}
              {plan.highlight && (
                <div className="absolute top-4 right-4 text-xs font-bold text-void bg-emerald px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
              )}

              <div className="mb-6">
                <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-2">{plan.label}</p>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-5xl font-bold text-white">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-white/40 text-sm pb-2">{plan.period}</span>
                </div>
                <p className={`text-sm font-medium ${plan.highlight ? 'text-emerald' : 'text-white/40'}`}>
                  {plan.tagline}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-emerald flex-shrink-0" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup?plan=${plan.id}`}
                className={plan.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-white/30 text-sm mt-8"
        >
          Minimum 10% of your subscription goes directly to your chosen charity.
          Cancel anytime.
        </motion.p>
      </div>
    </section>
  )
}
