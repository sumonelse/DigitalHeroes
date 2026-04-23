'use client'
import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Charity } from '@/types/database'
import { updateCharitySettings } from '@/app/actions/subscriptions'

interface Props {
  charities: Charity[]
  selectedId: string | null
  percentage: number
}

export function CharitySelector({ charities, selectedId, percentage: initPct }: Props) {
  const [selected, setSelected]   = useState(selectedId)
  const [pct, setPct]             = useState(initPct)
  const [search, setSearch]       = useState('')
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const featured  = filtered.filter(c => c.status === 'featured')
  const remaining = filtered.filter(c => c.status !== 'featured')

  const handleSave = () => {
    if (!selected) { setError('Please select a charity.'); return }
    setError('')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('charity_id', selected)
      fd.set('charity_percentage', String(pct))
      const result = await updateCharitySettings(fd)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error ?? 'Failed to save.')
      }
    })
  }

  const CharityCard = ({ charity }: { charity: Charity }) => {
    const isSelected = selected === charity.id
    return (
      <motion.button
        onClick={() => setSelected(charity.id)}
        className={`w-full text-left rounded-2xl p-5 border transition-all duration-200 group ${
          isSelected
            ? 'border-emerald/40 bg-emerald/8 shadow-[0_0_20px_rgba(0,232,122,0.12)]'
            : 'glass border-white/8 hover:border-white/15 hover:bg-white/[0.03]'
        }`}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-start gap-4">
          {/* Logo/icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl transition-all ${
            isSelected ? 'bg-emerald/15 border border-emerald/25' : 'bg-white/5 border border-white/10'
          }`}>
            💚
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                {charity.status === 'featured' && (
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Featured</span>
                )}
                <h3 className={`font-display text-base font-bold leading-tight ${isSelected ? 'text-emerald' : 'text-white'}`}>
                  {charity.name}
                </h3>
                <span className="text-xs text-white/30">{charity.category}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                isSelected ? 'border-emerald bg-emerald/30' : 'border-white/20'
              }`}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald" />
                  </motion.div>
                )}
              </div>
            </div>

            <p className="text-xs text-white/50 mt-2 leading-relaxed line-clamp-2">
              {charity.short_description}
            </p>

            <div className="flex items-center gap-4 mt-3">
              <div className="text-xs">
                <span className="font-semibold text-white">£{Math.floor(charity.total_raised_gbp).toLocaleString()}</span>
                <span className="text-white/30 ml-1">raised</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">{charity.supporter_count}</span>
                <span className="text-white/30 ml-1">supporters</span>
              </div>
            </div>
          </div>
        </div>
      </motion.button>
    )
  }

  const selectedCharity = charities.find(c => c.id === selected)
  const monthlyContrib = ((pct / 100) * 9.99).toFixed(2)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Charity list */}
      <div className="xl:col-span-2 space-y-5">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search charities…"
            className="input-field pl-11"
          />
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">Featured Charities</p>
            <div className="space-y-3">
              {featured.map(c => <CharityCard key={c.id} charity={c} />)}
            </div>
          </div>
        )}

        {/* All others */}
        {remaining.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">All Charities</p>
            <div className="space-y-3">
              {remaining.map(c => <CharityCard key={c.id} charity={c} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <div className="text-4xl mb-3">🔍</div>
            <p>No charities found for "{search}"</p>
          </div>
        )}
      </div>

      {/* Right panel — settings & save */}
      <div className="space-y-5">
        {/* Selected charity preview */}
        <AnimatePresence mode="wait">
          {selectedCharity ? (
            <motion.div
              key={selectedCharity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-emerald rounded-card p-6"
            >
              <p className="text-xs font-semibold text-emerald uppercase tracking-widest mb-3">Your Selection</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald/15 border border-emerald/25 flex items-center justify-center text-xl">
                  💚
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{selectedCharity.name}</h3>
                  <p className="text-xs text-white/40">{selectedCharity.category}</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {selectedCharity.short_description}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="none"
              className="glass rounded-card p-6 border-dashed border-white/10 text-center"
            >
              <p className="text-white/30 text-sm">No charity selected yet.</p>
              <p className="text-white/20 text-xs mt-1">Choose one from the list.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contribution slider */}
        <div className="glass rounded-card p-6">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Contribution Percentage</p>

          <div className="text-center mb-6">
            <span className="font-display text-5xl font-bold text-emerald">{pct}%</span>
            <div className="text-xs text-white/30 mt-1">of your subscription</div>
            <div className="text-sm font-semibold text-white mt-2">= £{monthlyContrib} / month</div>
          </div>

          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={pct}
            onChange={e => setPct(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald bg-white/10 mb-4"
          />

          <div className="flex justify-between text-xs text-white/30">
            <span>Min 10%</span>
            <span>Max 100%</span>
          </div>

          <p className="text-xs text-white/30 mt-4 leading-relaxed">
            At least 10% of your subscription fee goes to your charity. You can give more if you'd like.
          </p>
        </div>

        {/* Save button */}
        <div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-rose text-sm bg-rose/10 border border-rose/20 rounded-xl px-4 py-3 mb-3"
            >
              {error}
            </motion.p>
          )}

          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 glass-emerald rounded-xl mb-3 text-sm text-emerald"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Charity settings saved!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSave}
            disabled={isPending || !selected}
            className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Save Charity Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
