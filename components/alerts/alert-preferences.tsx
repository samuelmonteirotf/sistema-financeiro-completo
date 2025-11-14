"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import type { AlertPreference } from "@/types/alert-preferences"

export function AlertPreferences() {
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<AlertPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        setIsLoading(true)
        const response = await apiFetch("/api/settings/alerts")
        if (!response.ok) {
          throw new Error("Não foi possível carregar preferências")
        }
        const data = (await response.json()) as AlertPreference[]
        if (mounted) {
          setPreferences(data)
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error)
        toast({
          variant: "destructive",
          title: "Erro ao carregar preferências",
          description: "Tente novamente mais tarde.",
        })
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [toast])

  const handleToggle = (id: string) => {
    setPreferences((prev) => prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)))
  }

  const handleThresholdChange = (id: string, value: number) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id
          ? {
              ...pref,
              threshold: Number.isNaN(value) ? pref.threshold : value,
            }
          : pref
      )
    )
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await apiFetch("/api/settings/alerts", {
        method: "PUT",
        json: preferences,
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar preferências")
      }

      toast({
        title: "Preferências salvas",
        description: "Atualizamos suas notificações.",
      })
    } catch (error) {
      console.error("Erro ao salvar preferências:", error)
      toast({
        variant: "destructive",
        title: "Falha ao salvar",
        description: "Tente novamente mais tarde.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Alertas</CardTitle>
          <CardDescription>Customize as notificações que deseja receber</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando preferências...</p>
        </CardContent>
      </Card>
    )
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
          <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
