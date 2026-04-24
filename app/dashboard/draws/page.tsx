import { getActiveDrawWithEntry } from "@/app/actions/draws";
import { getUserScores } from "@/app/actions/scores";
import { DrawEntry } from "@/components/features/draws/DrawEntry";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/server";

export const metadata = { title: "Monthly Draw" };

export default async function DrawsPage() {
  const user = await getAuthUser();
  const supabase = await createClient();

  const [drawData, scores, { data: pastDraws }] = await Promise.all([
    getActiveDrawWithEntry(),
    getUserScores().catch(() => []),
    supabase
      .from("draws")
      .select(
        `
        *,
        prize_pools(*),
        draw_entries(submitted_scores, matched_count, is_winner)
      `,
      )
      .eq("status", "published")
      .eq("draw_entries.user_id", user.id)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false })
      .limit(6),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          Monthly Draw
        </h1>
        <p className="text-white/40 mt-1">
          Enter your 5 Stableford scores and compete for the prize pool.
        </p>
      </div>
      <DrawEntry
        draw={drawData.draw}
        entry={drawData.entry}
        eligibility={drawData.eligibility}
        scores={scores}
        pastDraws={pastDraws ?? []}
        userId={user.id}
      />
    </div>
  );
}
