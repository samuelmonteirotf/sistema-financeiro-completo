"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AlertPreference {
  id: string
  name: string
  description: string
  enabled: boolean
  threshold?: number
}

export function AlertPreferences() {
  const [preferences, setPreferences] = useState<AlertPreference[]>([
    {
      id: "credit-limit",
      name: "Limite de Crédito",
      description: "Notificar quando atingir % do limite",
      enabled: true,
      threshold: 80,
    },
    {
      id: "budget-exceeded",
      name: "Orçamento Excedido",
      description: "Notificar quando exceder orçamento",
      enabled: true,
    },
    {
      id: "invoice-due",
      name: "Fatura Próxima",
      description: "Notificar quando fatura for emitida",
      enabled: true,
    },
    {
      id: "fixed-expense",
      name: "Despesa Fixa",
      description: "Notificar antes de despesa fixa vencer",
      enabled: true,
    },
    {
      id: "loan-payment",
      name: "Pagamento de Empréstimo",
      description: "Notificar sobre pagamentos de empréstimos",
      enabled: false,
    },
  ])

  const handleToggle = (id: string) => {
    setPreferences(preferences.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)))
  }

  const handleThresholdChange = (id: string, value: number) => {
    setPreferences(preferences.map((pref) => (pref.id === id ? { ...pref, threshold: value } : pref)))
  }

  const handleSave = () => {
    console.log("Preferências salvas:", preferences)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Alertas</CardTitle>
        <CardDescription>Customize as notificações que deseja receber</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
            <div className="flex-1">
              <Label className="font-semibold">{pref.name}</Label>
              <p className="text-sm text-muted-foreground">{pref.description}</p>
              {pref.threshold !== undefined && pref.enabled && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={pref.threshold}
                    onChange={(e) => handleThresholdChange(pref.id, Number.parseInt(e.target.value))}
                    className="w-16"
                  />
                  <span className="text-sm">%</span>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={pref.enabled}
                onChange={() => handleToggle(pref.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Salvar Preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
