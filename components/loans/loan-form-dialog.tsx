"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export interface LoanFormValues {
  id?: string
  name: string
  lenderName: string
  originalAmount: number
  currentBalance: number
  monthlyPayment: number
  interestRate: number
  startDate: string
  endDate: string
  status: string
  loanType: "loan" | "financing"
}

interface LoanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LoanFormValues) => Promise<void>
  initialData?: LoanFormValues | null
}

const emptyLoan: LoanFormValues = {
  name: "",
  lenderName: "",
  originalAmount: 0,
  currentBalance: 0,
  monthlyPayment: 0,
  interestRate: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  status: "active",
  loanType: "loan",
}

export function LoanFormDialog({ open, onOpenChange, onSubmit, initialData }: LoanFormDialogProps) {
  const [form, setForm] = useState<LoanFormValues>(emptyLoan)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ?? emptyLoan)
    }
  }, [initialData, open])

  const handleChange = (field: keyof LoanFormValues, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{form.id ? "Editar financiamento/empréstimo" : "Novo financiamento/empréstimo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Instituição</Label>
              <Input value={form.lenderName} onChange={(e) => handleChange("lenderName", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.loanType}
                onChange={(e) => handleChange("loanType", e.target.value as LoanFormValues["loanType"])}
              >
                <option value="loan">Empréstimo</option>
                <option value="financing">Financiamento</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="late">Em atraso</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Valor contratado (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.originalAmount}
                onChange={(e) => handleChange("originalAmount", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Saldo atual (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.currentBalance}
                onChange={(e) => handleChange("currentBalance", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Parcela mensal (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyPayment}
                onChange={(e) => handleChange("monthlyPayment", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Taxa de juros (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.interestRate}
                onChange={(e) => handleChange("interestRate", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Início</Label>
              <Input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Fim</Label>
              <Input type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)} required />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
