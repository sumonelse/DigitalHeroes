import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/app/actions/subscriptions'
import type { SubscriptionPlan } from '@/types'

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('plan') as SubscriptionPlan
  if (!['monthly', 'yearly'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }
  // createCheckoutSession redirects internally
  return createCheckoutSession(plan)
}
