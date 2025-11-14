import Stripe from 'stripe'

const API_VERSION = '2025-10-29.clover' satisfies Stripe.LatestApiVersion
let stripeClient: Stripe | null = null

export type PaidPlan = 'PRO' | 'PREMIUM'
export type BillingCycle = 'month' | 'year'

const PRICE_ENV_MAP: Record<PaidPlan, Record<BillingCycle, string>> = {
  PRO: {
    month: 'STRIPE_PRICE_PRO_MONTHLY',
    year: 'STRIPE_PRICE_PRO_ANNUAL',
  },
  PREMIUM: {
    month: 'STRIPE_PRICE_PREMIUM_MONTHLY',
    year: 'STRIPE_PRICE_PREMIUM_ANNUAL',
  },
}

export function getStripe(): Stripe {
  if (process.env.STRIPE_MOCK === 'true') {
    throw new Error('Stripe em modo mock - cliente não disponível')
  }

  if (stripeClient) {
    return stripeClient
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurado')
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: API_VERSION,
    typescript: true,
    appInfo: {
      name: 'Sistema Financeiro',
      version: '1.0.0',
    },
  })

  return stripeClient
}

export function getPriceId(plan: PaidPlan, cycle: BillingCycle = 'month'): string {
  const envKey = PRICE_ENV_MAP[plan][cycle]
  const priceId = process.env[envKey]
  if (!priceId) {
    throw new Error(`Variável ${envKey} não configurada`)
  }
  return priceId
}
