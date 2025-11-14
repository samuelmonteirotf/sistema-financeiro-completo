"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/useSubscription"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LimitBadge } from "@/components/billing/limit-badge"
import { StatusBanner } from "@/components/billing/status-banner"

const RESOURCES: Array<{
  key: "expenses" | "cards" | "categories" | "loans"
  label: string
  description: string
}> = [
  { key: "expenses", label: "Despesas por mês", description: "Registros criados a cada mês" },
  { key: "cards", label: "Cartões", description: "Cartões cadastrados" },
  { key: "categories", label: "Categorias", description: "Categorias personalizadas" },
  { key: "loans", label: "Empréstimos", description: "Contratos cadastrados" },
]

export default function BillingPage() {
  const subscription = useSubscription()
  const { toast } = useToast()
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const showStatusBanner = ["past_due", "incomplete", "incomplete_expired", "unpaid"].includes(
    subscription.status
  )

  const planLabel = useMemo(() => {
    if (subscription.status === "trialing") {
      return `${subscription.plan.name} (trial)`
    }
    return subscription.plan.name
  }, [subscription.plan.name, subscription.status])

  const handlePortal = async () => {
    try {
      setIsOpeningPortal(true)
      const response = await apiFetch("/api/billing/create-portal-session", {
        method: "POST",
      })

      if (!response.ok) {
        const body = await response.json()
        toast({
          variant: "destructive",
          title: "Falha ao abrir portal",
          description: body.error ?? "Tente novamente em instantes.",
        })
        return
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url as string
      }
    } catch (error) {
      console.error("Erro ao abrir portal Stripe:", error)
      toast({
        variant: "destructive",
        title: "Falha ao abrir portal",
        description: "Verifique sua conexão e tente novamente.",
      })
    } finally {
      setIsOpeningPortal(false)
    }
  }

  if (subscription.isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Carregando informações...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assinatura e Billing</h1>
        <p className="text-muted-foreground">Gerencie plano, limites e histórico de cobrança.</p>
      </div>

      {showStatusBanner && (
        <StatusBanner status={subscription.status} currentPeriodEnd={subscription.currentPeriodEnd} />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">{planLabel}</CardTitle>
            <CardDescription>Status: {subscription.status}</CardDescription>
            {subscription.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Renova em {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/pricing?highlight=premium" aria-label="Ver planos disponíveis">
                Ver planos
              </Link>
            </Button>
            <Button
              onClick={() => void handlePortal()}
              disabled={isOpeningPortal}
              aria-label="Gerenciar assinatura no portal de cobrança"
            >
              {isOpeningPortal ? "Abrindo portal..." : "Gerenciar assinatura"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recursos habilitados:{" "}
            {subscription.features.length > 0 ? subscription.features.join(", ") : "Plano básico"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uso por recurso</CardTitle>
          <CardDescription>Limites atuais do seu plano</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {RESOURCES.map((resource) => (
            <LimitBadge
              key={resource.key}
              label={resource.label}
              description={resource.description}
              used={subscription.usage[resource.key]}
              limit={subscription.limits[resource.key] ?? -1}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo financeiro</CardTitle>
          <CardDescription>Últimos lançamentos contam para seus limites mensais.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground text-xs">Despesas registradas</p>
            <p className="text-lg font-semibold">
              {subscription.usage.expenses} {subscription.usage.expenses === 1 ? "entrada" : "entradas"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground text-xs">Cartões cadastrados</p>
            <p className="text-lg font-semibold">{subscription.usage.cards}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground text-xs">Categorias</p>
            <p className="text-lg font-semibold">{subscription.usage.categories}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground text-xs">Plano atual</p>
            <Badge variant="secondary">{subscription.plan.name}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precisa de mais limites?</CardTitle>
          <CardDescription>Planos anuais têm desconto e liberam relatórios completos + exportações.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href="/pricing?highlight=premium">Comparar planos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="mailto:suporte@financeiro.com">Falar com suporte</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
