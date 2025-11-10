"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ExpenseData {
  category: string
  amount: number
  percentage: number
}

interface ExpenseChartProps {
  data: ExpenseData[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Distribuição das suas despesas este mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="amount" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
