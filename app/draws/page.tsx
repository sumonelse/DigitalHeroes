import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/features/home/Navigation'
import { Footer } from '@/components/features/home/Footer'

export const metadata = { title: 'Monthly Draws' }

async function getDraws() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('draws')
    .select('*, prize_pools(*)')
    .eq('status', 'published')
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })
    .limit(12)
  
  return (data ?? []) as Array<{
    id: string
    period_month: number
    period_year: number
    status: string
    winning_numbers: number[] | null
    prize_pools: {
      jackpot_pool_gbp: number
      match4_pool_gbp: number
      match3_pool_gbp: number
    } | null
  }>
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default async function DrawsPage() {
  const draws = await getDraws()

  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Monthly Draws
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              View past draw results and see who won. Every month, 5 numbers are drawn 
              from all eligible entries.
            </p>
          </div>

          <div className="space-y-6">
            {draws.length === 0 ? (
              <div className="glass rounded-card p-12 text-center">
                <p className="text-white/40">No draws have been published yet. Check back soon!</p>
              </div>
            ) : (
              draws.map((draw) => (
                <div key={draw.id} className="glass rounded-card p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white">
                        {MONTHS[draw.period_month - 1]} {draw.period_year}
                      </h2>
                      {draw.status === 'published' && (
                        <span className="text-emerald text-sm font-medium">Completed</span>
                      )}
                    </div>
                    {draw.prize_pools && (
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-display text-xl font-bold text-gold">₹{Math.floor(draw.prize_pools.jackpot_pool_gbp).toLocaleString('en-IN')}</div>
                          <div className="text-white/40">Jackpot</div>
                        </div>
                        <div className="text-center">
                          <div className="font-display text-xl font-bold text-emerald">₹{Math.floor(draw.prize_pools.match4_pool_gbp).toLocaleString('en-IN')}</div>
                          <div className="text-white/40">4 Match</div>
                        </div>
                        <div className="text-center">
                          <div className="font-display text-xl font-bold text-sapphire">₹{Math.floor(draw.prize_pools.match3_pool_gbp).toLocaleString('en-IN')}</div>
                          <div className="text-white/40">3 Match</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {draw.winning_numbers && (
                    <div className="flex flex-col items-center">
                      <p className="text-white/40 text-sm uppercase tracking-widest mb-4">Winning Numbers</p>
                      <div className="flex gap-3">
                        {draw.winning_numbers.map((num: number, i: number) => (
                          <div
                            key={i}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center font-display text-xl font-bold text-gold"
                          >
                            {String(num).padStart(2, '0')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}