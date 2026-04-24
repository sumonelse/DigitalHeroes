import { adminGetStats, adminGetRevenueByMonth } from "@/app/actions/admin";

export const metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const [stats, revenue] = await Promise.all([
    adminGetStats(),
    adminGetRevenueByMonth(12),
  ]);

  const maxPool = Math.max(...revenue.map((r: any) => r.total_pool_gbp), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Analytics
        </h1>
        <p className="text-white/40 mt-1">
          Detailed platform performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prize Pool History */}
        <div className="glass rounded-card p-6">
          <h2 className="font-display text-xl font-bold text-white mb-6">Prize Pool — Last 12 Months</h2>
          <div className="flex items-end gap-2 h-48">
            {[...revenue].reverse().map((m: any, i: number) => {
              const pct = (m.total_pool_gbp / maxPool) * 100;
              return (
                <div key={`${m.period_year}-${m.period_month}`} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-white/50 font-mono">£{Math.floor(m.total_pool_gbp / 1000)}k</div>
                  <div className="w-full flex items-end" style={{ height: '100px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-emerald to-emerald/40 rounded-t-lg"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/30">{m.period_month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="glass rounded-card p-6">
          <h2 className="font-display text-xl font-bold text-white mb-6">Key Metrics</h2>
          <div className="space-y-4">
            {[
              { label: "Total Users", value: stats?.total_users ?? 0 },
              { label: "Active Subscribers", value: stats?.active_subscribers ?? 0 },
              { label: "Total Raised for Charity", value: `£${(stats?.total_charity_raised ?? 0).toLocaleString()}` },
              { label: "Current Prize Pool", value: `£${(stats?.current_prize_pool ?? 0).toLocaleString()}` },
              { label: "Draws Run", value: stats?.total_draws_run ?? 0 },
              { label: "Pending Winner Reviews", value: stats?.pending_winners ?? 0 },
            ].map((metric) => (
              <div key={metric.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-white/60">{metric.label}</span>
                <span className="font-display text-lg font-bold text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}