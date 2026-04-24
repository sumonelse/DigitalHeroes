'use client'
import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Profile, Subscription } from '@/types/database'
import { createCustomerPortalSession } from '@/app/actions/subscriptions'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: Profile
  subscription: (Subscription & { charities?: { name: string } | null }) | null
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-emerald/10', text: 'text-emerald', dot: 'bg-emerald' },
  inactive:  { bg: 'bg-white/5',   text: 'text-white/40', dot: 'bg-white/30' },
  cancelled: { bg: 'bg-rose/10',   text: 'text-rose',     dot: 'bg-rose' },
  past_due:  { bg: 'bg-gold/10',   text: 'text-gold',     dot: 'bg-gold' },
}

export function SettingsPanel({ profile, subscription }: Props) {
  const [name, setName]         = useState(profile.full_name ?? '')
  const [phone, setPhone]       = useState(profile.phone ?? '')
  const [club, setClub]         = useState(profile.home_club ?? '')
  const [handicap, setHandicap] = useState(profile.handicap?.toString() ?? '')
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [, startTransition] = useTransition()

  const sub    = subscription
  const status = sub?.status ?? 'inactive'
  const style  = STATUS_STYLES[status] ?? STATUS_STYLES.inactive

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      full_name: name,
      phone,
      home_club: club,
      handicap: handicap ? parseFloat(handicap) : null,
    }).eq('id', profile.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    await createCustomerPortalSession()
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Profile form */}
      <div className="xl:col-span-2 space-y-5">
        <form onSubmit={handleProfileSave} className="glass rounded-card p-6 space-y-5">
          <h2 className="font-display text-xl font-bold text-white">Profile Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input value={profile.email} disabled className="input-field opacity-40 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+353 xxx xxxx" type="tel" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Home Club</label>
              <input value={club} onChange={e => setClub(e.target.value)} className="input-field" placeholder="Your golf club" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Handicap Index</label>
              <input
                value={handicap}
                onChange={e => setHandicap(e.target.value)}
                className="input-field"
                type="number"
                min={0}
                max={54}
                step={0.1}
                placeholder="e.g. 14.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-emerald flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Profile saved!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* Password change note */}
        <div className="glass rounded-card p-6">
          <h2 className="font-display text-xl font-bold text-white mb-2">Security</h2>
          <p className="text-white/40 text-sm mb-4">Change your password via a reset email.</p>
          <a
            href="/reset-password"
            className="btn-secondary py-2.5 px-5 text-sm inline-flex"
          >
            Change Password
          </a>
        </div>
      </div>

      {/* Right panel */}
      <div className="space-y-5">
        {/* Subscription card */}
        <div className={`rounded-card p-6 border ${
          status === 'active' ? 'glass-emerald border-emerald/20' : 'glass'
        }`}>
          <h2 className="font-display text-xl font-bold text-white mb-5">Subscription</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Status</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
            {sub?.plan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Plan</span>
                <span className="text-sm font-semibold text-white capitalize">{sub.plan}</span>
              </div>
            )}
            {sub?.monthly_fee_gbp && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Amount</span>
                <span className="text-sm font-semibold text-white">
                  ₹{sub.monthly_fee_gbp}/mo
                </span>
              </div>
            )}
            {sub?.current_period_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">
                  {sub.cancel_at_period_end ? 'Cancels' : 'Renews'}
                </span>
                <span className="text-sm text-white/60">
                  {new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                </span>
              </div>
            )}
            {sub?.charities && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Charity</span>
                <span className="text-sm text-emerald font-medium truncate max-w-[140px]">{sub.charities.name}</span>
              </div>
            )}
          </div>

          {sub ? (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="btn-secondary w-full justify-center text-sm py-2.5 disabled:opacity-60"
            >
              {portalLoading ? 'Redirecting…' : 'Manage Billing'}
            </button>
          ) : (
            <a href="/pricing" className="btn-primary w-full justify-center text-sm py-2.5 inline-flex">
              Start Subscription
            </a>
          )}
        </div>

        {/* Danger zone */}
        <div className="glass rounded-card p-6 border-rose/10">
          <h2 className="font-display text-lg font-bold text-white mb-2">Danger Zone</h2>
          <p className="text-white/40 text-xs mb-4">These actions are permanent and cannot be undone.</p>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This is irreversible.')) {
                alert('Please contact support to delete your account: support@digitalheroes.co.in')
              }
            }}
            className="text-sm text-rose/60 hover:text-rose border border-rose/20 hover:border-rose/40 px-4 py-2 rounded-xl transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
