import { createServiceClient } from "@/lib/supabase/server";
import { AdminDrawManager } from "@/components/features/admin/AdminDrawManager";

export const metadata = { title: "Admin — Draws" };

export default async function AdminDrawsPage() {
  const supabase = await createServiceClient();

  const { data: draws } = await supabase
    .from("draws")
    .select("*, prize_pools(*)")
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(12);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Draw Management
        </h1>
        <p className="text-white/40 mt-1">
          Configure, simulate, and publish monthly draws.
        </p>
      </div>
      <AdminDrawManager draws={draws ?? []} />
    </div>
  );
}
