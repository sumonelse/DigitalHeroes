import { createServiceClient } from "@/lib/supabase/server";
import { AdminCharitiesTable } from "@/components/features/admin/AdminCharitiesTable";

export const metadata = { title: "Admin — Charities" };

export default async function AdminCharitiesPage() {
  const supabase = await createServiceClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Charity Directory
        </h1>
        <p className="text-white/40 mt-1">
          Add, edit, or manage charity partners.
        </p>
      </div>
      <AdminCharitiesTable charities={charities ?? []} />
    </div>
  );
}