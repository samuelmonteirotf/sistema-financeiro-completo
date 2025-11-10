"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBreakdown } from "@/components/reports/category-breakdown"
import { ExportButton } from "@/components/reports/export-button"
import { MonthlyReport } from "@/components/reports/monthly-report"
import { formatCurrency } from "@/lib/utils"

interface MonthlyRow {
  month: string
  income: number
  expenses: number
  savings: number
}

interface CategoryRow {
  name: string
  value: number
  [key: string]: string | number
}

interface ReportSummary {
  totalIncome: number
  totalExpenses: number
  averageMonthlySavings: number
  averageExpense: number
  highestExpenseMonth: string
  lowestExpenseMonth: string
}

export default function RelatoriosPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyRow[]>([])
  const [categoryData, setCategoryData] = useState<CategoryRow[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/reports/summary")
        if (!response.ok) {
          throw new Error("Falha ao gerar relatórios.")
        }

        const data = await response.json()
        setMonthlyData(data.monthly)
        setCategoryData(data.categories)
        setSummary(data.summary)
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err)
        setError("Não foi possível carregar os relatórios.")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchReport()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças reais</p>
        </div>
        <ExportButton data={monthlyData} fileName="relatorio-financeiro" disabled={monthlyData.length === 0} />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Gerando relatórios...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-red-500">{error}</CardContent>
        </Card>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Renda Total</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                <CardDescription>Inclui despesas fixas e variáveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Economia Média</CardTitle>
                <CardDescription>Renda - Despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.averageMonthlySavings)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gastos Médios</CardTitle>
                <CardDescription>Por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.averageExpense)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resumo de Picos</CardTitle>
              <CardDescription>Meses com maior e menor nível de despesas</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Maior gasto</p>
                <p className="text-lg font-semibold">{summary.highestExpenseMonth}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Menor gasto</p>
                <p className="text-lg font-semibold">{summary.lowestExpenseMonth}</p>
              </div>
            </CardContent>
          </Card>

          <MonthlyReport data={monthlyData} />

          <CategoryBreakdown data={categoryData} />
        </>
      ) : null}
    </div>
  )
}
