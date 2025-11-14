"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface StatusBannerProps {
  status: string
  currentPeriodEnd: string | null
}

const STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
  past_due: {
    title: "Pagamento pendente",
    description: "Atualize seu método de pagamento para evitar interrupções.",
  },
  incomplete: {
    title: "Assinatura incompleta",
    description: "Conclua o processo de pagamento para liberar todos os recursos.",
  },
  incomplete_expired: {
    title: "Pagamento expirado",
    description: "O pagamento anterior expirou. Gere uma nova cobrança.",
  },
  unpaid: {
    title: "Assinatura em aberto",
    description: "Finalize o pagamento pendente para reativar o plano.",
  },
}

export function StatusBanner({ status, currentPeriodEnd }: StatusBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const info = STATUS_MESSAGES[status]

  if (!info) return null

  const handlePortal = async () => {
    try {
      setIsLoading(true)
      const response = await apiFetch("/api/billing/create-portal-session", {
        method: "POST",
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || "Erro ao abrir portal de cobrança")
      }
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Erro ao abrir portal:", error)
      toast({
        variant: "destructive",
        title: "Falha ao abrir portal",
        description: "Tente novamente ou fale com o suporte.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm",
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      )}
    >
      <div>
        <p className="font-semibold">{info.title}</p>
        <p>{info.description}</p>
        {currentPeriodEnd && (
          <p className="text-xs mt-1 opacity-80">
            Período atual termina em {new Date(currentPeriodEnd).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => void handlePortal()} disabled={isLoading}>
        {isLoading ? "Abrindo portal..." : "Gerenciar cobrança"}
      </Button>
    </div>
  )
}
