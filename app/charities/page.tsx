import { createPublicClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/features/home/Navigation";
import { Footer } from "@/components/features/home/Footer";
import { CharitySpotlight } from "@/components/features/home/PrizePool";

export const metadata = { title: "Charities" };

async function getCharities() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("charities")
    .select("*")
    .eq("status", "featured")
    .order("featured_order");

  return data ?? [];
}

export default async function CharitiesPage() {
  const charities = await getCharities();

  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main>
        <CharitySpotlight charities={charities} />
      </main>
      <Footer />
    </div>
  );
}
