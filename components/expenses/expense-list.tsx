"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExpenseForm } from "./expense-form"
import { formatCurrency } from "@/lib/utils"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSubscription } from "@/hooks/useSubscription"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

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
  const { toast } = useToast()
  const subscription = useSubscription()
  const canAddExpense = subscription.canCreate("expenses")
  const expenseLimit = subscription.limits.expenses ?? -1
  const [monthOptions, setMonthOptions] = useState<Array<{ value: string; label: string }>>([])
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [didSetInitialMonth, setDidSetInitialMonth] = useState(false)

  const fetchAvailableMonths = useCallback(async () => {
    try {
      const response = await fetch("/api/expenses/months")
      if (!response.ok) return
      const data: Array<{ value: string; label: string }> = await response.json()
      setMonthOptions(data)
    } catch (error) {
      console.error("Erro ao carregar meses disponíveis:", error)
    }
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
    void fetchAvailableMonths()
  }, [fetchAvailableMonths])

  useEffect(() => {
    if (monthOptions.length === 0) {
      if (selectedMonth !== "all") {
        setSelectedMonth("all")
      }
      return
    }

    if (!didSetInitialMonth) {
      setSelectedMonth(monthOptions[0].value)
      setDidSetInitialMonth(true)
      return
    }

    if (selectedMonth !== "all" && !monthOptions.some((option) => option.value === selectedMonth)) {
      setSelectedMonth(monthOptions[0].value)
    }
  }, [monthOptions, selectedMonth, didSetInitialMonth])

  useEffect(() => {
    void loadData(selectedMonth)
  }, [selectedMonth, loadData])

  const handleAddExpense = async (data: any) => {
    try {
      const response = await apiFetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchAvailableMonths()
        await loadData(selectedMonth)
        setIsFormOpen(false)
      } else if (response.status !== 402) {
        const errorBody = await response.json()
        toast({
          title: "Erro ao criar despesa",
          description: errorBody.error || "Tente novamente em instantes.",
        })
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error)
      toast({
        title: "Erro ao criar despesa",
        description: "Tente novamente em instantes.",
      })
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

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    if (value !== "all") {
      setDidSetInitialMonth(true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Suas Despesas</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => canAddExpense && setIsFormOpen(true)} disabled={!canAddExpense}>
                  Adicionar Despesa
                </Button>
              </TooltipTrigger>
              {!canAddExpense && (
                <TooltipContent align="end">
                  Limite do plano atingido. Faça upgrade para continuar registrando.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Lista de Despesas</CardTitle>
            <CardDescription>
            Total: {formatCurrency(totalExpenses)} • {expenses.length} despesa(s)
            </CardDescription>
            {expenseLimit > -1 && (
              <Badge variant={subscription.usage.expenses / expenseLimit > 0.8 ? "destructive" : "secondary"}>
                {subscription.usage.expenses}/{expenseLimit} despesas neste plano
              </Badge>
            )}
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
