"use server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import {
  createClient,
  getAuthUser,
  createServiceClient,
} from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SubscriptionPlan } from "@/types";

// API version 2026-03-25 is latest - types will be updated in future
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as any,
});

function getSubscriptionPeriodBounds(subscription: Stripe.Subscription) {
  const startSeconds =
    typeof subscription.current_period_start === "number"
      ? subscription.current_period_start
      : typeof subscription.billing_cycle_anchor === "number"
        ? subscription.billing_cycle_anchor
        : null;

  if (startSeconds === null) {
    return null;
  }

  const endSeconds =
    typeof subscription.current_period_end === "number"
      ? subscription.current_period_end
      : (() => {
          const recurring = subscription.items.data[0]?.price.recurring;
          if (!recurring) return null;

          const periodEnd = new Date(startSeconds * 1000);
          const intervalCount = recurring.interval_count ?? 1;

          switch (recurring.interval) {
            case "day":
              periodEnd.setUTCDate(periodEnd.getUTCDate() + intervalCount);
              break;
            case "week":
              periodEnd.setUTCDate(periodEnd.getUTCDate() + intervalCount * 7);
              break;
            case "month":
              periodEnd.setUTCMonth(periodEnd.getUTCMonth() + intervalCount);
              break;
            case "year":
              periodEnd.setUTCFullYear(
                periodEnd.getUTCFullYear() + intervalCount,
              );
              break;
            default:
              return null;
          }

          return Math.floor(periodEnd.getTime() / 1000);
        })();

  if (endSeconds === null) {
    return null;
  }

  return {
    startMs: startSeconds * 1000,
    endMs: endSeconds * 1000,
  };
}

export async function createCheckoutSession(
  plan: SubscriptionPlan,
): Promise<never> {
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["stripe_monthly_price", "stripe_yearly_price"]);

  const priceKey =
    plan === "monthly" ? "stripe_monthly_price" : "stripe_yearly_price";
  const stripePriceId = settings?.find(
    (s: { key: string }) => s.key === priceKey,
  )?.value as string;

  // Get or create Stripe customer
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id;
  if (!customerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email!,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_uid: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    metadata: { supabase_uid: user.id, plan },
    subscription_data: {
      metadata: { supabase_uid: user.id, plan },
    },
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(): Promise<never> {
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) throw new Error("No Stripe customer found");

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  redirect(session.url);
}

export async function updateCharitySettings(formData: FormData) {
  const user = await getAuthUser();
  const supabase = await createClient();

  const charityId = formData.get("charity_id") as string;
  const percentage = Number(formData.get("charity_percentage"));

  if (percentage < 10 || percentage > 100) {
    return { error: "Charity percentage must be between 10% and 100%." };
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ selected_charity_id: charityId, charity_percentage: percentage })
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update charity settings." };

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

/** Stripe webhook handler (called from API route) */
export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_uid;
      const plan = (session.metadata?.plan ?? "monthly") as SubscriptionPlan;
      if (!userId) {
        console.error("[Webhook] No userId in metadata");
        break;
      }

      let stripeSubscription: Stripe.Subscription;
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
      } catch (err: any) {
        console.error(
          "[Webhook] Failed to retrieve subscription:",
          err?.message,
        );
        break;
      }

      const subscriptionItem = stripeSubscription.items.data[0];
      const periodBounds = getSubscriptionPeriodBounds(stripeSubscription);

      if (!subscriptionItem || !periodBounds) {
        console.error("[Webhook] Invalid subscription data:", {
          hasItem: Boolean(subscriptionItem),
          hasStart: stripeSubscription.current_period_start,
          hasEnd: stripeSubscription.current_period_end,
          billingCycleAnchor: stripeSubscription.billing_cycle_anchor,
        });
        break;
      }

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: stripeSubscription.id,
          stripe_price_id: subscriptionItem.price.id,
          plan,
          status: "active",
          current_period_start: new Date(periodBounds.startMs).toISOString(),
          current_period_end: new Date(periodBounds.endMs).toISOString(),
          monthly_fee_gbp: plan === "monthly" ? 999 : 694,
        },
        { onConflict: "user_id" },
      );

      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "subscription_created",
        table_name: "subscriptions",
        new_data: { plan, status: "active" },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_uid;
      if (!userId) break;

      const periodBounds = getSubscriptionPeriodBounds(sub);

      const statusMap: Record<string, string> = {
        active: "active",
        past_due: "past_due",
        canceled: "cancelled",
        unpaid: "past_due",
        trialing: "trialing",
        incomplete: "inactive",
      };

      await supabase
        .from("subscriptions")
        .update({
          status: (statusMap[sub.status] ?? "inactive") as any,
          ...(periodBounds
            ? {
                current_period_start: new Date(
                  periodBounds.startMs,
                ).toISOString(),
                current_period_end: new Date(periodBounds.endMs).toISOString(),
              }
            : {}),
          cancel_at_period_end: sub.cancel_at_period_end,
          cancelled_at: sub.canceled_at
            ? new Date(Number(sub.canceled_at) * 1000).toISOString()
            : null,
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }
}
