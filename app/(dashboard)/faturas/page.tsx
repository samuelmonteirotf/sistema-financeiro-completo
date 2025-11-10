"use client"

import { InvoiceList } from "@/components/invoices/invoice-list"

export default function FaturasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faturas</h1>
        <p className="text-muted-foreground">Visualize e gerencie suas faturas de cartão</p>
      </div>

      <InvoiceList />
    </div>
  )
}
