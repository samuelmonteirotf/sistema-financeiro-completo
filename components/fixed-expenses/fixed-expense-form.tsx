"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EXPENSE_CATEGORIES } from "@/lib/constants"

interface FixedExpenseData {
  description: string
  amount: number
  category: string
  dueDay: number
  frequency: "monthly" | "quarterly" | "yearly"
}

interface FixedExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FixedExpenseData) => Promise<void>
}

export function FixedExpenseForm({ open, onOpenChange, onSubmit }: FixedExpenseFormProps) {
  const [formData, setFormData] = useState<FixedExpenseData>({
    description: "",
    amount: 0,
    category: "Outro",
    dueDay: 1,
    frequency: "monthly",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      setFormData({
        description: "",
        amount: 0,
        category: "Outro",
        dueDay: 1,
        frequency: "monthly",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar despesa fixa:", error)
      alert("Não foi possível salvar a despesa fixa.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Despesa Fixa</DialogTitle>
          <DialogDescription>Registre despesas recorrentes como aluguel, conta de internet, etc</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Aluguel, Internet, Telefone"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia do Vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: Number.parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(category) => setFormData({ ...formData, category })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select
                value={formData.frequency}
                onValueChange={(freq) => setFormData({ ...formData, frequency: freq as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Adicionar"}
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
