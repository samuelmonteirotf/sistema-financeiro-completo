"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"

interface BudgetData {
  category: string
  allocated: number
  spent: number
  remaining: number
}

interface BudgetOverviewProps {
  budgets: BudgetData[]
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento Mensal</CardTitle>
        <CardDescription>Acompanhamento do seu orçamento por categoria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100
          return (
            <div key={budget.category}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{budget.category}</p>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                </span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
              {percentage > 100 && (
                <p className="text-xs text-red-600 mt-1">
                  Excedido em {formatCurrency(budget.spent - budget.allocated)}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
