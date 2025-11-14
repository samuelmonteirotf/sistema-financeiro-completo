"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { LoanFormDialog, type LoanFormValues } from "@/components/loans/loan-form-dialog"
import { apiFetch } from "@/lib/api"

interface Loan {
  id: string
  name: string
  lenderName: string
  originalAmount: number
  currentBalance: number
  monthlyPayment: number
  interestRate: number
  status: string
  loanType: "loan" | "financing"
  startDate: string
  endDate: string
}

export function LoanList() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)

  const loadLoans = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/loans")
      if (!response.ok) {
        throw new Error("Falha ao buscar empréstimos.")
      }

      const data = await response.json()
      const parsed = data.map((loan: Loan) => ({
        ...loan,
        loanType: loan.loanType ?? "loan",
      }))
      setLoans(parsed)
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

  const handleSaveLoan = async (values: LoanFormValues) => {
    const payload = {
      ...values,
      originalAmount: Number(values.originalAmount),
      currentBalance: Number(values.currentBalance),
      monthlyPayment: Number(values.monthlyPayment),
      interestRate: Number(values.interestRate),
    }

    const endpoint = values.id ? `/api/loans/${values.id}` : "/api/loans"
    const method = values.id ? "PUT" : "POST"

    const response = await apiFetch(endpoint, {
      method,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Falha ao salvar empréstimo.")
    }

    await loadLoans()
  }

  const handleDeleteLoan = async (loan: Loan) => {
    if (!window.confirm(`Deseja excluir o ${loan.loanType === "financing" ? "financiamento" : "empréstimo"} "${loan.name}"?`)) {
      return
    }

    const response = await apiFetch(`/api/loans/${loan.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Falha ao remover empréstimo.")
    }

    await loadLoans()
  }

  const prepareFormValues = (loan?: Loan | null): LoanFormValues | null => {
    if (!loan) return null
    const normalizeDate = (value?: string) => {
      if (!value) return new Date().toISOString().slice(0, 10)
      return value.slice(0, 10)
    }
    return {
      id: loan.id,
      name: loan.name,
      lenderName: loan.lenderName,
      originalAmount: loan.originalAmount,
      currentBalance: loan.currentBalance,
      monthlyPayment: loan.monthlyPayment,
      interestRate: loan.interestRate,
      startDate: normalizeDate(loan.startDate),
      endDate: normalizeDate(loan.endDate),
      status: loan.status,
      loanType: loan.loanType ?? "loan",
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Empréstimos e Financiamentos</CardTitle>
          <CardDescription>Cadastre seus contratos e acompanhe a evolução</CardDescription>
        </div>
        <Button
          onClick={() => {
            setEditingLoan(null)
            setIsDialogOpen(true)
          }}
        >
          Novo contrato
        </Button>
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
                  <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-semibold">{loan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {loan.loanType === "financing" ? "Financiamento" : "Empréstimo"} • {loan.lenderName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusBadgeClass}>{statusLabel}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingLoan(loan)
                          setIsDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void handleDeleteLoan(loan)}>
                        Remover
                      </Button>
                    </div>
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

      <LoanFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingLoan(null)
          }
        }}
        onSubmit={async (values) => {
          await handleSaveLoan(values)
          setEditingLoan(null)
        }}
        initialData={prepareFormValues(editingLoan)}
      />
    </Card>
  )
}
