"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Invoice {
  id: string
  cardId: string
  cardName: string
  referenceMonth: string
  referenceValue: string
  dueDate: Date
  totalAmount: number
  paidAmount: number
  status: "open" | "partial_paid" | "paid"
  isMarkedPaid: boolean
  items: Array<{
    id: string
    type: "expense" | "installment"
    description: string
    amount: number
    date: Date
  }>
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedCard, setSelectedCard] = useState<string>("all")

  const loadInvoices = useCallback(async () => {
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
        items: (invoice.items ?? []).map((item: any) => ({
          ...item,
          date: new Date(item.date),
        })),
      }))
      setInvoices(parsed)
    } catch (err) {
      console.error("Erro ao carregar faturas:", err)
      setError("Não foi possível carregar as faturas.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  const monthOptions = useMemo(() => {
    const unique = new Map<string, string>()
    invoices.forEach((invoice) => {
      if (!unique.has(invoice.referenceValue)) {
        unique.set(invoice.referenceValue, invoice.referenceMonth)
      }
    })
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }))
  }, [invoices])

  const cardOptions = useMemo(() => {
    const unique = new Map<string, string>()
    invoices.forEach((invoice) => {
      if (!unique.has(invoice.cardId)) {
        unique.set(invoice.cardId, invoice.cardName)
      }
    })
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }))
  }, [invoices])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const monthMatch = selectedMonth === "all" || invoice.referenceValue === selectedMonth
      const cardMatch = selectedCard === "all" || invoice.cardId === selectedCard
      return monthMatch && cardMatch
    })
  }, [invoices, selectedMonth, selectedCard])

  const groupedInvoices = useMemo(() => {
    const map = new Map<
      string,
      {
        label: string
        invoices: Invoice[]
      }
    >()

    filteredInvoices.forEach((invoice) => {
      if (!map.has(invoice.referenceValue)) {
        map.set(invoice.referenceValue, { label: invoice.referenceMonth, invoices: [] })
      }
      map.get(invoice.referenceValue)!.invoices.push(invoice)
    })

    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? -1 : 1))
      .map(([_, value]) => value)
  }, [filteredInvoices])

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

  const handleTogglePaid = async (invoice: Invoice) => {
    try {
      setUpdatingId(invoice.id)
      const response = await fetch("/api/invoices/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: invoice.cardId,
          referenceMonth: invoice.referenceValue,
          paid: !invoice.isMarkedPaid,
        }),
      })

      if (!response.ok) {
        throw new Error("Não foi possível atualizar o status da fatura.")
      }

      await loadInvoices()
    } catch (err) {
      console.error(err)
      setError("Falha ao atualizar o status da fatura.")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Faturas</CardTitle>
          <CardDescription>Histórico de faturas dos seus cartões</CardDescription>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrar por cartão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cartões</SelectItem>
              {cardOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-6 text-center text-muted-foreground">Carregando faturas...</p>
        ) : error ? (
          <p className="py-6 text-center text-red-500">{error}</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Nenhuma fatura disponível.</p>
        ) : (
          <div className="space-y-10">
            {groupedInvoices.map((group) => (
              <div
                key={group.label}
                className="rounded-2xl border border-border/60 bg-card/80 shadow-xl shadow-black/10"
              >
                <div className="border-b border-border/40 px-4 py-3 text-sm uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </div>
                <div className="divide-y divide-border/40">
                  {group.invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                          <p className="text-xl font-semibold text-foreground">{invoice.cardName}</p>
                          <p className="text-sm text-muted-foreground">Vencimento em {formatDate(invoice.dueDate)}</p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {getStatusBadge(invoice.status)}
                            {invoice.isMarkedPaid && <Badge variant="default">Marcado como pago</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-xs uppercase text-muted-foreground">Total do mês</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</p>
                            {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                              <p className="text-xs text-green-400">Pago: {formatCurrency(invoice.paidAmount)}</p>
                            )}
                          </div>
                          <Button
                            variant={invoice.isMarkedPaid ? "default" : "outline"}
                            size="sm"
                            className={
                              invoice.isMarkedPaid
                                ? "bg-green-600 hover:bg-green-500 text-white shadow shadow-green-900/30"
                                : "border-primary text-primary hover:bg-primary/10"
                            }
                            disabled={updatingId === invoice.id}
                            onClick={() => void handleTogglePaid(invoice)}
                          >
                            {invoice.isMarkedPaid ? "Marcar como em aberto" : "Marcar como pago"}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-border/40 bg-background/30 p-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Despesas do período</span>
                          <span>{invoice.items.length} itens</span>
                        </div>
                        {invoice.items.length === 0 ? (
                          <p className="mt-3 text-xs text-muted-foreground">Sem lançamentos neste período.</p>
                        ) : (
                          <div className="mt-3 grid gap-2">
                            {invoice.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-md border border-border/40 bg-card/60 px-3 py-2 text-sm"
                              >
                                <div>
                                  <p className="font-medium text-foreground">{item.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(item.date)} •{" "}
                                    {item.type === "installment" ? "Parcela de compra" : "Compra à vista"}
                                  </p>
                                </div>
                                <span className="font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
