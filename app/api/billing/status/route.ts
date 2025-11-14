import { NextResponse } from 'next/server'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { getPlanForUser, getUsage } from '@/lib/limits'

export async function GET() {
  const maybeUser = await getUserIdOrUnauthorized()
  if (maybeUser instanceof NextResponse) {
    return maybeUser
  }

  const userId = maybeUser
  const planInfo = await getPlanForUser(userId)
  const usage = await getUsage(userId)

  const limits = {
    expenses: Number(planInfo.limits.maxExpensesPerMonth ?? -1),
    cards: Number(planInfo.limits.maxCards ?? -1),
    categories: Number(planInfo.limits.maxCategories ?? -1),
    loans: Number(planInfo.limits.maxLoans ?? -1),
  }

  return NextResponse.json({
    plan: {
      slug: planInfo.slug,
      name: planInfo.name,
    },
    status: planInfo.status,
    limits,
    usage,
    features: planInfo.features,
    currentPeriodEnd: planInfo.currentPeriodEnd,
  })
}
