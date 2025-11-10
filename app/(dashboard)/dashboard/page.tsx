"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards, type SummaryData } from "@/components/dashboard/summary-cards"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { RecentExpenses, type RecentExpense } from "@/components/dashboard/recent-expenses"
import { BudgetOverview } from "@/components/dashboard/budget-overview"

export default function DashboardPage() {
  const [userName, setUserName] = useState("Usuário")
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    totalDebt: 0,
    availableCredit: 0,
  })

  const [expenseData, setExpenseData] = useState<any[]>([])
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [budgetData, setBudgetData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.name) {
      setUserName(user.name)
    }

    void loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()

      const [summaryRes, categoryRes, recentRes, budgetRes] = await Promise.all([
        fetch("/api/dashboard/summary"),
        fetch("/api/dashboard/expenses-by-category"),
        fetch("/api/dashboard/recent-expenses"),
        fetch(`/api/budgets?month=${month}&year=${year}`),
      ])

      if (summaryRes.ok) {
        const summary = await summaryRes.json()
        setSummaryData(summary)
      }

      if (categoryRes.ok) {
        const categories = await categoryRes.json()
        setExpenseData(categories)
      }

      if (recentRes.ok) {
        const recent = await recentRes.json()
        const parsedRecent = recent.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }))
        setRecentExpenses(parsedRecent)
      }

      // Usar dados de budget REAL da API
      if (budgetRes.ok) {
        const budgets = await budgetRes.json()
        setBudgetData(budgets)
      } else {
        setBudgetData([])
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader userName={userName} />
      <SummaryCards data={summaryData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {expenseData.length > 0 ? (
            <ExpenseChart data={expenseData} />
          ) : (
            <div className="bg-white rounded-lg border p-6">
              <p className="text-muted-foreground text-center">
                Nenhuma despesa encontrada para este mês
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          {recentExpenses.length > 0 ? (
            <RecentExpenses expenses={recentExpenses} />
          ) : (
            <div className="bg-white rounded-lg border p-6">
              <p className="text-muted-foreground text-center">
                Nenhuma despesa recente
              </p>
            </div>
          )}
        </div>
      </div>

      {budgetData.length > 0 && (
        <BudgetOverview budgets={budgetData} />
      )}
    </div>
  )
}
