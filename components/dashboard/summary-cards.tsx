"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export interface SummaryData {
  totalIncome: number
  totalExpenses: number
  totalDebt: number
  availableCredit: number
}

interface SummaryCardsProps {
  data: SummaryData
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const summary = [
    {
      title: "Renda Total",
      value: data.totalIncome,
      description: "Este mês",
      color: "bg-green-50 text-green-700",
      icon: "📈",
    },
    {
      title: "Despesas Totais",
      value: data.totalExpenses,
      description: "Este mês",
      color: "bg-red-50 text-red-700",
      icon: "📊",
    },
    {
      title: "Dívidas Totais",
      value: data.totalDebt,
      description: "Cartões + Empréstimos",
      color: "bg-orange-50 text-orange-700",
      icon: "💳",
    },
    {
      title: "Crédito Disponível",
      value: data.availableCredit,
      description: "Todos os cartões",
      color: "bg-blue-50 text-blue-700",
      icon: "✅",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summary.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <span className="text-2xl">{item.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(item.value)}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
