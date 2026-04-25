"use client";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { adminToggleSubscription } from "@/app/actions/admin";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
  created_at: string;
  subscriptions:
    | {
        plan: string | null;
        status: string | null;
        current_period_end: string | null;
      }[]
    | null;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald/10 text-emerald",
  inactive: "bg-white/5 text-white/40",
  cancelled: "bg-rose/10 text-rose",
  past_due: "bg-gold/10 text-gold",
};

export function AdminUsersTable({
  users,
  total,
  currentPage,
  search,
}: {
  users: UserRow[];
  total: number;
  currentPage: number;
  search?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(search ?? "");
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const totalPages = Math.ceil(total / 20);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    params.set("page", "1");
    router.push(`${pathname}?${params}`);
  };

  const handlePage = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(p));
    router.push(`${pathname}?${params}`);
  };

  const handleToggle = async (userId: string, currentStatus: string) => {
    setToggling(userId);
    setError("");
    const activate = currentStatus !== "active";
    startTransition(async () => {
      const result = await adminToggleSubscription(userId, activate);
      if (result?.error) setError(result.error);
      router.refresh();
      setToggling(null);
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl bg-rose/10 text-rose text-sm border border-rose/20">
          {error}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="input-field max-w-sm"
        />
        <button type="submit" className="btn-secondary py-2.5 px-5 text-sm">
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.push(pathname);
            }}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="glass rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "Player",
                  "Country",
                  "Plan",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const sub = user.subscriptions?.[0];
                const status = sub?.status ?? "inactive";
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">
                        {user.full_name ?? "—"}
                      </div>
                      <div className="text-xs text-white/40">{user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-white/50">
                      {user.country ?? "—"}
                    </td>
                    <td className="px-5 py-4 capitalize text-white/60">
                      {sub?.plan ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.inactive}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs">
                      {new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(user.id, status)}
                        disabled={toggling === user.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          status === "active"
                            ? "text-rose hover:bg-rose/10 border border-rose/20"
                            : "text-emerald hover:bg-emerald/10 border border-emerald/20"
                        }`}
                      >
                        {toggling === user.id
                          ? "…"
                          : status === "active"
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-16 text-white/30">
            No users found{search ? ` for "${search}"` : ""}.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">
            Page {currentPage} of {totalPages} · {total} total users
          </p>
          <div className="flex gap-2">
            {Array.from(
              { length: Math.min(totalPages, 7) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  p === currentPage
                    ? "bg-emerald/20 text-emerald border border-emerald/30"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
