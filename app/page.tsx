"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push("/login")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-surface p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-primary">Gestor Financeiro</h1>
        <p className="text-xl text-text-secondary">
          Controle seus gastos, planeje seu orçamento e alcance seus objetivos financeiros
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-12">
          <div className="p-6 bg-white rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2">💳 Cartões</h3>
            <p className="text-text-secondary text-sm">Gerencie múltiplos cartões de crédito</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2">📊 Despesas</h3>
            <p className="text-text-secondary text-sm">Rastreie todas as suas despesas</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2">📈 Relatórios</h3>
            <p className="text-text-secondary text-sm">Visualize análises detalhadas</p>
          </div>
        </div>

        <Button onClick={handleGetStarted} disabled={isLoading} className="w-full md:w-auto px-8 py-3 text-lg">
          {isLoading ? "Carregando..." : "Começar Agora"}
        </Button>
      </div>
    </main>
  )
}
