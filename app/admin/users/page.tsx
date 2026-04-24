import { adminGetUsers } from "@/app/actions/admin";
import { AdminUsersTable } from "@/components/features/admin/AdminUsersTable";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const { users, total } = await adminGetUsers(currentPage, 20, search);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          User Management
        </h1>
        <p className="text-white/40 mt-1">{total} registered players.</p>
      </div>
      <AdminUsersTable
        users={users}
        total={total}
        currentPage={currentPage}
        search={search}
      />
    </div>
  );
}
