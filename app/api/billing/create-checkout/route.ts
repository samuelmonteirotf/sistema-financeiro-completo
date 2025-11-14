import type Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { getPriceId, getStripe, type BillingCycle } from '@/lib/stripe'

const ALLOWED_PLANS = ['PRO', 'PREMIUM'] as const
type CheckoutPlan = (typeof ALLOWED_PLANS)[number]
type PlanSlug = 'pro' | 'premium'

const PLAN_SLUG_MAP: Record<CheckoutPlan, PlanSlug> = {
  PRO: 'pro',
  PREMIUM: 'premium',
}

const successUrl =
  process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/dashboard/billing'
const cancelUrl =
  process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/pricing'

export async function POST(request: Request) {
  try {
    const maybeUser = await getUserIdOrUnauthorized()
    if (maybeUser instanceof NextResponse) {
      return maybeUser
    }
    const userId = maybeUser

    const body = await request.json().catch(() => ({}))
    const rawPlanSlug =
      typeof body.planSlug === 'string'
        ? (body.planSlug as string).toLowerCase().trim()
        : null
    const billingCycle = (body.billingCycle as BillingCycle) === 'year' ? 'year' : 'month'

    let plan: CheckoutPlan | null = null
    if (rawPlanSlug === 'pro') {
      plan = 'PRO'
    } else if (rawPlanSlug === 'premium') {
      plan = 'PREMIUM'
    } else if (typeof body.plan === 'string') {
      const upper = (body.plan as string).toUpperCase() as CheckoutPlan
      plan = ALLOWED_PLANS.includes(upper) ? upper : null
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const planSlug = PLAN_SLUG_MAP[plan]
    const priceId = getPriceId(plan, billingCycle)

    const stripeMockEnabled = process.env.STRIPE_MOCK === 'true'
    const stripeClient: Stripe | null = stripeMockEnabled ? null : getStripe()

    let customerId = user.stripeId ?? null

    if (!customerId) {
      if (stripeClient) {
        const customer = await stripeClient.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
          },
        })

        customerId = customer.id

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeId: customerId,
          },
        })

        const freePlan = await prisma.plan.findUnique({
          where: { slug: 'free' },
        })

        if (!freePlan) {
          throw new Error('Plano FREE não configurado')
        }

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            planId: freePlan.id,
            status: 'active',
            stripeId: customerId,
          },
          update: {
            stripeId: customerId,
          },
        })
      } else {
        customerId = `mock_customer_${user.id}`
      }
    }

    const planRecord = await prisma.plan.findUnique({
      where: { slug: planSlug },
    })

    if (!planRecord) {
      return NextResponse.json(
        { error: 'Plano selecionado não está disponível' },
        { status: 400 }
      )
    }

    if (!stripeClient) {
      return NextResponse.json({
        sessionId: 'mock_checkout_session',
        url: `${successUrl}?mockCheckout=true`,
      })
    }

    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?canceled=true`,
      metadata: {
        userId: user.id,
        plan: planSlug,
        period: billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: planSlug,
          period: billingCycle,
        },
        trial_period_days: 14,
      },
      locale: 'pt-BR',
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento', message: error.message },
      { status: 500 }
    )
  }
}
