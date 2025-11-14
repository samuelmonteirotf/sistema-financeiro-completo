import fs from 'fs/promises'
import path from 'path'
import type { Plan, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type Resource = 'expenses' | 'cards' | 'categories' | 'loans'

const ACTIVE_STATUSES = new Set(['active', 'trialing'])
const FEATURE_LIMITS_ENABLED = process.env.FEATURE_LIMITS !== 'false'
const LIMIT_LOG_PATH = path.resolve(process.cwd(), 'logs', 'limits-events.json')

type PlanLimits = Record<string, number | boolean>

const RESOURCE_TO_LIMIT_KEY: Record<Resource, string> = {
  expenses: 'maxExpensesPerMonth',
  cards: 'maxCards',
  categories: 'maxCategories',
  loans: 'maxLoans',
}

const DEFAULT_LIMITS: Record<string, number> = {
  maxExpensesPerMonth: 50,
  maxCards: 2,
  maxCategories: 10,
  maxLoans: 0,
}

const DEFAULT_FEATURES: string[] = []

const DEFAULT_PLAN: Pick<Plan, 'slug' | 'name'> & {
  limits: PlanLimits
  features: string[]
} = {
  slug: 'free',
  name: 'Free',
  limits: {
    maxExpensesPerMonth: DEFAULT_LIMITS.maxExpensesPerMonth,
    maxCards: DEFAULT_LIMITS.maxCards,
    maxCategories: DEFAULT_LIMITS.maxCategories,
    maxLoans: DEFAULT_LIMITS.maxLoans,
  },
  features: DEFAULT_FEATURES,
}

function parseJsonValue<T>(value: Prisma.JsonValue | null | undefined, fallback: T): T {
  if (value === null || value === undefined) return fallback

  if (Array.isArray(value) || typeof value === 'object') {
    return value as T
  }

  return fallback
}

async function logLimitEvent(entry: {
  userId: string
  plan: string
  resource: Resource
  used: number
  limit: number
  action: 'allow' | 'block'
}) {
  if (process.env.LOG_LIMITS === 'false') {
    return
  }

  try {
    await fs.mkdir(path.dirname(LIMIT_LOG_PATH), { recursive: true })
    const payload = {
      ts: new Date().toISOString(),
      ...entry,
    }

    let existing: any[] = []
    try {
      const raw = await fs.readFile(LIMIT_LOG_PATH, 'utf8')
      existing = JSON.parse(raw)
      if (!Array.isArray(existing)) {
        existing = []
      }
    } catch {
      existing = []
    }

    existing.push(payload)
    await fs.writeFile(LIMIT_LOG_PATH, JSON.stringify(existing, null, 2), 'utf8')
  } catch (error) {
    console.error('Erro ao registrar log de limites:', error)
  }
}

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  })
}

export async function getPlanForUser(userId: string) {
  const subscription = await getActiveSubscription(userId)
  const plan = subscription?.plan ?? (await prisma.plan.findUnique({ where: { slug: 'free' } }))

  const limits = resolvePlanLimits(plan)
  const features = resolvePlanFeatures(plan)

  return {
    slug: plan?.slug ?? DEFAULT_PLAN.slug,
    name: plan?.name ?? DEFAULT_PLAN.name,
    planId: plan?.id ?? null,
    status: subscription?.status ?? 'inactive',
    subscriptionId: subscription?.id ?? null,
    limits,
    features,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  }
}

export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const plan = await getPlanForUser(userId)

  if (!FEATURE_LIMITS_ENABLED) {
    return true
  }

  if (!ACTIVE_STATUSES.has(plan.status)) {
    return plan.slug === 'free' && plan.features.includes(feature)
  }

  return plan.features.includes(feature)
}

export async function getUsage(userId: string): Promise<Record<Resource, number>> {
  const [expenses, cards, categories, loans] = await Promise.all([
    prisma.expense.count({ where: { userId } }),
    prisma.creditCard.count({ where: { userId } }),
    prisma.category.count({ where: { ownerId: userId } }),
    prisma.loan.count({ where: { userId } }),
  ])

  return {
    expenses,
    cards,
    categories,
    loans,
  }
}

type LimitCheckSuccess = {
  ok: true
  used: number
  limit: number
  plan: string
  subscriptionId: string | null
}

type LimitCheckFailure = {
  ok: false
  requiredPlan: string
  used: number
  limit: number
}

export async function checkLimit(
  userId: string,
  resource: Resource,
  delta = 1
): Promise<LimitCheckSuccess | LimitCheckFailure> {
  const planInfo = await getPlanForUser(userId)
  const usage = await getUsage(userId)
  const limitKey = RESOURCE_TO_LIMIT_KEY[resource]
  const configuredLimit = Number(planInfo.limits[limitKey] ?? DEFAULT_LIMITS[limitKey] ?? -1)
  const used = usage[resource] ?? 0
  const limit = Number.isNaN(configuredLimit) ? -1 : configuredLimit

  if (!FEATURE_LIMITS_ENABLED || limit === -1) {
    await logLimitEvent({
      userId,
      plan: planInfo.slug,
      resource,
      used,
      limit,
      action: 'allow',
    })

    return {
      ok: true,
      used,
      limit,
      plan: planInfo.slug,
      subscriptionId: planInfo.subscriptionId,
    }
  }

  const nextValue = used + delta
  const allowed = nextValue <= limit

  if (!allowed) {
    const requiredPlan = planInfo.slug === 'pro' ? 'premium' : 'pro'
    await logLimitEvent({
      userId,
      plan: planInfo.slug,
      resource,
      used,
      limit,
      action: 'block',
    })

    return {
      ok: false,
      requiredPlan,
      used,
      limit,
    }
  }

  await logLimitEvent({
    userId,
    plan: planInfo.slug,
    resource,
    used,
    limit,
    action: 'allow',
  })

  return {
    ok: true,
    used,
    limit,
    plan: planInfo.slug,
    subscriptionId: planInfo.subscriptionId,
  }
}

export async function recordUsage(
  subscriptionId: string | null,
  resource: Resource,
  used: number,
  limitValue: number,
  planSlug: string
): Promise<void> {
  if (!subscriptionId) return

  try {
    await prisma.limitHistory.create({
      data: {
        subscriptionId,
        resource,
        used,
        limitValue,
      },
    })

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (subscription) {
      await recordUsageSnapshot(subscription.userId, planSlug, resource, used, limitValue)
    }
  } catch (error) {
    console.error('Erro ao registrar LimitHistory:', error)
  }
}

export async function recordUsageSnapshot(
  userId: string,
  planSlug: string,
  resource: Resource,
  used: number,
  limitValue: number
) {
  try {
    await prisma.usageSnapshot.create({
      data: {
        userId,
        planSlug,
        resource,
        used,
        limitValue,
      },
    })
  } catch (error) {
    console.error('Erro ao registrar UsageSnapshot:', error)
  }
}

function resolvePlanLimits(plan?: Plan | null): PlanLimits {
  if (!plan) {
    return DEFAULT_PLAN.limits
  }

  const parsed = parseJsonValue<PlanLimits>(plan.limits, {})
  return {
    ...DEFAULT_PLAN.limits,
    ...parsed,
  }
}

function resolvePlanFeatures(plan?: Plan | null): string[] {
  if (!plan) {
    return DEFAULT_FEATURES
  }

  const parsed = parseJsonValue<string[]>(plan.features, [])
  return parsed
}

export async function requireFeature(userId: string, feature: string): Promise<void> {
  const hasAccess = await hasFeatureAccess(userId, feature)
  if (!hasAccess) {
    throw new Error('feature_locked')
  }
}
