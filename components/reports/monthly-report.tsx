"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

interface MonthlyReportProps {
  data: MonthlyData[]
}

export function MonthlyReport({ data }: MonthlyReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Mensal</CardTitle>
        <CardDescription>Comparação de renda, despesas e economia</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} />
            <Line type="monotone" dataKey="savings" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
