import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { Plan } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET não configurado')
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PlanSlug = 'free' | 'pro' | 'premium'

const PLAN_ALIASES: Record<string, PlanSlug> = {
  FREE: 'free',
  BASIC: 'pro',
  PRO: 'pro',
  PREMIUM: 'premium',
  ENTERPRISE: 'premium',
}

const planCache = new Map<PlanSlug, Plan>()
const stripeEventLogPath = path.resolve(process.cwd(), 'logs', 'stripe-events.json')
const PLAN_PRIORITY: Record<PlanSlug, number> = {
  free: 0,
  pro: 1,
  premium: 2,
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripeClient = getStripe()
  let event: Stripe.Event

  try {
    event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook event:', event.type)
  await logStripeEvent({ id: event.id, type: event.type, status: 'received' })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    await logStripeEvent({ id: event.id, type: event.type, status: 'processed' })
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    await logStripeEvent({
      id: event.id,
      type: event.type,
      status: 'failed',
      error: error.message,
    })
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planSlug = resolvePlanSlug(session.metadata?.plan)

  if (!userId || !planSlug) {
    throw new Error('Missing metadata in checkout session')
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!subscriptionId) {
    throw new Error('Checkout session sem subscriptionId')
  }

  const stripeSubscription = await fetchStripeSubscription(subscriptionId)
  const status = stripeSubscription.status ?? 'active'
  const currentPeriodEnd = getCurrentPeriodEndDate(stripeSubscription)
  const trialEndsAt = stripeSubscription.trial_end
    ? new Date(stripeSubscription.trial_end * 1000)
    : null
  const customerId =
    typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id

  const plan = await getPlanBySlug(planSlug)
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  })

  if (customerId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeId: customerId,
      },
    })
  }

  const record = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status,
      stripeId: customerId,
      stripeSubId: subscriptionId,
      currentPeriodEnd,
      trialEndsAt,
    },
    update: {
      planId: plan.id,
      status,
      stripeId: customerId,
      stripeSubId: subscriptionId,
      currentPeriodEnd,
      trialEndsAt,
    },
  })

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      subscriptionId: record.id,
      fromPlanId: existingSubscription?.planId,
      toPlanId: plan.id,
      reason: 'checkout_completed',
    },
  })

  console.log(`✅ Subscription created for user ${userId}: ${plan.slug}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId

  if (!userId) {
    throw new Error('Missing userId in subscription metadata')
  }

  const planSlug = resolvePlanSlug(subscription.metadata.plan)
  const planUpdate = planSlug ? await getPlanBySlug(planSlug) : null
  const currentPeriodEnd = getCurrentPeriodEndDate(subscription)
  const trialEndsAt = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  })

  if (!existingSubscription) {
    const plan = planUpdate ?? (await getPlanBySlug('free'))

    if (customerId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeId: customerId,
        },
      })
    }

    const created = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: subscription.status ?? 'active',
        stripeId: customerId,
        stripeSubId: subscription.id,
        currentPeriodEnd,
        trialEndsAt,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    })

    await prisma.subscriptionHistory.create({
      data: {
        userId,
        subscriptionId: created.id,
        toPlanId: plan.id,
        reason: 'stripe_sync',
      },
    })

    console.log(`ℹ️ Subscription criada via webhook para ${userId}`)
    return
  }

  const updated = await prisma.subscription.update({
    where: { userId },
    data: {
      status: subscription.status ?? 'active',
      currentPeriodEnd,
      trialEndsAt,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      ...(planUpdate ? { planId: planUpdate.id } : {}),
    },
  })

  if (planUpdate && existingSubscription.planId !== planUpdate.id) {
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        subscriptionId: updated.id,
        fromPlanId: existingSubscription.planId,
        toPlanId: planUpdate.id,
        reason: 'subscription_updated',
      },
    })

    const previousPriority = getPlanPriority(existingSubscription.plan)
    const newPriority = getPlanPriority(planUpdate)

    if (newPriority < previousPriority) {
      await recordLimitHistory({
        subscriptionId: updated.id,
        resource: 'plan_downgrade',
        limitValue: newPriority,
      })
    }
  }

  console.log(`✅ Subscription updated for user ${userId}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId
  if (!userId) return

  const freePlan = await getPlanBySlug('free')
  const currentSubscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const record = await prisma.subscription.update({
    where: { userId },
    data: {
      planId: freePlan.id,
      status: 'canceled',
      stripeSubId: null,
      currentPeriodEnd: null,
    },
  })

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      subscriptionId: record.id,
      fromPlanId: currentSubscription?.planId,
      toPlanId: freePlan.id,
      reason: 'subscription_canceled',
    },
  })

  await recordLimitHistory({
    subscriptionId: record.id,
    resource: 'plan_canceled',
    limitValue: 0,
  })

  console.log(`✅ Subscription canceled for user ${userId}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = extractSubscriptionIdFromInvoice(invoice)
  if (!subscriptionId) return

  const stripeSub = await fetchStripeSubscription(subscriptionId)
  const userId = stripeSub.metadata.userId
  if (!userId) return

  const currentPeriodEnd = getCurrentPeriodEndDate(stripeSub)

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'active',
      currentPeriodEnd,
    },
  })

  console.log(`✅ Payment succeeded for user ${userId}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = extractSubscriptionIdFromInvoice(invoice)
  if (!subscriptionId) return

  const stripeSub = await fetchStripeSubscription(subscriptionId)
  const userId = stripeSub.metadata.userId
  if (!userId) return

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'past_due',
    },
  })

  console.log(`⚠️ Payment failed for user ${userId}`)
}

type StripeEventLogEntry = {
  id: string
  type: string
  status: 'received' | 'processed' | 'failed'
  error?: string
  timestamp?: string
}

async function logStripeEvent(entry: StripeEventLogEntry) {
  try {
    const enriched = {
      ...entry,
      timestamp: new Date().toISOString(),
    }
    await fs.mkdir(path.dirname(stripeEventLogPath), { recursive: true })
    let data: StripeEventLogEntry[] = []
    try {
      const raw = await fs.readFile(stripeEventLogPath, 'utf8')
      data = JSON.parse(raw)
    } catch {
      data = []
    }
    data.push(enriched)
    await fs.writeFile(stripeEventLogPath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Não foi possível registrar log do Stripe:', error)
  }
}

async function recordLimitHistory(options: { subscriptionId: string; resource: string; limitValue?: number }) {
  try {
    await prisma.limitHistory.create({
      data: {
        subscriptionId: options.subscriptionId,
        resource: options.resource,
        used: 0,
        limitValue: options.limitValue ?? 0,
      },
    })
  } catch (error) {
    console.error('Erro ao registrar LimitHistory:', error)
  }
}

function getPlanPriority(plan: Plan | null | undefined): number {
  if (!plan) return PLAN_PRIORITY.free
  const slug = resolvePlanSlug(plan.slug)
  return PLAN_PRIORITY[slug] ?? PLAN_PRIORITY.free
}

function resolvePlanSlug(plan?: string | null): PlanSlug {
  if (!plan) return 'free'
  const upper = plan.toUpperCase()
  if (PLAN_ALIASES[upper]) {
    return PLAN_ALIASES[upper]
  }
  const normalized = plan.toLowerCase()
  if (normalized === 'premium') return 'premium'
  if (normalized === 'pro') return 'pro'
  return 'free'
}

async function getPlanBySlug(slug: PlanSlug) {
  const cached = planCache.get(slug)
  if (cached) {
    return cached
  }

  const plan = await prisma.plan.findUnique({
    where: { slug },
  })

  if (!plan) {
    throw new Error(`Plano ${slug} não encontrado`)
  }

  planCache.set(slug, plan)
  return plan
}

async function fetchStripeSubscription(subscriptionId: string) {
  const stripeClient = getStripe()
  return (await stripeClient.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription
}

function getCurrentPeriodEndDate(subscription: Stripe.Subscription) {
  const legacySubscription = subscription as Stripe.Subscription & {
    current_period_end?: number | null
  }

  if (legacySubscription.current_period_end) {
    return new Date(legacySubscription.current_period_end * 1000)
  }

  const item = subscription.items?.data?.[0] as (Stripe.SubscriptionItem & {
    current_period_end?: number
  }) | undefined

  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000)
  }

  return null
}

function extractSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const legacyInvoice = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
  }
  const legacySubscription = legacyInvoice.subscription
  if (legacySubscription) {
    return typeof legacySubscription === 'string' ? legacySubscription : legacySubscription.id
  }

  const subscriptionDetails = invoice.parent?.subscription_details?.subscription
  if (!subscriptionDetails) {
    return null
  }

  return typeof subscriptionDetails === 'string'
    ? subscriptionDetails
    : subscriptionDetails.id
}
