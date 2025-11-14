"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export interface GoalFormValues {
  id?: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string | null
  status: "active" | "paused" | "completed"
}

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GoalFormValues) => Promise<void>
  initialData?: GoalFormValues | null
}

const emptyForm: GoalFormValues = {
  name: "",
  targetAmount: 0,
  currentAmount: 0,
  deadline: null,
  status: "active",
}

export function GoalFormDialog({ open, onOpenChange, onSubmit, initialData }: GoalFormDialogProps) {
  const [form, setForm] = useState<GoalFormValues>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ?? emptyForm)
    }
  }, [initialData, open])

  const handleChange = (field: keyof GoalFormValues, value: string | number | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{form.id ? "Editar Meta" : "Nova Meta Financeira"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Reserva de emergência"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Valor objetivo (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => handleChange("targetAmount", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Valor atual (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.currentAmount}
                onChange={(e) => handleChange("currentAmount", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.deadline ? format(new Date(form.deadline), "yyyy-MM-dd") : ""}
                onChange={(e) => handleChange("deadline", e.target.value || null)}
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value as GoalFormValues["status"])}
              >
                <option value="active">Em andamento</option>
                <option value="paused">Pausada</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
