"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type Resource = "expenses" | "cards" | "categories" | "loans"

interface SubscriptionStatusResponse {
  plan: { slug: string; name: string }
  status: string
  limits: Record<string, number>
  usage: Record<Resource, number>
  features: string[]
  currentPeriodEnd: string | null
}

const DEFAULT_RESPONSE: SubscriptionStatusResponse = {
  plan: { slug: "free", name: "Free" },
  status: "inactive",
  limits: {},
  usage: {
    expenses: 0,
    cards: 0,
    categories: 0,
    loans: 0,
  },
  features: [],
  currentPeriodEnd: null,
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionStatusResponse>(DEFAULT_RESPONSE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/billing/status", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Falha ao carregar status de assinatura")
      }
      const body = (await response.json()) as SubscriptionStatusResponse
      setData(body)
    } catch (err) {
      console.error("[useSubscription] erro ao carregar status:", err)
      setError("Não foi possível carregar o status da assinatura.")
      setData(DEFAULT_RESPONSE)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

  const limits = useMemo(() => data.limits || {}, [data.limits])
  const usage = useMemo(() => data.usage || DEFAULT_RESPONSE.usage, [data.usage])
  const features = useMemo(() => data.features || [], [data.features])

  const canCreate = useCallback(
    (resource: Resource) => {
      const limit = Number(limits[resource] ?? -1)
      if (limit === -1) return true
      const value = usage[resource] ?? 0
      return value < limit
    },
    [limits, usage]
  )

  const can = useCallback(
    (feature: string) => {
      if (!feature) return true
      return features.includes(feature)
    },
    [features]
  )

  return {
    plan: data.plan,
    status: data.status,
    limits,
    usage,
    features,
    currentPeriodEnd: data.currentPeriodEnd,
    isLoading,
    error,
    refresh: fetchStatus,
    canCreate,
    can,
  }
}
