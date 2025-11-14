"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RefreshCw, TrendingUp, TrendingDown, Coins, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Investment {
  id: string
  name: string
  type: string
  amount: number
  purchasePrice: number
  currentValue: number
  investedValue?: number
  profit?: number
  profitPercent?: number
  isPositive?: boolean
}

interface CryptoInvestmentsListProps {
  autoUpdate?: boolean
  updateInterval?: number // em milissegundos (padrão: 20000 = 20 segundos)
}

export function CryptoInvestmentsList({
  autoUpdate = true,
  updateInterval = 20000
}: CryptoInvestmentsListProps) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInvestments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/investments?includeRoi=true')

      if (!response.ok) {
        throw new Error('Erro ao buscar investimentos')
      }

      const data = await response.json()

      // Filtrar apenas cryptos
      const cryptoInvs = data.filter((inv: Investment) => inv.type === 'crypto')
      setInvestments(cryptoInvs)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('Erro ao buscar investimentos:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCryptoPrices = useCallback(async () => {
    if (investments.length === 0) return

    setIsUpdating(true)

    try {
      const response = await fetch('/api/crypto/update-investments', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar preços')
      }

      // Recarregar investimentos após atualização
      await fetchInvestments()
    } catch (err: any) {
      console.error('Erro ao atualizar preços:', err)
    } finally {
      setIsUpdating(false)
    }
  }, [investments.length, fetchInvestments])

  // Carregar investimentos na montagem
  useEffect(() => {
    void fetchInvestments()
  }, [fetchInvestments])

  // Atualização automática dos preços
  useEffect(() => {
    if (autoUpdate && updateInterval > 0 && investments.length > 0) {
      const interval = setInterval(() => {
        void updateCryptoPrices()
      }, updateInterval)

      return () => clearInterval(interval)
    }
  }, [autoUpdate, updateInterval, investments.length, updateCryptoPrices])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Nunca'

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 10) return 'Agora'
    if (seconds < 60) return `${seconds}s atrás`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}min atrás`

    const hours = Math.floor(minutes / 60)
    return `${hours}h atrás`
  }

  const handleDeleteClick = (id: string) => {
    setInvestmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!investmentToDelete) return

    try {
      const response = await fetch(`/api/investments/${investmentToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir investimento')
      }

      toast({
        title: "Sucesso!",
        description: "Investimento excluído com sucesso",
      })

      // Recarregar lista
      await fetchInvestments()
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o investimento",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setInvestmentToDelete(null)
    }
  }

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.investedValue || 0), 0)
  const totalCurrent = investments.reduce((sum, inv) => sum + (inv.currentValue ?? 0), 0)
  const totalProfit = totalCurrent - totalInvested
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Investimentos em Criptomoedas</CardTitle>
            <CardDescription>
              Valores atualizados em tempo real
              {lastUpdate && ` • ${formatTimeAgo(lastUpdate)}`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void updateCryptoPrices()}
            disabled={isUpdating || isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating || isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Resumo Total */}
        {investments.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg border border-border bg-card/80 text-card-foreground shadow-inner shadow-black/10">
            <div>
              <p className="text-sm text-muted-foreground">Total Investido</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalInvested)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Atual</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(totalCurrent)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucro/Prejuízo</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-500 dark:text-[#19a34a]' : 'text-red-600 dark:text-destructive'}`}>
                  {formatCurrency(Math.abs(totalProfit))}
                </p>
                <Badge variant={totalProfit >= 0 ? "default" : "destructive"}>
                  {totalProfit >= 0 ? '+' : '-'}{Math.abs(totalProfitPercent).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {investments.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum investimento em criptomoedas encontrado
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando investimentos...</p>
            </div>
          )}

          {investments.map((investment) => {
            const profit = investment.profit || 0
            const profitPercent = investment.profitPercent || 0
            const isPositive = profit >= 0

            return (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/60 hover:bg-card transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-accent/30">
                    {investment.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{investment.name.toUpperCase()}</h4>
                    <p className="text-sm text-muted-foreground">
                      {investment.amount} {investment.name.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <p className="font-semibold text-primary">{formatCurrency(investment.currentValue)}</p>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <p className="text-sm text-muted-foreground">
                        Investido: {formatCurrency(investment.investedValue || 0)}
                      </p>
                      <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                        {isPositive ? '+' : ''}{profitPercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(investment.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {investments.length > 0 && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
            Atualização automática a cada {updateInterval / 1000} segundos
          </div>
        )}
      </CardContent>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
