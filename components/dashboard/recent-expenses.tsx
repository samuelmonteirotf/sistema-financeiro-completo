"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export interface RecentExpense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
  status: "pending" | "paid"
}

interface RecentExpensesProps {
  expenses: RecentExpense[]
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas Recentes</CardTitle>
        <CardDescription>Últimas transações registradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa registrada</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category} • {formatDate(expense.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                  <Badge variant={expense.status === "paid" ? "default" : "outline"}>
                    {expense.status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
