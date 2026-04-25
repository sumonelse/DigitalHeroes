"use server";
import { revalidatePath } from "next/cache";
import {
  createServiceClient,
  getAuthUser,
  isAdmin,
} from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await getAuthUser();
  const admin = await isAdmin(user.id);
  if (!admin) throw new Error("Unauthorized");
  return user;
}

/* ── User Management ────────────────────────────────────────── */
export async function adminGetUsers(page = 1, limit = 20, search?: string) {
  await requireAdmin();
  const supabase = await createServiceClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select(
      `*, subscriptions(plan, status, current_period_end, selected_charity_id, monthly_fee_gbp)`,
      { count: "exact" },
    )
    .eq("is_admin", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search)
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw error;
  return { users: data ?? [], total: count ?? 0 };
}

export async function adminUpdateUserScore(
  scoreId: string,
  newScore: number,
  newDate: string,
) {
  await requireAdmin();
  const supabase = await createServiceClient();

  if (newScore < 1 || newScore > 45) return { error: "Score must be 1–45." };

  const { error } = await supabase
    .from("golf_scores")
    .update({
      score: newScore,
      score_date: newDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", scoreId);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/scores");
  return { success: true };
}

export async function adminToggleSubscription(
  userId: string,
  activate: boolean,
) {
  await requireAdmin();
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: activate ? "active" : "inactive" })
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/draws");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

/* ── Charity Management ─────────────────────────────────────── */
export async function adminCreateCharity(formData: FormData) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const name = formData.get("name") as string;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("charities").insert({
    name,
    slug,
    description: formData.get("description") as string,
    short_description: formData.get("short_description") as string,
    category: formData.get("category") as string,
    website_url: (formData.get("website_url") as string) || null,
    registration_no: (formData.get("registration_no") as string) || null,
    country: (formData.get("country") as string) || "IE",
    status: (formData.get("status") as any) || "active",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  revalidatePath("/dashboard/charities");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function adminUpdateCharity(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("charities")
    .update({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      short_description: formData.get("short_description") as string,
      category: formData.get("category") as string,
      website_url: (formData.get("website_url") as string) || null,
      status: formData.get("status") as any,
      featured_order: formData.get("featured_order")
        ? Number(formData.get("featured_order"))
        : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  revalidatePath("/dashboard/charities");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function adminDeleteCharity(id: string) {
  await requireAdmin();
  const supabase = await createServiceClient();

  // Check no active subscriptions are using this charity
  const { count } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("selected_charity_id", id)
    .eq("status", "active");

  if (count && count > 0) {
    return {
      error: `Cannot delete: ${count} active subscriber(s) have selected this charity.`,
    };
  }

  const { error } = await supabase
    .from("charities")
    .update({ status: "inactive" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  revalidatePath("/dashboard/charities");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

/* ── Winner Verification ────────────────────────────────────── */
export async function adminGetWinners(status?: string) {
  await requireAdmin();
  const supabase = await createServiceClient();

  let query = supabase
    .from("winners")
    .select(
      `
      *,
      profiles!winners_user_id_fkey(full_name, email),
      draws(period_month, period_year, winning_numbers)
    `,
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function adminVerifyWinner(
  winnerId: string,
  approved: boolean,
  notes?: string,
) {
  const user = await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("winners")
    .update({
      status: approved ? "verified" : "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      review_notes: notes || null,
    })
    .eq("id", winnerId);

  if (error) return { error: error.message };
  revalidatePath("/admin/winners");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/winners");
  return { success: true };
}

export async function adminMarkWinnerPaid(winnerId: string, reference: string) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("winners")
    .update({
      payment_status: "paid",
      payment_reference: reference,
      paid_at: new Date().toISOString(),
      status: "paid",
    })
    .eq("id", winnerId)
    .eq("status", "verified");

  if (error) return { error: error.message };
  revalidatePath("/admin/winners");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/winners");
  return { success: true };
}

/* ── Prize Pool ─────────────────────────────────────────────── */
export async function adminCreateNextMonthPool() {
  await requireAdmin();
  const supabase = await createServiceClient();

  const now = new Date();
  const month = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
  const year =
    now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();

  // Count active subscribers and their fees
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("monthly_fee_gbp, charity_percentage")
    .eq("status", "active");

  const totalFees =
    subs?.reduce(
      (acc: number, s: { monthly_fee_gbp: number }) => acc + s.monthly_fee_gbp,
      0,
    ) ?? 0;
  const avgCharity =
    (subs?.reduce(
      (acc: number, s: { charity_percentage: number }) =>
        acc + s.charity_percentage,
      0,
    ) || 0) / (subs?.length || 1) || 10;

  // Prize pool = fees minus charity portion
  const charityTotal = totalFees * (avgCharity / 100);
  const poolTotal = totalFees - charityTotal;

  const { data: pool, error } = await supabase
    .from("prize_pools")
    .upsert(
      {
        period_month: month,
        period_year: year,
        total_pool_gbp: Math.round(poolTotal * 100) / 100,
        active_subscribers: subs?.length ?? 0,
        jackpot_rolled_over: false,
        rollover_amount_gbp: 0,
      },
      { onConflict: "period_month,period_year" },
    )
    .select()
    .single();

  if (error || !pool)
    return { error: error?.message ?? "Failed to create pool" };

  // Recalculate tiers
  await supabase.rpc("recalculate_prize_pool", { p_pool_id: pool.id });

  // Apply any pending rollover from previous pool
  await supabase.rpc("apply_jackpot_rollover", { p_new_pool_id: pool.id });

  // Create draw for next month
  await supabase.from("draws").upsert(
    {
      prize_pool_id: pool.id,
      period_month: month,
      period_year: year,
      status: "pending",
    },
    { onConflict: "period_month,period_year" },
  );

  revalidatePath("/admin");
  revalidatePath("/admin/draws");
  revalidatePath("/draws");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/draws");
  return { success: true, pool };
}

/* ── Analytics ──────────────────────────────────────────────── */
export async function adminGetStats() {
  await requireAdmin();
  const supabase = await createServiceClient();
  const { data } = await supabase.rpc("get_admin_stats");
  return data;
}

export async function adminGetRevenueByMonth(months = 6) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("prize_pools")
    .select("period_month, period_year, total_pool_gbp, active_subscribers")
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(months);

  return data ?? [];
}
