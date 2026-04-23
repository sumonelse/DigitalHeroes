import { getAuthUser } from '@/lib/supabase/server'
import { getUserScores } from '@/app/actions/scores'
import { ScoreManager } from '@/components/features/scores/ScoreManager'

export const metadata = { title: 'My Scores' }
export const dynamic = 'force-dynamic'

export default async function ScoresPage() {
  const user  = await getAuthUser()
  const scores = await getUserScores().catch(() => [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">My Scores</h1>
        <p className="text-white/40 mt-1">
          Your rolling 5-score window. Each score is one of your draw numbers.
        </p>
      </div>
      <ScoreManager initialScores={scores} userId={user.id} />
    </div>
  )
}
