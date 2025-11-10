"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Investment {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  purchasePrice: number
  purchaseDate: string
  status: string
}

export function InvestmentList() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const loadInvestments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/investments")
      if (!response.ok) {
        throw new Error("Falha ao buscar investimentos.")
      }

      const data = await response.json()
      setInvestments(data)
    } catch (err) {
      console.error("Erro ao carregar investimentos:", err)
      setError("Não foi possível carregar os investimentos.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInvestments()
  }, [loadInvestments])

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
      await loadInvestments()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investimentos</CardTitle>
        <CardDescription>Acompanhe o desempenho dos seus ativos</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-6 text-center text-muted-foreground">Carregando investimentos...</p>
        ) : error ? (
          <p className="py-6 text-center text-red-500">{error}</p>
        ) : investments.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Nenhum investimento cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {investments.map((investment) => {
              const profitLoss = investment.currentValue - investment.amount
              const percentage = investment.amount > 0 ? (profitLoss / investment.amount) * 100 : 0
              const badgeClass =
                profitLoss >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

              return (
                <div
                  key={investment.id}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 group"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{investment.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{investment.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(investment.currentValue)}</p>
                      <Badge className={badgeClass}>
                        {profitLoss >= 0 ? "+" : "-"}
                        {Math.abs(percentage).toFixed(2)}%
                      </Badge>
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
