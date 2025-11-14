import { beforeAll, afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { POST as createCheckout } from '@/app/api/billing/create-checkout/route'
import { POST as createExpense } from '@/app/api/expenses/route'
import { POST as exportData } from '@/app/api/export/route'

const {
  mockGetUserIdOrUnauthorized,
  mockCheckLimit,
  mockRecordUsage,
  mockHasFeatureAccess,
} = vi.hoisted(() => ({
  mockGetUserIdOrUnauthorized: vi.fn(),
  mockCheckLimit: vi.fn(),
  mockRecordUsage: vi.fn(),
  mockHasFeatureAccess: vi.fn(),
}))

vi.mock('@/lib/auth-utils', () => ({
  getUserIdOrUnauthorized: mockGetUserIdOrUnauthorized,
}))

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
  },
  subscription: {
    upsert: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

const {
  mockGetPriceId,
  mockGetStripe,
} = vi.hoisted(() => ({
  mockGetPriceId: vi.fn(() => 'price_mock'),
  mockGetStripe: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  getPriceId: mockGetPriceId,
  getStripe: mockGetStripe,
}))

vi.mock('@/lib/limits', () => ({
  checkLimit: mockCheckLimit,
  recordUsage: mockRecordUsage,
  hasFeatureAccess: mockHasFeatureAccess,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUserIdOrUnauthorized.mockResolvedValue('user_123')
  mockPrisma.user.findUnique.mockReset()
  mockPrisma.user.update.mockReset()
  mockPrisma.plan.findUnique.mockReset()
  mockPrisma.subscription.upsert.mockReset()
})

async function callRoute(
  handler: (request: Request) => Promise<Response>,
  method: 'post' | 'get',
  url: string,
  body?: Record<string, unknown>
) {
  const headers = new Headers()
  let requestBody: BodyInit | undefined

  if (body) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  const requestInit: RequestInit = {
    method: method.toUpperCase(),
    headers,
    body: requestBody,
  }

  const response = await handler(new Request(`http://localhost${url}`, requestInit))
  const contentType = response.headers.get('content-type') ?? ''
  let parsedBody: any = null

  if (contentType.includes('application/json')) {
    parsedBody = await response.json()
  } else {
    parsedBody = await response.text()
  }

  return {
    status: response.status,
    body: parsedBody,
    headers: response.headers,
  }
}

describe('routes guard responses', () => {
  test('routes :: POST /api/expenses retorna 402 quando limite foi atingido', async () => {
    mockCheckLimit.mockResolvedValueOnce({
      ok: false,
      requiredPlan: 'pro',
      used: 50,
      limit: 50,
    })

    const response = await callRoute(createExpense, 'post', '/api/expenses', {
      description: 'Compra test',
    })

    expect(response.status).toBe(402)
    expect(response.body).toMatchObject({
      error: 'limit_exceeded',
      resource: 'expenses',
      requiredPlan: 'pro',
      used: 50,
      limit: 50,
      upgradeUrl: '/pricing?highlight=pro',
    })
  })

  test('routes :: POST /api/export retorna 402 quando feature não está disponível', async () => {
    mockHasFeatureAccess.mockResolvedValueOnce(false)

    const response = await callRoute(exportData, 'post', '/api/export', {
      format: 'csv',
    })

    expect(response.status).toBe(402)
    expect(response.body).toMatchObject({
      error: 'feature_locked',
      resource: 'export',
      requiredPlan: 'pro',
    })
  })
})

describe('billing :: POST /api/billing/create-checkout', () => {
  const originalStripeMock = process.env.STRIPE_MOCK

  beforeAll(() => {
    process.env.STRIPE_MOCK = 'true'
  })

  afterAll(() => {
    process.env.STRIPE_MOCK = originalStripeMock
  })

  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      name: 'User Test',
      stripeId: 'cus_123',
      subscription: {
        status: 'active',
        plan: { slug: 'pro' },
      },
    })

    mockPrisma.plan.findUnique.mockResolvedValue({
      id: 'plan_premium',
      slug: 'premium',
    })
  })

  test('permite upgrade mesmo com assinatura ativa quando STRIPE_MOCK está habilitado', async () => {
    const response = await callRoute(createCheckout, 'post', '/api/billing/create-checkout', {
      planSlug: 'premium',
      billingCycle: 'month',
    })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      sessionId: 'mock_checkout_session',
    })
    expect(mockPrisma.user.findUnique).toHaveBeenCalled()
    expect(mockGetPriceId).toHaveBeenCalledWith('PREMIUM', 'month')
  })
})
