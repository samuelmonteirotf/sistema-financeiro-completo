import Stripe from 'stripe'

const EVENT_TYPES = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
] as const

type WebhookEvent = (typeof EVENT_TYPES)[number]
type PlanSlug = 'pro' | 'premium'
type BillingCycle = 'month' | 'year'

async function main() {
  const eventType = (process.argv[2] as WebhookEvent) || 'checkout.session.completed'
  if (!EVENT_TYPES.includes(eventType)) {
    console.error(`Evento inválido. Use um destes: ${EVENT_TYPES.join(', ')}`)
    process.exit(1)
  }

  const planArg = (process.argv.find((arg) => arg.startsWith('--plan=')) || '--plan=pro').split('=')[1] as PlanSlug
  const userId = (process.argv.find((arg) => arg.startsWith('--user=')) || '--user=demo-user').split('=')[1]
  const cycleArg = (process.argv.find((arg) => arg.startsWith('--cycle=')) || '--cycle=month').split('=')[1] as BillingCycle
  const billingCycle: BillingCycle = cycleArg === 'year' ? 'year' : 'month'
  const webhookUrl = process.env.STRIPE_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/stripe'
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurado')
  }

  const priceId =
    planArg === 'premium'
      ? billingCycle === 'year'
        ? process.env.STRIPE_PRICE_PREMIUM_ANNUAL
        : process.env.STRIPE_PRICE_PREMIUM_MONTHLY
      : billingCycle === 'year'
        ? process.env.STRIPE_PRICE_PRO_ANNUAL
        : process.env.STRIPE_PRICE_PRO_MONTHLY

  if (!priceId) {
    throw new Error(`Price ID para o plano ${planArg} não configurado`)
  }

  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2025-10-29.clover',
  })

  const customer = await stripeClient.customers.create({
    email: `test+${Date.now()}@example.com`,
    metadata: { userId },
  })

  const subscription = await stripeClient.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    metadata: { userId, plan: planArg, billingCycle },
  })

  const payload = buildPayload(eventType, {
    customer,
    subscription,
    plan: planArg,
    userId,
    billingCycle,
  })

  const payloadString = JSON.stringify(payload)
  const signature = stripeClient.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: webhookSecret,
  })

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body: payloadString,
  })

  const text = await response.text()
  console.log(`Webhook status: ${response.status}`)
  console.log(text)
}

function buildPayload(
  type: WebhookEvent,
  data: {
    customer: Stripe.Customer
    subscription: Stripe.Subscription
    plan: PlanSlug
    userId: string
    billingCycle: BillingCycle
  }
) {
  const baseEvent = {
    id: `evt_${Date.now()}`,
    object: 'event',
    type,
  }

  switch (type) {
    case 'checkout.session.completed':
      return {
        ...baseEvent,
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            object: 'checkout.session',
            customer: data.customer.id,
            subscription: data.subscription.id,
            metadata: {
              plan: data.plan,
              userId: data.userId,
              billingCycle: data.billingCycle,
            },
          },
        },
      }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return {
        ...baseEvent,
        data: {
          object: {
            ...data.subscription,
            status:
              type === 'customer.subscription.deleted'
                ? 'canceled'
                : data.subscription.status,
            canceled_at:
              type === 'customer.subscription.deleted'
                ? Math.floor(Date.now() / 1000)
                : data.subscription.canceled_at,
          },
        },
      }
    default:
      return {
        ...baseEvent,
        data: {
          object: {},
        },
      }
  }
}

main().catch((error) => {
  console.error('Erro ao simular webhook:', error)
  process.exit(1)
})
