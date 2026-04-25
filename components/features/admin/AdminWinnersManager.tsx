"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { adminVerifyWinner, adminMarkWinnerPaid } from "@/app/actions/admin";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type WinnerWithRelations = {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: string;
  prize_amount_gbp: number;
  status: string;
  proof_url: string | null;
  proof_uploaded_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  payment_status: string;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
  draws: {
    period_month: number;
    period_year: number;
    winning_numbers: number[] | null;
  } | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold/10 text-gold border-gold/20",
  verified: "bg-[#4488ff]/10 text-[#4488ff] border-[#4488ff]/20",
  rejected: "bg-rose/10 text-rose border-rose/20",
  paid: "bg-emerald/10 text-emerald border-emerald/20",
};

const MATCH_ICONS: Record<string, string> = {
  "5-match": "🏆",
  "4-match": "🥇",
  "3-match": "🥈",
};

export function AdminWinnersManager({
  winners: initialWinners,
}: {
  winners: WinnerWithRelations[];
}) {
  const [winners, setWinners] = useState(initialWinners);
  const [filterStatus, setFilter] = useState<string>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [payRef, setPayRef] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered =
    filterStatus === "all"
      ? winners
      : winners.filter((w) => w.status === filterStatus);

  const counts = {
    all: winners.length,
    pending: winners.filter((w) => w.status === "pending").length,
    verified: winners.filter((w) => w.status === "verified").length,
    paid: winners.filter((w) => w.status === "paid").length,
    rejected: winners.filter((w) => w.status === "rejected").length,
  };

  const handleVerify = async (id: string, approved: boolean) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setError("");
    const result = await adminVerifyWinner(id, approved, notes[id]);
    if (result.success) {
      setWinners((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status: approved ? "verified" : "rejected",
                review_notes: notes[id] ?? null,
              }
            : w,
        ),
      );
      setExpanded(null);
    } else {
      setError(result.error ?? "Failed to update winner.");
    }
    setLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handlePaid = async (id: string) => {
    if (!payRef[id]?.trim()) {
      alert("Please enter a payment reference.");
      return;
    }
    setLoading((prev) => ({ ...prev, [id]: true }));
    setError("");
    const result = await adminMarkWinnerPaid(id, payRef[id]);
    if (result.success) {
      setWinners((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status: "paid",
                payment_status: "paid",
                payment_reference: payRef[id],
              }
            : w,
        ),
      );
    } else {
      setError(result.error ?? "Failed to mark winner as paid.");
    }
    setLoading((prev) => ({ ...prev, [id]: false }));
  };

  const totalPending = winners
    .filter((w) => w.status === "pending")
    .reduce((a, w) => a + w.prize_amount_gbp, 0);
  const totalVerified = winners
    .filter((w) => w.status === "verified")
    .reduce((a, w) => a + w.prize_amount_gbp, 0);
  const totalPaid = winners
    .filter((w) => w.status === "paid")
    .reduce((a, w) => a + w.prize_amount_gbp, 0);

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose/10 text-rose text-sm border border-rose/20">
          {error}
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Payout", amount: totalPending, color: "text-gold" },
          {
            label: "Approved, Unpaid",
            amount: totalVerified,
            color: "text-[#4488ff]",
          },
          { label: "Total Paid Out", amount: totalPaid, color: "text-emerald" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={`font-display text-2xl font-bold ${s.color}`}>
              ₹
              {s.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "verified", "paid", "rejected"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filterStatus === f
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-xs opacity-60">({counts[f]})</span>
            </button>
          ),
        )}
      </div>

      {/* Winners list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((winner) => (
            <motion.div
              key={winner.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass rounded-2xl overflow-hidden"
            >
              {/* Row header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() =>
                  setExpanded(expanded === winner.id ? null : winner.id)
                }
              >
                {/* Match type */}
                <div className="text-2xl flex-shrink-0">
                  {MATCH_ICONS[winner.match_type] ?? "🎯"}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {winner.profiles?.full_name ?? "Unknown Player"}
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {winner.profiles?.email}
                  </div>
                </div>

                {/* Draw */}
                <div className="text-sm text-white/50 flex-shrink-0">
                  {winner.draws
                    ? `${MONTHS[winner.draws.period_month - 1]} ${winner.draws.period_year}`
                    : "—"}
                </div>

                {/* Match type */}
                <div className="text-sm font-semibold text-white/70 flex-shrink-0">
                  {winner.match_type}
                </div>

                {/* Amount */}
                <div className="font-display text-lg font-bold text-white flex-shrink-0">
                  ₹{winner.prize_amount_gbp.toFixed(2)}
                </div>

                {/* Status */}
                <div
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[winner.status] ?? STATUS_STYLES.pending}`}
                >
                  {winner.status}
                </div>

                {/* Expand arrow */}
                <motion.div
                  animate={{ rotate: expanded === winner.id ? 180 : 0 }}
                  className="text-white/30 flex-shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded === winner.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: details */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                            Winning Numbers
                          </p>
                          <div className="flex gap-2">
                            {winner.draws?.winning_numbers?.map((n, i) => (
                              <span
                                key={i}
                                className="draw-ball w-10 h-10 text-base"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>

                        {winner.proof_url && (
                          <div>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                              Proof Submitted
                            </p>
                            <a
                              href={winner.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-[#4488ff] hover:text-[#4488ff]/80 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              View Score Screenshot
                            </a>
                            {winner.proof_uploaded_at && (
                              <p className="text-xs text-white/30 mt-1">
                                Uploaded{" "}
                                {new Date(
                                  winner.proof_uploaded_at,
                                ).toLocaleDateString("en-GB")}
                              </p>
                            )}
                          </div>
                        )}

                        {winner.review_notes && (
                          <div>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
                              Review Notes
                            </p>
                            <p className="text-sm text-white/60">
                              {winner.review_notes}
                            </p>
                          </div>
                        )}

                        {winner.payment_reference && (
                          <div>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">
                              Payment Reference
                            </p>
                            <p className="text-sm text-emerald font-mono">
                              {winner.payment_reference}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div className="space-y-4">
                        {winner.status === "pending" && (
                          <>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                              Review Decision
                            </p>
                            <textarea
                              value={notes[winner.id] ?? ""}
                              onChange={(e) =>
                                setNotes((prev) => ({
                                  ...prev,
                                  [winner.id]: e.target.value,
                                }))
                              }
                              placeholder="Add review notes (optional)…"
                              className="input-field text-sm resize-none h-24"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleVerify(winner.id, true)}
                                disabled={loading[winner.id]}
                                className="btn-primary py-2.5 px-5 text-sm flex-1 justify-center disabled:opacity-50"
                              >
                                {loading[winner.id]
                                  ? "Processing…"
                                  : "✓ Approve"}
                              </button>
                              <button
                                onClick={() => handleVerify(winner.id, false)}
                                disabled={loading[winner.id]}
                                className="py-2.5 px-5 text-sm rounded-full border border-rose/30 text-rose hover:bg-rose/10 transition-all disabled:opacity-50"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </>
                        )}

                        {winner.status === "verified" && (
                          <>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                              Mark as Paid
                            </p>
                            <input
                              type="text"
                              value={payRef[winner.id] ?? ""}
                              onChange={(e) =>
                                setPayRef((prev) => ({
                                  ...prev,
                                  [winner.id]: e.target.value,
                                }))
                              }
                              placeholder="Payment reference / transaction ID"
                              className="input-field text-sm"
                            />
                            <button
                              onClick={() => handlePaid(winner.id)}
                              disabled={loading[winner.id]}
                              className="btn-primary py-2.5 px-5 text-sm w-full justify-center disabled:opacity-50"
                            >
                              {loading[winner.id]
                                ? "Marking paid…"
                                : "💸 Mark as Paid"}
                            </button>
                          </>
                        )}

                        {(winner.status === "paid" ||
                          winner.status === "rejected") && (
                          <div
                            className={`p-4 rounded-xl text-sm ${
                              winner.status === "paid"
                                ? "bg-emerald/10 text-emerald border border-emerald/20"
                                : "bg-rose/10 text-rose border border-rose/20"
                            }`}
                          >
                            {winner.status === "paid"
                              ? `✓ Paid on ${winner.paid_at ? new Date(winner.paid_at).toLocaleDateString("en-GB") : "unknown date"}`
                              : "✗ Winner rejected — no payment will be made."}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-4">🏆</div>
            <p>No {filterStatus === "all" ? "" : filterStatus} winners yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
