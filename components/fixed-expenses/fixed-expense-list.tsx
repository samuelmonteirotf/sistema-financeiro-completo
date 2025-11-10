"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FixedExpenseForm } from "./fixed-expense-form"

interface FixedExpense {
  id: string
  description: string
  amount: number
  category: string
  dueDay: number
  frequency: "monthly" | "quarterly" | "yearly"
  isActive: boolean
}

const FREQUENCY_LABEL: Record<FixedExpense["frequency"], string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
}

export function FixedExpenseList() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/fixed-expenses")
      if (!response.ok) {
        throw new Error("Falha ao buscar despesas fixas.")
      }

      const data = await response.json()
      setExpenses(data)
    } catch (err) {
      console.error("Erro ao carregar despesas fixas:", err)
      setError("Não foi possível carregar as despesas fixas.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadExpenses()
  }, [loadExpenses])

  const handleAddExpense = async (data: Omit<FixedExpense, "id" | "isActive">) => {
    try {
      const response = await fetch("/api/fixed-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar despesa fixa.")
      }

      await loadExpenses()
      setIsFormOpen(false)
    } catch (error) {
      console.error("Erro ao salvar despesa fixa:", error)
      alert("Não foi possível salvar a despesa fixa.")
    }
  }

  const handleDeleteExpense = async (id: string) => {
    const confirmed = window.confirm("Deseja remover esta despesa fixa?")
    if (!confirmed) return

    try {
      const response = await fetch(`/api/fixed-expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao remover despesa fixa.")
      }

      await loadExpenses()
    } catch (error) {
      console.error("Erro ao remover despesa fixa:", error)
      alert("Não foi possível remover a despesa fixa.")
    }
  }

  const totalMonthly = useMemo(() => {
    return expenses
      .filter((expense) => expense.isActive)
      .reduce((sum, expense) => {
        switch (expense.frequency) {
          case "monthly":
            return sum + expense.amount
          case "quarterly":
            return sum + expense.amount / 3
          case "yearly":
            return sum + expense.amount / 12
          default:
            return sum
        }
      }, 0)
  }, [expenses])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Despesas Fixas</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus compromissos recorrentes e antecipe os vencimentos.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Adicionar Despesa Fixa</Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Carregando despesas fixas...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Despesas Recorrentes</CardTitle>
            <CardDescription>Total mensal estimado: {formatCurrency(totalMonthly)}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma despesa fixa registrada até o momento.
                </p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{expense.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{expense.category}</Badge>
                        <span>Vence dia {expense.dueDay}</span>
                        <span>{FREQUENCY_LABEL[expense.frequency]}</span>
                        {!expense.isActive && <Badge variant="secondary">Inativa</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(expense.amount)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <FixedExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleAddExpense} />
    </div>
  )
}
