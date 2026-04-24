import { adminGetWinners } from "@/app/actions/admin";
import { AdminWinnersManager } from "@/components/features/admin/AdminWinnersManager";

export const metadata = { title: "Admin — Winners" };

export default async function AdminWinnersPage() {
  const winners = await adminGetWinners();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Winner Verification
        </h1>
        <p className="text-white/40 mt-1">
          Review proof submissions and manage payouts.
        </p>
      </div>
      <AdminWinnersManager winners={winners} />
    </div>
  );
}
