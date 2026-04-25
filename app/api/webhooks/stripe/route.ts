import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleStripeWebhook } from "@/app/actions/subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as any,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(
      "[Stripe Webhook] Signature verification failed:",
      err.message,
    );
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  try {
    await handleStripeWebhook(event);
  } catch (err: any) {
    console.error("[Stripe Webhook] Handler error:", err?.message || err);
    // Return 500 so Stripe retries - we want to know if it fails
    return NextResponse.json(
      { error: `Handler error: ${err?.message || err}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
