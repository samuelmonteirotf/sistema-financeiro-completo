"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { differenceInDays, isAfter } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { GoalFormDialog, type GoalFormValues } from "@/components/goals/goal-form-dialog"

interface Goal extends GoalFormValues {
  id: string
  createdAt: string
  updatedAt: string
}

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/goals")
      if (!response.ok) {
        throw new Error("Falha ao carregar metas")
      }
      const data = await response.json()
      setGoals(data)
    } catch (err) {
      console.error("Erro ao carregar metas:", err)
      setError("Não foi possível carregar as metas.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadGoals()
  }, [loadGoals])

  const progressInfo = useCallback((goal: Goal) => {
    const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0
    let indicator = "Em andamento"
    let badgeVariant: "default" | "destructive" | "secondary" = "secondary"

    if (goal.status === "completed") {
      indicator = "Meta concluída"
      badgeVariant = "default"
    } else if (goal.status === "paused") {
      indicator = "Pausada"
      badgeVariant = "secondary"
    } else {
      let expected = 0.7
      if (goal.deadline) {
        const start = new Date(goal.createdAt)
        const deadline = new Date(goal.deadline)
        if (isAfter(deadline, start)) {
          const totalDays = differenceInDays(deadline, start)
          const elapsedDays = Math.max(differenceInDays(new Date(), start), 0)
          expected = Math.min(Math.max(elapsedDays / totalDays, 0), 1)
        }
      }

      if (progress >= expected) {
        indicator = "No caminho certo"
        badgeVariant = "default"
      } else {
        indicator = "Atenção"
        badgeVariant = "destructive"
      }
    }

    return {
      progress: Math.min(Math.max(progress, 0), 1),
      indicator,
      badgeVariant,
    }
  }, [])

  const handleSubmit = async (values: GoalFormValues) => {
    if (values.id) {
      await fetch(`/api/goals/${values.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
    } else {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
    }

    await loadGoals()
  }

  const handleDelete = async (goal: Goal) => {
    if (!window.confirm(`Deseja excluir a meta "${goal.name}"?`)) return
    await fetch(`/api/goals/${goal.id}`, { method: "DELETE" })
    await loadGoals()
  }

  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === "active").length, [goals])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Metas Financeiras</CardTitle>
          <CardDescription>
            {activeGoals} meta{activeGoals === 1 ? "" : "s"} em andamento
          </CardDescription>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null)
            setIsDialogOpen(true)
          }}
        >
          Nova Meta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando metas...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : goals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma meta registrada.</p>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => {
              const info = progressInfo(goal)
              const progressPercent = (info.progress * 100).toFixed(0)

              return (
                <div key={goal.id} className="rounded-lg border p-4 bg-card/60">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Objetivo: {formatCurrency(goal.targetAmount)} • Atual:{" "}
                        {formatCurrency(goal.currentAmount)}
                      </p>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      <Badge variant={info.badgeVariant}>{info.indicator}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingGoal(goal)
                          setIsDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void handleDelete(goal)}>
                        Remover
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min(Number(progressPercent), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <GoalFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingGoal}
      />
    </Card>
  )
}
