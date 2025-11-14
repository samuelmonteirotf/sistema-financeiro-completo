"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/useSubscription"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { cn, formatCurrency as formatBRL } from "@/lib/utils"

type BillingCycle = "month" | "year"
type PlanCard = {
  slug: "free" | "pro" | "premium"
  name: string
  price: number
  description: string
  highlight?: boolean
  cta?: string
  limits: Record<"expenses" | "cards" | "categories" | "loans", number>
  features: string[]
}

const PLAN_CARDS: PlanCard[] = [
  {
    slug: "free",
    name: "Free",
    price: 0,
    description: "Organize suas finanças pessoais e teste os recursos básicos.",
    limits: { expenses: 50, cards: 2, categories: 10, loans: 0 },
    features: ["Controle manual", "Dashboard básico", "Categorias ilimitadas"],
  },
  {
    slug: "pro",
    name: "Pro",
    price: 4900,
    description: "Plano ideal para quem precisa exportar, usar Pix e ganhar velocidade.",
    highlight: true,
    limits: { expenses: 500, cards: 5, categories: -1, loans: 2 },
    features: ["Pix ilimitado", "Exportar CSV e JSON", "Dashboards avançados"],
  },
  {
    slug: "premium",
    name: "Premium",
    price: 12900,
    description: "Times colaborativos, relatórios ricos e suporte dedicado.",
    limits: { expenses: 2000, cards: 20, categories: -1, loans: 5 },
    features: ["Relatórios avançados", "Equipe multiusuário", "Suporte dedicado"],
  },
]

const BILLING_OPTIONS: Array<{ id: BillingCycle; label: string; helper?: string }> = [
  { id: "month", label: "Mensal" },
  { id: "year", label: "Anual", helper: "10% OFF" },
]

function formatPrice(cents: number, cycle: BillingCycle) {
  if (cycle === "year") {
    const yearly = Math.round(cents * 12 * 0.9)
    return yearly === 0 ? "Grátis" : formatBRL(yearly / 100) + "/ano"
  }

  return cents === 0 ? "Grátis" : formatBRL(cents / 100) + "/mês"
}

function getPlanLimits(plan: PlanCard, userPlanSlug?: string, userLimits?: Record<string, number>) {
  if (plan.slug === userPlanSlug && userLimits) {
    return {
      expenses: userLimits.expenses ?? plan.limits.expenses,
      cards: userLimits.cards ?? plan.limits.cards,
      categories: userLimits.categories ?? plan.limits.categories,
      loans: userLimits.loans ?? plan.limits.loans,
    }
  }

  return plan.limits
}

export default function PricingPage() {
  const subscription = useSubscription()
  const { toast } = useToast()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("month")
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)

  const planCards = useMemo(() => PLAN_CARDS, [])

  const handleCheckout = async (planSlug: "pro" | "premium") => {
    try {
      setPendingPlan(planSlug)
      const response = await apiFetch("/api/billing/create-checkout", {
        method: "POST",
        json: { planSlug, billingCycle },
      })

      if (response.status === 401) {
        window.location.href = `/login?callbackUrl=/pricing`
        return
      }

      if (!response.ok) {
        const errorBody = await response.json()
        toast({
          variant: "destructive",
          title: "Falha ao iniciar checkout",
          description: errorBody.error ?? "Tente novamente.",
        })
        return
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url as string
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error)
      toast({
        variant: "destructive",
        title: "Falha ao iniciar checkout",
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="text-center space-y-4">
        <p className="text-sm text-primary font-semibold uppercase tracking-widest">Planos para todos os perfis</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Escolha o plano ideal para suas finanças</h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
          Comece grátis, desbloqueie relatórios e exportações com o plano Pro ou habilite colaboração com o Premium.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {BILLING_OPTIONS.map((option) => (
          <Button
            key={option.id}
            variant={billingCycle === option.id ? "default" : "outline"}
            onClick={() => setBillingCycle(option.id)}
            className="w-32"
          >
            {option.label}
            {option.helper && billingCycle === option.id && (
              <span className="ml-2 text-xs font-semibold text-primary-foreground">{option.helper}</span>
            )}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {planCards.map((plan) => {
          const userPlanSlug = subscription.plan.slug
          const isCurrentPlan = plan.slug === userPlanSlug
          const displayLimits = getPlanLimits(plan, userPlanSlug, subscription.limits)
          const displayFeatures =
            plan.slug === userPlanSlug && subscription.features.length > 0
              ? subscription.features
              : plan.features

          return (
            <Card
              key={plan.slug}
              className={cn(
                "flex flex-col justify-between border relative",
                plan.highlight && "border-primary shadow-xl"
              )}
            >
              {plan.highlight && (
                <Badge variant="outline" className="absolute right-4 top-4 text-primary border-primary">
                  Recomendado
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">{formatPrice(plan.price, billingCycle)}</span>
                  {plan.price > 0 && billingCycle === "year" && (
                    <p className="text-xs text-muted-foreground">Cobrado anualmente com 10% de desconto</p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase">Limites por recurso</p>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(displayLimits).map(([resource, value]) => (
                      <li key={resource} className="flex items-center justify-between">
                        <span className="capitalize">{resource}</span>
                        <span className="font-medium">{value === -1 ? "Ilimitado" : value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase">Benefícios</p>
                  <ul className="space-y-1 text-sm">
                    {displayFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.slug === "free" ? (
                  <Button
                    asChild
                    disabled={isCurrentPlan}
                    data-plan={plan.slug}
                    aria-label={isCurrentPlan ? "Plano atual Free" : "Criar conta grátis"}
                  >
                    <Link href="/register">{isCurrentPlan ? "Plano atual" : "Começar grátis"}</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    data-plan={plan.slug}
                    onClick={() => {
                      const paidPlan = plan.slug === "pro" ? "pro" : "premium"
                      void handleCheckout(paidPlan)
                    }}
                    aria-label={
                      isCurrentPlan
                        ? `Plano ${plan.name} atual`
                        : `Iniciar checkout do plano ${plan.name}`
                    }
                    disabled={isCurrentPlan || pendingPlan === plan.slug}
                  >
                    {isCurrentPlan ? "Plano atual" : pendingPlan === plan.slug ? "Redirecionando..." : "Quero este plano"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Cartão, Pix e boleto habilitados. Em caso de dúvidas, fale com nosso suporte:{" "}
        <a href="mailto:suporte@financeiro.com" className="text-primary underline">
          suporte@financeiro.com
        </a>
      </div>
    </div>
  )
}
