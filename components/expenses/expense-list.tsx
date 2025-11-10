"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExpenseForm } from "./expense-form"
import { formatCurrency } from "@/lib/utils"
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Expense {
  id: string
  description: string
  amount: number
  category: {
    id: string
    name: string
  }
  date: string
  installments: number
  creditCard?: {
    id: string
    name: string
  }
}

export function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentMonthValue = format(new Date(), "yyyy-MM")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue)

  const monthOptions = useMemo(() => {
    const options = []
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i)
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: ptBR }),
      })
    }
    return options
  }, [])

  const loadData = useCallback(
    async (monthValue: string) => {
      try {
        setIsLoading(true)
        setError(null)

        let query = ""
        if (monthValue !== "all") {
          const baseDate = new Date(`${monthValue}-01T00:00:00`)
          const params = new URLSearchParams({
            startDate: startOfMonth(baseDate).toISOString(),
            endDate: endOfMonth(baseDate).toISOString(),
          })
          query = `?${params.toString()}`
        }

        const expensesRes = await fetch(`/api/expenses${query}`)
        if (expensesRes.ok) {
          const data = await expensesRes.json()
          setExpenses(data)
        }

        const cardsRes = await fetch("/api/cards")
        if (cardsRes.ok) {
          const cards = await cardsRes.json()
          setCreditCards(cards)
        }

        const categoriesRes = await fetch("/api/categories")
        if (categoriesRes.ok) {
          const cats = await categoriesRes.json()
          setCategories(cats)
        }
      } catch (error) {
        console.error("Erro ao carregar despesas:", error)
        setError("Não foi possível carregar as despesas.")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    void loadData(selectedMonth)
  }, [selectedMonth, loadData])

  const handleAddExpense = async (data: any) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // Recarregar lista
        await loadData(selectedMonth)
        setIsFormOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao criar despesa")
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error)
      alert("Erro ao adicionar despesa")
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const selectedMonthDate = useMemo(
    () => (selectedMonth === "all" ? new Date() : startOfMonth(new Date(`${selectedMonth}-01T00:00:00`))),
    [selectedMonth]
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Carregando despesas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Suas Despesas</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsFormOpen(true)}>Adicionar Despesa</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>
            Total: {formatCurrency(totalExpenses)} • {expenses.length} despesa(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-red-500">
              {error}
            </p>
          )}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma despesa registrada. Clique em "Adicionar Despesa" para começar.
              </p>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{expense.category.name}</Badge>
                      {expense.creditCard && (
                        <Badge variant="outline">{expense.creditCard.name}</Badge>
                      )}
                      {expense.installments > 1 && (
                        <Badge>{expense.installments}x</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(expense.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ExpenseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddExpense}
        creditCards={creditCards.map(c => ({ id: c.id, name: c.name }))}
        categories={categories.map(c => ({ id: c.id, name: c.name }))}
        defaultDate={selectedMonthDate}
      />
    </div>
  )
}
