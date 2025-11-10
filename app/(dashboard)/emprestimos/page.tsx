"use client"

import { LoanList } from "@/components/loans/loan-list"

export default function EmprestimosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Empréstimos</h1>
        <p className="text-muted-foreground">Acompanhe seus empréstimos e financiamentos</p>
      </div>

      <LoanList />
    </div>
  )
}
