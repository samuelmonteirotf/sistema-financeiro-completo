"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { CreditCardDialog, type CreditCardFormValues } from "./credit-card-dialog"

interface CreditCard extends CreditCardFormValues {
  id: string
  isActive: boolean
  createdAt?: string
}

export function CreditCardList() {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/cards")
      if (!response.ok) {
        throw new Error("Não foi possível carregar os cartões")
      }

      const data = await response.json()
      setCards(data)
    } catch (err) {
      console.error("Erro ao buscar cartões:", err)
      setError("Não foi possível carregar os cartões no momento.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCards()
  }, [loadCards])

  const handleOpenDialog = (card?: CreditCard) => {
    setEditingCard(card ? { ...card } : null)
    setIsDialogOpen(true)
  }

  const handleSaveCard = async (values: CreditCardFormValues) => {
    const isEditing = Boolean(values.id)

    const payload = {
      name: values.name,
      brand: values.brand,
      lastFourDigits: values.lastFourDigits,
      limit: values.limit,
      closingDay: values.closingDay,
      dueDay: values.dueDay,
    }

    const endpoint = isEditing ? `/api/cards/${values.id}` : "/api/cards"
    const method = isEditing ? "PUT" : "POST"

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const message = isEditing ? "Não foi possível atualizar o cartão." : "Não foi possível criar o cartão."
      throw new Error(message)
    }

    await loadCards()
    setIsDialogOpen(false)
    setEditingCard(null)
  }

  const handleDeleteCard = async (cardId: string) => {
    const confirmed = window.confirm("Deseja realmente remover este cartão?")
    if (!confirmed) return

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao remover cartão")
      }

      await loadCards()
    } catch (error) {
      console.error("Erro ao remover cartão:", error)
      alert("Não foi possível remover o cartão.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meus Cartões</h2>
          <p className="text-sm text-muted-foreground">Acompanhe limites, fechamento e vencimento de cada cartão.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>Adicionar Cartão</Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Carregando cartões...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-red-500">{error}</CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum cartão cadastrado. Clique em &quot;Adicionar Cartão&quot; para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="bg-gradient-to-br from-primary to-primary/80 text-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">{card.name}</CardTitle>
                    <CardDescription className="text-white/80 capitalize">{card.brand}</CardDescription>
                  </div>
                  <div className="text-2xl font-bold">●●●●</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-white/80">Número do Cartão</p>
                  <p className="font-mono text-lg tracking-widest">●●●● ●●●● ●●●● {card.lastFourDigits}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/80">Limite</p>
                    <p className="font-semibold">{formatCurrency(card.limit)}</p>
                  </div>
                  <div>
                    <p className="text-white/80">Fechamento</p>
                    <p className="font-semibold">Dia {card.closingDay}</p>
                  </div>
                  <div>
                    <p className="text-white/80">Vencimento</p>
                    <p className="font-semibold">Dia {card.dueDay}</p>
                  </div>
                  <div>
                    <p className="text-white/80">Status</p>
                    <p className="font-semibold">{card.isActive ? "Ativo" : "Inativo"}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleOpenDialog(card)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => void handleDeleteCard(card.id)}>
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreditCardDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        card={editingCard}
        onSave={handleSaveCard}
      />
    </div>
  )
}
