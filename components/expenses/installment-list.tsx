"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InstallmentSummary {
  id: string
  description: string
  category: string
  cardName: string | null
  totalAmount: number
  totalInstallments: number
  paidCount: number
  remainingCount: number
  nextInstallmentNumber: number
  nextDueDate: string | null
  installmentValue: number
  isPaidInPeriod: boolean
  isCompleted: boolean
}

export function InstallmentList() {
  const [installments, setInstallments] = useState<InstallmentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthOptions, setMonthOptions] = useState<Array<{ value: string; label: string }>>([])
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [didSetInitialMonth, setDidSetInitialMonth] = useState(false)

  const loadInstallments = useCallback(async (monthValue: string) => {
    try {
      setIsLoading(true)
      setError(null)

      let url = "/api/installments"
      if (monthValue !== "all") {
        const baseDate = new Date(`${monthValue}-01T00:00:00`)
        const params = new URLSearchParams({
          startDate: startOfMonth(baseDate).toISOString(),
          endDate: endOfMonth(baseDate).toISOString(),
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Falha ao carregar parcelamentos.")
      }

      const data = (await response.json()) as InstallmentSummary[]
      setInstallments(data)
    } catch (err) {
      console.error("Erro ao carregar parcelamentos:", err)
      setError("Não foi possível carregar os parcelamentos.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAvailableMonths = useCallback(async () => {
    try {
      const response = await fetch("/api/installments/months")
      if (!response.ok) return
      const data: Array<{ value: string; label: string }> = await response.json()
      setMonthOptions(data)
    } catch (error) {
      console.error("Erro ao carregar meses de parcelamentos:", error)
    }
  }, [])

  useEffect(() => {
    void fetchAvailableMonths()
  }, [fetchAvailableMonths])

  useEffect(() => {
    if (monthOptions.length === 0) {
      if (selectedMonth !== "all") {
        setSelectedMonth("all")
      }
      return
    }

    if (!didSetInitialMonth) {
      setSelectedMonth(monthOptions[0].value)
      setDidSetInitialMonth(true)
      return
    }

    if (selectedMonth !== "all" && !monthOptions.some((option) => option.value === selectedMonth)) {
      setSelectedMonth(monthOptions[0].value)
    }
  }, [monthOptions, selectedMonth, didSetInitialMonth])

  useEffect(() => {
    void loadInstallments(selectedMonth)
  }, [selectedMonth, loadInstallments])

  const activeCount = useMemo(
    () => installments.filter((item) => !item.isCompleted).length,
    [installments],
  )

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    if (value !== "all") {
      setDidSetInitialMonth(true)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Parcelamentos</CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardDescription>
              {activeCount} parcelamento{activeCount === 1 ? "" : "s"} em andamento
            </CardDescription>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o mês" />
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
            <p className="text-center text-muted-foreground py-8">Carregando parcelamentos...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : installments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum parcelamento encontrado. Registre despesas parceladas para acompanhar aqui.
            </p>
          ) : (
            <div className="space-y-3">
              {installments.map((item) => {
                const installmentLabel = item.nextDueDate
                  ? format(new Date(item.nextDueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Concluído"

                const progressLabel = `${item.nextInstallmentNumber}/${item.totalInstallments}`

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-semibold">{item.description}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs">
                            <Badge variant="secondary">{item.category}</Badge>
                            {item.cardName && <Badge variant="outline">{item.cardName}</Badge>}
                            <Badge variant={item.isCompleted ? "default" : "secondary"}>
                              {item.isCompleted ? "Concluído" : `Parcela: ${progressLabel}`}
                            </Badge>
                            {selectedMonth !== "all" && (
                              <Badge variant={item.isPaidInPeriod ? "default" : "destructive"}>
                                {item.isPaidInPeriod ? "Pago" : "Em aberto"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.isCompleted ? "Parcelamento finalizado" : `Vence em ${installmentLabel}`}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">Valor da parcela</p>
                        <p className="text-xl font-semibold">{formatCurrency(item.installmentValue)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Total: {formatCurrency(item.totalAmount)} • Pagas: {item.paidCount} • Restantes:{" "}
                      {item.remainingCount}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
