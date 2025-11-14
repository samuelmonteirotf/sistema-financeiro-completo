import { NextResponse } from 'next/server'

export type PaymentRequiredPayload = {
  resource: string
  used: number
  limit: number
  requiredPlan: string
  message?: string
  upgradeUrl?: string
}

const DEFAULT_UPGRADE_URL = '/pricing'

export function paymentRequired(payload: PaymentRequiredPayload): NextResponse {
  const upgradeUrl =
    payload.upgradeUrl ||
    `${DEFAULT_UPGRADE_URL}?highlight=${payload.requiredPlan}`

  return NextResponse.json(
    {
      error: 'limit_exceeded',
      message: payload.message ?? 'Limite do seu plano foi atingido.',
      upgradeUrl,
      ...payload,
    },
    { status: 402 }
  )
}

export function forbiddenFeature(payload: PaymentRequiredPayload): NextResponse {
  const upgradeUrl =
    payload.upgradeUrl ||
    `${DEFAULT_UPGRADE_URL}?highlight=${payload.requiredPlan}`

  return NextResponse.json(
    {
      error: 'feature_locked',
      message: payload.message ?? 'Recurso disponível em planos superiores.',
      upgradeUrl,
      ...payload,
    },
    { status: 402 }
  )
}
