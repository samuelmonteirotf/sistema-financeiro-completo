import type { Page } from '@playwright/test'

type Resource = 'expenses' | 'cards' | 'categories' | 'loans'

type BillingStatus = {
  plan: { slug: string; name: string }
  status: string
  limits: Record<Resource, number>
  usage: Record<Resource, number>
  features: string[]
  currentPeriodEnd: string | null
}

type Scenario = 'free' | 'pro'

type Overrides = Omit<Partial<BillingStatus>, 'limits' | 'usage' | 'plan'> & {
  limits?: Partial<Record<Resource, number>>
  usage?: Partial<Record<Resource, number>>
  plan?: Partial<BillingStatus['plan']>
}

const baseScenarios: Record<Scenario, BillingStatus> = {
  free: {
    plan: { slug: 'free', name: 'Free' },
    status: 'active',
    limits: {
      expenses: 50,
      cards: 2,
      categories: 10,
      loans: 0,
    },
    usage: {
      expenses: 50,
      cards: 2,
      categories: 10,
      loans: 0,
    },
    features: [],
    currentPeriodEnd: null,
  },
  pro: {
    plan: { slug: 'pro', name: 'Pro' },
    status: 'active',
    limits: {
      expenses: 500,
      cards: 5,
      categories: -1,
      loans: 2,
    },
    usage: {
      expenses: 120,
      cards: 3,
      categories: 12,
      loans: 1,
    },
    features: ['export_csv', 'advanced_reports'],
    currentPeriodEnd: new Date().toISOString(),
  },
}

function buildPayload(scenario: Scenario, overrides: Overrides = {}): BillingStatus {
  const base = baseScenarios[scenario]

  return {
    plan: {
      ...base.plan,
      ...(overrides.plan ?? {}),
    },
    status: overrides.status ?? base.status,
    limits: {
      ...base.limits,
      ...(overrides.limits ?? {}),
    },
    usage: {
      ...base.usage,
      ...(overrides.usage ?? {}),
    },
    features: overrides.features ?? base.features,
    currentPeriodEnd: overrides.currentPeriodEnd ?? base.currentPeriodEnd,
  }
}

export async function mockBillingStatus(page: Page, scenario: Scenario, overrides: Overrides = {}) {
  let payload = buildPayload(scenario, overrides)

  await page.route('**/api/billing/status', (route) => {
    if (route.request().method() !== 'GET') {
      route.continue()
      return
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    })
  })

  return {
    update(nextScenario: Scenario, nextOverrides: Overrides = {}) {
      payload = buildPayload(nextScenario, nextOverrides)
    },
  }
}
