import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAuthProfile } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";
import { DashboardMobileNav } from "@/components/features/dashboard/DashboardMobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({ children }: { children: React.ReactNode }) {
  await connection();
  const profile = await getAuthProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar — desktop */}
      <DashboardSidebar profile={profile} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardMobileNav profile={profile} />
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
