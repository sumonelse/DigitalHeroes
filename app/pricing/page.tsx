import Link from 'next/link'
import { Suspense } from 'react'

export const metadata = { title: 'Pricing' }

const PLANS = [
  {
    name: 'Monthly',
    price: 999,
    period: 'month',
    features: [
      'Enter monthly prize draws',
      '5 draw numbers from your scores',
      'Win up to ₹4,25,000/month',
      'Support charity (10%+)',
      'Rolling 5-score window',
      'Full platform access',
    ],
  },
  {
    name: 'Yearly',
    price: 8330,
    period: 'year',
    popular: true,
    savings: 'Save ₹3,668/year',
    features: [
      'Everything in Monthly',
      'Priority draw entry',
      'Early access to draws',
      'Enhanced support',
      'Exclusive yearly badges',
      'Largest prize pool',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen mesh-bg py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Play for Prizes & Purpose
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Join thousands of golfers competing for life-changing prizes while supporting causes you care about.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`glass rounded-card p-8 relative ${
                plan.popular ? 'border-2 border-emerald/50 shadow-[0_0_40px_rgba(0,232,122,0.15)]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald text-void text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display font-bold text-white">₹</span>
                  <span className="text-5xl font-display font-bold text-white">
                    {plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-white/40">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="text-emerald text-sm font-semibold mt-2">{plan.savings}</div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-white/70">
                    <svg className="w-5 h-5 text-emerald flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/api/checkout?plan=${plan.name.toLowerCase()}`}
                className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                  plan.popular
                    ? 'btn-gold'
                    : 'border border-white/20 text-white hover:bg-white/5'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="glass rounded-2xl p-6 inline-block">
            <h3 className="text-white font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="text-left space-y-4 text-sm text-white/50">
              <div>
                <div className="text-white font-medium mb-1">How do I win?</div>
                <div>Enter your 5 Stableford scores each month. Match 3+ numbers to win prizes from the pool.</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">Where does the money go?</div>
                <div>At least 10% of your subscription supports your chosen charity. The rest funds the prize pool.</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">Can I cancel anytime?</div>
                <div>Yes, cancel anytime with no hidden fees. Your access continues until the billing period ends.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-white/30 text-sm">
          By subscribing you agree to our{' '}
          <Link href="/terms" className="underline hover:text-white/50">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-white/50">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}