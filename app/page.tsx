import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/features/home/HeroSection";
import { HowItWorks } from "@/components/features/home/HowItWorks";
import {
  PrizePool,
  CharitySpotlight,
  PricingSection,
} from "@/components/features/home/PrizePool";
import { Navigation } from "@/components/features/home/Navigation";
import { Footer } from "@/components/features/home/Footer";

async function getHomepageData() {
  const supabase = createPublicClient();
  const [{ data: charities }, { data: pool }, { data: draws }] =
    await Promise.all([
      supabase
        .from("charities")
        .select("*")
        .eq("status", "featured")
        .order("featured_order")
        .limit(3),
      supabase
        .from("prize_pools")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("draws")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
  return { charities: charities ?? [], pool: pool ?? null, draws: draws ?? [] };
}

export default async function HomePage() {
  const { charities, pool } = await getHomepageData();

  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main>
        <HeroSection prizePool={pool} />
        <HowItWorks />
        <PrizePool pool={pool} />
        <CharitySpotlight charities={charities} />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
