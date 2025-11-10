"use client"

import type React from "react"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CREDIT_CARD_BRANDS } from "@/lib/constants"

export interface CreditCardFormValues {
  id?: string
  name: string
  brand: string
  lastFourDigits: string
  limit: number
  closingDay: number
  dueDay: number
}

interface CreditCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CreditCardFormValues | null
  onSave: (card: CreditCardFormValues) => Promise<void>
}

const EMPTY_FORM: CreditCardFormValues = {
  name: "",
  brand: "Visa",
  lastFourDigits: "",
  limit: 0,
  closingDay: 1,
  dueDay: 1,
}

export function CreditCardDialog({ open, onOpenChange, card, onSave }: CreditCardDialogProps) {
  const [formData, setFormData] = useState<CreditCardFormValues>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (card) {
      setFormData({ ...EMPTY_FORM, ...card })
    } else {
      setFormData(EMPTY_FORM)
    }
  }, [card, open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      await onSave({
        ...formData,
        id: card?.id,
      })
      setFormData(EMPTY_FORM)
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar cartão:", error)
      alert("Não foi possível salvar o cartão. Verifique os dados e tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? "Editar Cartão" : "Adicionar Novo Cartão"}</DialogTitle>
          <DialogDescription>
            {card ? "Atualize as informações do seu cartão" : "Preencha os dados do seu novo cartão de crédito"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              placeholder="ex: Cartão Pessoal"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Bandeira</Label>
              <Select value={formData.brand} onValueChange={(brand) => setFormData({ ...formData, brand })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a bandeira" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_CARD_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastFourDigits">Últimos 4 Dígitos</Label>
              <Input
                id="lastFourDigits"
                placeholder="1234"
                value={formData.lastFourDigits}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    lastFourDigits: event.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Limite (R$)</Label>
              <Input
                id="limit"
                type="number"
                placeholder="5000"
                value={formData.limit || ""}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    limit: Number.parseFloat(event.target.value) || 0,
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDay">Dia do Fechamento</Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                value={formData.closingDay}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    closingDay: Number.parseInt(event.target.value, 10) || 1,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDay">Dia do Vencimento</Label>
            <Input
              id="dueDay"
              type="number"
              min="1"
              max="31"
              value={formData.dueDay}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  dueDay: Number.parseInt(event.target.value, 10) || 1,
                })
              }
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : card ? "Atualizar" : "Adicionar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => !isSubmitting && onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
