'use client'

import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

type ApiFetchInit = RequestInit & {
  json?: unknown
}

function buildUpgradeUrl(payload: any) {
  if (typeof payload?.upgradeUrl === 'string') {
    return payload.upgradeUrl
  }

  const plan = typeof payload?.requiredPlan === 'string' ? payload.requiredPlan : 'pro'
  return `/pricing?highlight=${plan}`
}

function showLimitToast(payload: any) {
  const upgradeUrl = buildUpgradeUrl(payload)
  const title =
    payload?.message ||
    (payload?.error === 'feature_locked'
      ? 'Recurso disponível em planos superiores'
      : 'Limite do plano atingido')

  toast({
    title,
    description:
      payload?.resource === 'export'
        ? 'Acesse planos pagos para liberar exportação e relatórios.'
        : `Recurso: ${payload?.resource ?? 'plano'}`,
    action: (
      <ToastAction
        altText="Ver planos"
        onClick={() => {
          window.location.href = upgradeUrl
        }}
      >
        Ver planos
      </ToastAction>
    ),
  })
}

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchInit = {}) {
  const headers = new Headers(init.headers)

  let body = init.body
  if (init.json !== undefined) {
    body = JSON.stringify(init.json)
    headers.set('Content-Type', 'application/json')
  } else if (body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(input, {
    ...init,
    headers,
    body,
  })

  if (response.status === 402) {
    try {
      const payload = await response.clone().json()
      showLimitToast(payload)
    } catch {
      showLimitToast({})
    }
  }

  return response
}
