'use client'
import { useState, useOptimistic, useTransition, useActionState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { addScore, updateScore, deleteScore } from '@/app/actions/scores'

interface Score { id: string; score: number; score_date: string; created_at: string }
interface Props { initialScores: Score[]; userId: string }

const MAX_SCORES = 5
const today = new Date().toISOString().split('T')[0]

function ScoreSlot({ score, index, onEdit, onDelete }: {
  score?: Score; index: number
  onEdit: (s: Score) => void
  onDelete: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setDeleting(true)
    await deleteScore(id)
    setDeleting(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
        score
          ? 'glass border-white/10 hover:border-emerald/20 hover:bg-emerald/5'
          : 'border-dashed border-white/10 bg-white/[0.02]'
      }`}
    >
      {/* Index */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        score ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'border border-white/10 text-white/20'
      }`}>
        {index + 1}
      </div>

      {score ? (
        <>
          {/* Score display */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-bold text-white">{score.score}</span>
              <span className="text-xs text-white/30 uppercase tracking-wide">pts</span>
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              {new Date(score.score_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Score bar */}
          <div className="hidden sm:block flex-1 max-w-[120px]">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald to-[#00c4a0] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(score.score / 45) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="text-[10px] text-white/20 text-right mt-1">{score.score}/45</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(score)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              title="Edit score"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2a1.886 1.886 0 012.667 2.667L4.667 14H2v-2.667L11.333 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(score.id)}
              disabled={deleting}
              className="w-8 h-8 rounded-lg bg-rose/5 hover:bg-rose/15 flex items-center justify-center text-rose/50 hover:text-rose transition-all disabled:opacity-50"
              title="Delete score"
            >
              {deleting ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333V12M9.333 7.333V12M3.333 4l.667 9.333h8l.667-9.333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 text-sm text-white/20 italic">Empty slot</div>
      )}
    </motion.div>
  )
}

export function ScoreManager({ initialScores, userId }: Props) {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  const slots = Array.from({ length: MAX_SCORES }, (_, i) => scores[i] ?? null)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await addScore(fd)
      if (result.success && result.data) {
        setScores(prev => {
          const updated = [result.data!, ...prev].slice(0, MAX_SCORES)
          return updated
        })
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
      } else {
        setFormError(result.error ?? 'Failed to add score')
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingScore) return
    setFormError('')
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateScore(editingScore.id, fd)
      if (result.success && result.data) {
        setScores(prev => prev.map(s => s.id === editingScore.id ? { ...s, ...result.data! } : s))
        setEditingScore(null)
      } else {
        setFormError(result.error ?? 'Failed to update score')
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const result = await deleteScore(id)
      if (result.success) setScores(prev => prev.filter(s => s.id !== id))
    })
  }

  const ScoreForm = ({ mode, score }: { mode: 'add' | 'edit'; score?: Score }) => (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="glass-emerald rounded-2xl p-6"
    >
      <h3 className="font-display text-lg font-bold text-white mb-5">
        {mode === 'add' ? 'Log New Round' : 'Edit Score'}
      </h3>

      <form onSubmit={mode === 'add' ? handleAdd : handleUpdate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Stableford Score <span className="text-white/30">(1–45)</span>
            </label>
            <input
              name="score"
              type="number"
              min={1}
              max={45}
              defaultValue={score?.score}
              className="input-field font-display text-2xl font-bold text-center"
              placeholder="24"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Date Played
            </label>
            <input
              name="score_date"
              type="date"
              defaultValue={score?.score_date ?? today}
              max={today}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            Notes <span className="text-white/20">(optional)</span>
          </label>
          <input
            name="notes"
            type="text"
            className="input-field"
            placeholder="e.g. Royal Portrush, windy conditions"
            maxLength={200}
          />
        </div>

        {formError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-rose text-sm bg-rose/10 border border-rose/20 rounded-xl px-4 py-3"
          >
            {formError}
          </motion.p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60"
          >
            {isPending ? 'Saving…' : mode === 'add' ? 'Save Score' : 'Update Score'}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setEditingScore(null); setFormError('') }}
            className="btn-secondary py-2.5 px-6 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Score slots */}
      <div className="xl:col-span-2 space-y-4">
        {/* Info banner */}
        <div className="glass rounded-2xl px-5 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sapphire/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#4488ff]" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-white/70 leading-relaxed">
              <strong className="text-white">Rolling 5-score window.</strong>{' '}
              Adding a 6th score automatically replaces your oldest entry.
              Scores become your draw numbers for the current month.
            </p>
          </div>
        </div>

        {/* Slots */}
        <AnimatePresence mode="popLayout">
          {slots.map((score, i) => (
            <ScoreSlot
              key={score?.id ?? `empty-${i}`}
              score={score ?? undefined}
              index={i}
              onEdit={setEditingScore}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>

        {/* Add button */}
        {!showForm && !editingScore && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-emerald/20 text-emerald/60 hover:text-emerald hover:border-emerald/40 hover:bg-emerald/5 transition-all duration-300 text-sm font-semibold"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log New Round
          </motion.button>
        )}

        {/* Forms */}
        <AnimatePresence>
          {showForm && <ScoreForm mode="add" />}
          {editingScore && <ScoreForm mode="edit" score={editingScore} />}
        </AnimatePresence>
      </div>

      {/* Right panel — tips & draw preview */}
      <div className="space-y-5">
        {/* Draw entry preview */}
        <div className="glass rounded-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Your Draw Numbers</p>
          {scores.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">Log scores to see your draw numbers.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {scores.map((s, i) => (
                  <motion.div
                    key={s.id}
                    className="draw-ball"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                  >
                    {s.score}
                  </motion.div>
                ))}
                {Array.from({ length: MAX_SCORES - scores.length }).map((_, i) => (
                  <div key={`e-${i}`} className="draw-ball opacity-20 text-white/20">?</div>
                ))}
              </div>
              {scores.length === MAX_SCORES && (
                <p className="text-center text-emerald text-xs font-semibold mt-3">
                  ✓ All 5 numbers ready for the draw
                </p>
              )}
              {scores.length < MAX_SCORES && (
                <p className="text-center text-white/30 text-xs">
                  Need {MAX_SCORES - scores.length} more score{MAX_SCORES - scores.length > 1 ? 's' : ''} to enter draws
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stableford guide */}
        <div className="glass rounded-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Stableford Guide</p>
          <div className="space-y-2 text-sm">
            {[
              { pts: '1', desc: 'Bogey or worse' },
              { pts: '2', desc: 'Par' },
              { pts: '3', desc: 'Birdie' },
              { pts: '4', desc: 'Eagle' },
              { pts: '5+', desc: 'Albatross+' },
            ].map(row => (
              <div key={row.pts} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <span className="text-white/40">{row.desc}</span>
                <span className="font-bold text-white">{row.pts} pts</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/20 mt-4 leading-relaxed">
            Total your Stableford points across 18 holes (or adjust for 9-hole rounds).
            Score range: 1–45.
          </p>
        </div>
      </div>
    </div>
  )
}
