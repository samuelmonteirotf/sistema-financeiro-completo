"use client"

import { FixedExpenseList } from "@/components/fixed-expenses/fixed-expense-list"

export default function DespesasFixasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Despesas Fixas</h1>
        <p className="text-muted-foreground">Gerencie suas despesas recorrentes</p>
      </div>

      <FixedExpenseList />
    </div>
  )
}
