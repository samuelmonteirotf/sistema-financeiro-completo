import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

process.env.LOG_LIMITS = 'false'

type Resource = 'expenses' | 'cards' | 'categories' | 'loans'

const mockPrisma = {
  subscription: { findUnique: vi.fn() },
  plan: { findUnique: vi.fn() },
  expense: { count: vi.fn() },
  creditCard: { count: vi.fn() },
  category: { count: vi.fn() },
  loan: { count: vi.fn() },
  limitHistory: { create: vi.fn() },
  usageSnapshot: { create: vi.fn() },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

type LimitsModule = typeof import('@/lib/limits')
let checkLimit: LimitsModule['checkLimit']
let hasFeatureAccess: LimitsModule['hasFeatureAccess']

let subscriptionStatus = 'active'
let planSlug = 'pro'
let planFeatures: string[] = ['export_csv']
let planLimits = {
  maxExpensesPerMonth: 5,
  maxCards: 2,
  maxCategories: 10,
  maxLoans: 1,
}

beforeAll(async () => {
  const module = await import('@/lib/limits')
  checkLimit = module.checkLimit
  hasFeatureAccess = module.hasFeatureAccess
})

beforeEach(() => {
  vi.clearAllMocks()
  subscriptionStatus = 'active'
  planSlug = 'pro'
  planFeatures = ['export_csv']
  planLimits = {
    maxExpensesPerMonth: 5,
    maxCards: 2,
    maxCategories: 10,
    maxLoans: 1,
  }

  mockPrisma.subscription.findUnique.mockImplementation(async () => ({
    id: 'sub_123',
    userId: 'user_123',
    status: subscriptionStatus,
    planId: 'plan_123',
    plan: buildPlan(),
    currentPeriodEnd: new Date(),
  }))

  mockPrisma.plan.findUnique.mockResolvedValue(null)
  setUsage({})
})

function buildPlan() {
  return {
    id: 'plan_123',
    name: planSlug === 'free' ? 'Free' : 'Pro',
    slug: planSlug,
    price: planSlug === 'free' ? 0 : 3990,
    currency: 'BRL',
    period: 'month',
    limits: { ...planLimits },
    features: [...planFeatures],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function setUsage(values: Partial<Record<Resource, number>>) {
  const usage: Record<Resource, number> = {
    expenses: 0,
    cards: 0,
    categories: 0,
    loans: 0,
    ...values,
  }

  mockPrisma.expense.count.mockResolvedValue(usage.expenses)
  mockPrisma.creditCard.count.mockResolvedValue(usage.cards)
  mockPrisma.category.count.mockResolvedValue(usage.categories)
  mockPrisma.loan.count.mockResolvedValue(usage.loans)
}

describe('limits helpers', () => {
  test('allows creation when next usage stays below the plan limit (limit-1)', async () => {
    setUsage({ expenses: 3 }) // next value = 4 (< 5)
    const result = await checkLimit('user_123', 'expenses')

    expect(result.ok).toBe(true)
    expect(result.limit).toBe(5)
    expect(result.used).toBe(3)
  })

  test('allows creation when the next usage matches the plan limit', async () => {
    setUsage({ expenses: 4 }) // next value = 5 (== limit)
    const result = await checkLimit('user_123', 'expenses')

    expect(result.ok).toBe(true)
    expect(result.limit).toBe(5)
    expect(result.used).toBe(4)
  })

  test('blocks creation when the next usage exceeds the plan limit', async () => {
    setUsage({ expenses: 5 }) // next value = 6 (> 5)
    const result = await checkLimit('user_123', 'expenses')

    expect(result).toEqual({
      ok: false,
      requiredPlan: 'premium',
      used: 5,
      limit: 5,
    })
  })
})

describe('hasFeatureAccess', () => {
  test('returns true when feature exists on an active subscription', async () => {
    planFeatures = ['export_csv']
    const allowed = await hasFeatureAccess('user_123', 'export_csv')
    expect(allowed).toBe(true)
  })

  test('returns false when the feature is missing from the plan', async () => {
    planFeatures = []
    const allowed = await hasFeatureAccess('user_123', 'export_csv')
    expect(allowed).toBe(false)
  })

  test('blocks access when subscription status is not active/trialing', async () => {
    subscriptionStatus = 'past_due'
    planFeatures = ['export_csv']
    const allowed = await hasFeatureAccess('user_123', 'export_csv')

    expect(allowed).toBe(false)
  })
})
