"use client"

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Invoice {
  id: string
  cardName: string
  referenceMonth: string
  dueDate: Date
  totalAmount: number
  paidAmount: number
  status: "open" | "partial_paid" | "paid"
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/invoices")
        if (!response.ok) {
          throw new Error("Falha ao carregar faturas.")
        }

        const data = await response.json()
        const parsed = data.map((invoice: any) => ({
          ...invoice,
          dueDate: new Date(invoice.dueDate),
        }))
        setInvoices(parsed)
      } catch (err) {
        console.error("Erro ao carregar faturas:", err)
        setError("Não foi possível carregar as faturas.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadInvoices()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>
      case "partial_paid":
        return <Badge className="bg-yellow-100 text-yellow-800">Parcialmente Pago</Badge>
      case "open":
        return <Badge className="bg-red-100 text-red-800">Aberto</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturas</CardTitle>
        <CardDescription>Histórico de faturas dos seus cartões</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-6 text-center text-muted-foreground">Carregando faturas...</p>
        ) : error ? (
          <p className="py-6 text-center text-red-500">{error}</p>
        ) : invoices.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Nenhuma fatura disponível.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded border-b p-2 last:border-b-0 hover:bg-gray-50 lg:flex lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold">{invoice.cardName}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.referenceMonth} • Vence em {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="mt-2 text-right lg:mt-0">
                  <p className="font-bold">{formatCurrency(invoice.totalAmount)}</p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    {invoice.paidAmount > 0 && (
                      <span className="text-xs text-green-600">
                        Pago: {formatCurrency(invoice.paidAmount)}
                      </span>
                    )}
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
