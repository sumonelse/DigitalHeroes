import { adminGetStats, adminGetRevenueByMonth } from "@/app/actions/admin";
import { AdminOverview } from "@/components/features/admin/AdminOverview";

export const metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const [stats, revenue] = await Promise.all([
    adminGetStats(),
    adminGetRevenueByMonth(6),
  ]);

  return <AdminOverview stats={stats} revenue={revenue} />;
}
