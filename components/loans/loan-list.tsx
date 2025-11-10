"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface Loan {
  id: string
  name: string
  lenderName: string
  originalAmount: number
  currentBalance: number
  monthlyPayment: number
  interestRate: number
  status: string
}

export function LoanList() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLoans = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/loans")
      if (!response.ok) {
        throw new Error("Falha ao buscar empréstimos.")
      }

      const data = await response.json()
      setLoans(data)
    } catch (err) {
      console.error("Erro ao carregar empréstimos:", err)
      setError("Não foi possível carregar os empréstimos.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLoans()
  }, [loadLoans])

  const renderProgress = (loan: Loan) => {
    if (loan.originalAmount <= 0) return 0
    const paid = loan.originalAmount - loan.currentBalance
    return Math.min(Math.max((paid / loan.originalAmount) * 100, 0), 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empréstimos</CardTitle>
        <CardDescription>Seus empréstimos e financiamentos</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground">Carregando empréstimos...</p>
        ) : error ? (
          <p className="py-8 text-center text-red-500">{error}</p>
        ) : loans.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum empréstimo ativo.</p>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const progress = renderProgress(loan)
              const statusLabel =
                loan.status === "active" ? "Ativo" : loan.status === "completed" ? "Concluído" : "Em atraso"
              const statusBadgeClass =
                loan.status === "active"
                  ? "bg-blue-100 text-blue-800"
                  : loan.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"

              return (
                <div key={loan.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{loan.name}</h3>
                      <p className="text-sm text-muted-foreground">{loan.lenderName}</p>
                    </div>
                    <Badge className={statusBadgeClass}>{statusLabel}</Badge>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Saldo Devedor</p>
                      <p className="font-semibold">{formatCurrency(loan.currentBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Parcela</p>
                      <p className="font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Taxa</p>
                      <p className="font-semibold">{loan.interestRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Progresso</p>
                      <p className="font-semibold">{progress.toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
