'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { submitWinnerProof } from '@/app/actions/winners'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const MATCH_ICONS: Record<string, string> = { '5-match': '🏆', '4-match': '🥇', '3-match': '🥈' }
const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-gold/10 text-gold border-gold/20',
  verified: 'bg-[#4488ff]/10 text-[#4488ff] border-[#4488ff]/20',
  rejected: 'bg-rose/10 text-rose border-rose/20',
  paid:     'bg-emerald/10 text-emerald border-emerald/20',
}

type WinnerRow = {
  id: string
  match_type: string
  prize_amount_gbp: number
  status: string
  proof_url: string | null
  payment_status: string
  payment_reference: string | null
  paid_at: string | null
  review_notes: string | null
  created_at: string
  draws: { period_month: number; period_year: number; winning_numbers: number[] | null } | null
}

export function WinnersPortal({ winners: initial, userId }: { winners: WinnerRow[]; userId: string }) {
  const [winners, setWinners] = useState(initial)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<Record<string, string>>({})

  const totalWon  = winners.reduce((a, w) => a + w.prize_amount_gbp, 0)
  const totalPaid = winners.filter(w => w.status === 'paid').reduce((a, w) => a + w.prize_amount_gbp, 0)
  const pending   = winners.filter(w => w.status === 'pending')

  const handleProofUpload = async (winnerId: string, file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setUploadError(prev => ({ ...prev, [winnerId]: 'Only images and PDFs accepted.' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(prev => ({ ...prev, [winnerId]: 'File must be under 5MB.' }))
      return
    }

    setUploading(winnerId)
    setUploadError(prev => ({ ...prev, [winnerId]: '' }))
    const supabase = createClient()

    const ext      = file.name.split('.').pop()
    const path     = `${userId}/${winnerId}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('winner-proofs').upload(path, file, { upsert: true })

    if (uploadErr) {
      setUploadError(prev => ({ ...prev, [winnerId]: uploadErr.message }))
      setUploading(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(path)

    const result = await submitWinnerProof(winnerId, publicUrl)
    if (!result.success) {
      setUploadError(prev => ({ ...prev, [winnerId]: result.error ?? 'Failed to save proof.' }))
    } else {
      setWinners(prev => prev.map(w => w.id === winnerId ? { ...w, proof_url: publicUrl } : w))
    }

    setUploading(null)
  }

  if (winners.length === 0) {
    return (
      <div className="text-center py-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl mb-6"
        >
          🏌️
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">No winnings yet</h2>
        <p className="text-white/40 mb-6">Keep entering draws — your win is coming!</p>
        <a href="/dashboard/draws" className="btn-primary inline-flex py-3 px-6">
          Enter This Month's Draw
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Won', value: `₹${totalWon.toFixed(2)}`, color: 'text-white' },
          { label: 'Paid Out', value: `₹${totalPaid.toFixed(2)}`, color: 'text-emerald' },
          { label: 'Pending', value: pending.length, color: pending.length > 0 ? 'text-gold' : 'text-white/40' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending verification notice */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-gold rounded-2xl p-5 flex items-start gap-4"
          >
            <span className="text-2xl flex-shrink-0">📋</span>
            <div>
              <p className="text-sm font-semibold text-gold mb-1">
                {pending.length} prize{pending.length > 1 ? 's' : ''} awaiting verification
              </p>
              <p className="text-xs text-white/50">
                Upload a screenshot of your scores from your golf platform to verify your win.
                Our team reviews submissions within 48 hours.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winners list */}
      <div className="space-y-4">
        {winners.map((winner, i) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-card overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center gap-4 p-5 md:p-6">
              <span className="text-3xl flex-shrink-0">{MATCH_ICONS[winner.match_type] ?? '🎯'}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-lg font-bold text-white">
                    {winner.draws ? `${MONTHS[winner.draws.period_month - 1]} ${winner.draws.period_year}` : 'Draw'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[winner.status]}`}>
                    {winner.status}
                  </span>
                </div>
                <div className="text-sm text-white/40">{winner.match_type} — shared prize pool</div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-display text-2xl font-bold text-white">
                  ₹{winner.prize_amount_gbp.toFixed(2)}
                </div>
                <div className="text-xs text-white/30">prize amount</div>
              </div>
            </div>

            {/* Winning numbers */}
            {winner.draws?.winning_numbers && (
              <div className="px-6 pb-4">
                <p className="text-xs text-white/30 mb-2">Winning numbers:</p>
                <div className="flex gap-2">
                  {winner.draws.winning_numbers.map((n, i) => (
                    <span key={i} className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm flex items-center justify-center font-bold">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {winner.status === 'pending' && (
              <div className="border-t border-white/5 p-5 md:p-6 space-y-3">
                <p className="text-sm font-semibold text-white">Upload Verification Proof</p>
                <p className="text-xs text-white/40">
                  Upload a screenshot of your scores from your golf app or club system. Accepted: JPG, PNG, PDF (max 5MB).
                </p>

                {winner.proof_url ? (
                  <div className="flex items-center gap-3 p-3 glass-emerald rounded-xl">
                    <svg className="w-4 h-4 text-emerald flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-emerald font-medium">Proof uploaded ✓</p>
                      <p className="text-xs text-white/40">Awaiting admin review (within 48h)</p>
                    </div>
                    <a
                      href={winner.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white transition-colors underline"
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    uploading === winner.id ? 'border-white/20 opacity-60' : 'border-emerald/20 hover:border-emerald/50 hover:bg-emerald/5'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={uploading === winner.id}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleProofUpload(winner.id, file)
                      }}
                    />
                    {uploading === winner.id ? (
                      <>
                        <svg className="w-5 h-5 text-white/50 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-sm text-white/50">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-emerald/60" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm text-emerald/60">Click to upload proof of scores</span>
                      </>
                    )}
                  </label>
                )}

                {uploadError[winner.id] && (
                  <p className="text-rose text-xs">{uploadError[winner.id]}</p>
                )}
              </div>
            )}

            {winner.status === 'rejected' && winner.review_notes && (
              <div className="border-t border-white/5 p-5 bg-rose/5">
                <p className="text-xs font-semibold text-rose mb-1">Rejection Reason</p>
                <p className="text-sm text-white/60">{winner.review_notes}</p>
              </div>
            )}

            {winner.status === 'paid' && (
              <div className="border-t border-white/5 p-5 bg-emerald/5">
                <div className="flex items-center gap-2 text-sm text-emerald">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Payment sent
                  {winner.paid_at && ` · ${new Date(winner.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  {winner.payment_reference && (
                    <span className="text-white/40 font-mono text-xs ml-2">ref: {winner.payment_reference}</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
