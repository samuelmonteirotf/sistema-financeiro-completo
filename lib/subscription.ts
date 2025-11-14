import { Plan, Prisma } from '@prisma/client'
import Decimal from 'decimal.js'
import { prisma } from '@/lib/prisma'

type PlanLimits = {
  maxExpensesPerMonth: number
  maxCards: number
  maxCategories: number
  canUseInvestments: boolean
  canUseLentMoney: boolean
  canExportReports: boolean
  canUseAdvancedReports: boolean
  maxHouseholdMembers: number
}

type PlanLimitKey = keyof PlanLimits
type LimitType = 'expenses' | 'cards' | 'categories'

const DEFAULT_PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxExpensesPerMonth: 50,
    maxCards: 2,
    maxCategories: 10,
    canUseInvestments: false,
    canUseLentMoney: false,
    canExportReports: false,
    canUseAdvancedReports: false,
    maxHouseholdMembers: 1,
  },
  pro: {
    maxExpensesPerMonth: 500,
    maxCards: 5,
    maxCategories: -1,
    canUseInvestments: true,
    canUseLentMoney: false,
    canExportReports: false,
    canUseAdvancedReports: false,
    maxHouseholdMembers: 3,
  },
  premium: {
    maxExpensesPerMonth: 2000,
    maxCards: 20,
    maxCategories: -1,
    canUseInvestments: true,
    canUseLentMoney: true,
    canExportReports: true,
    canUseAdvancedReports: true,
    maxHouseholdMembers: 5,
  },
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

function normalizePlanSlug(slug?: string | null) {
  if (!slug) return 'free'
  return slug.toLowerCase()
}

function parseLimits(limits: Prisma.JsonValue | null | undefined): Partial<PlanLimits> {
  if (!limits || typeof limits !== 'object') {
    return {}
  }

  const entries = limits as Record<string, unknown>
  const parsed: Partial<PlanLimits> = {}

  Object.entries(entries).forEach(([key, value]) => {
    if (typeof value === 'number' || typeof value === 'boolean') {
      parsed[key as PlanLimitKey] = value as never
    }
  })

  return parsed
}

function resolvePlanLimits(plan?: Plan | null): PlanLimits {
  const slug = normalizePlanSlug(plan?.slug)
  const defaults = DEFAULT_PLAN_LIMITS[slug] ?? DEFAULT_PLAN_LIMITS.free
  const planLimits = parseLimits(plan?.limits)

  return {
    ...defaults,
    ...planLimits,
  }
}

function resolveFeatureValue(limits: PlanLimits, feature: PlanLimitKey) {
  return limits[feature]
}

function userHasActiveSubscription(status?: string | null) {
  if (!status) return false
  return ACTIVE_STATUSES.has(status.toLowerCase())
}

/**
 * Verifica se o usuário possui acesso a uma feature específica
 */
export function hasFeatureAccess(
  subscription: { status: string; plan: Plan | null } | null,
  feature: PlanLimitKey
): boolean {
  const status = subscription?.status ?? 'inactive'
  const slug = normalizePlanSlug(subscription?.plan?.slug)
  const limits = resolvePlanLimits(subscription?.plan)

  if (!userHasActiveSubscription(status)) {
    const freeLimits = DEFAULT_PLAN_LIMITS.free
    const freeValue = resolveFeatureValue(freeLimits, feature)
    return typeof freeValue === 'boolean' ? freeValue : freeValue > 0
  }

  const featureValue = resolveFeatureValue(limits, feature)
  if (typeof featureValue === 'boolean') {
    return featureValue
  }

  if (featureValue === -1) {
    return true
  }

  return featureValue > 0
}

/**
 * Verifica limite numérico de recursos
 */
export async function checkLimit(
  userId: string,
  limitType: LimitType,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number; planName: string }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  })

  const plan = subscription?.plan ?? null
  const limits = resolvePlanLimits(plan)

  let limit = -1
  switch (limitType) {
    case 'expenses':
      limit = limits.maxExpensesPerMonth
      break
    case 'cards':
      limit = limits.maxCards
      break
    case 'categories':
      limit = limits.maxCategories
      break
  }

  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      current: currentCount,
      planName: plan?.name ?? 'Free',
    }
  }

  return {
    allowed: currentCount < limit,
    limit,
    current: currentCount,
    planName: plan?.name ?? 'Free',
  }
}

/**
 * Conta despesas do mês corrente
 */
export async function getMonthlyExpenseCount(userId: string): Promise<number> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  return prisma.expense.count({
    where: {
      userId,
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
  })
}

async function findPlanBySlug(slug: string) {
  const normalized = normalizePlanSlug(slug)
  const plan = await prisma.plan.findUnique({
    where: { slug: normalized },
  })

  if (!plan) {
    throw new Error(`Plano ${normalized} não encontrado`)
  }

  return plan
}

/**
 * Cria subscription padrão para novo usuário
 */
export async function createSubscription(
  userId: string,
  planSlug: string = 'free'
) {
  const plan = await findPlanBySlug(planSlug)

  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'active',
    },
  })
}

/**
 * Atualiza assinatura do usuário
 */
export async function updateSubscriptionPlan(
  userId: string,
  newPlanSlug: string,
  reason: string
) {
  const [subscription, newPlan] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    }),
    findPlanBySlug(newPlanSlug),
  ])

  if (!subscription) {
    throw new Error('Subscription não encontrada')
  }

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      fromPlanId: subscription.planId,
      toPlanId: newPlan.id,
      reason,
    },
  })

  return prisma.subscription.update({
    where: { userId },
    data: {
      planId: newPlan.id,
      status: 'active',
    },
  })
}

/**
 * Cancela assinatura ao fim do período
 */
export async function cancelSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    throw new Error('Subscription não encontrada')
  }

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      fromPlanId: subscription.planId,
      reason: 'cancellation',
    },
  })

  return prisma.subscription.update({
    where: { userId },
    data: {
      status: 'canceled',
    },
  })
}

/**
 * Reativa assinatura cancelada
 */
export async function reactivateSubscription(userId: string) {
  return prisma.subscription.update({
    where: { userId },
    data: {
      status: 'active',
    },
  })
}

export function isSubscriptionActive(
  subscription: { status: string } | null
): boolean {
  if (!subscription) return false
  return userHasActiveSubscription(subscription.status)
}

export function isSubscriptionTrialing(
  subscription: { status: string; trialEndsAt: Date | null } | null
): boolean {
  if (!subscription) return false
  if (subscription.status?.toLowerCase() !== 'trialing') return false
  if (!subscription.trialEndsAt) return false

  return new Date() < subscription.trialEndsAt
}

export function getTrialDaysRemaining(
  subscription: { trialEndsAt: Date | null } | null
): number | null {
  if (!subscription?.trialEndsAt) return null

  const now = new Date()
  const end = new Date(subscription.trialEndsAt)
  const diff = end.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  return days > 0 ? days : 0
}

export type { PlanLimits }
