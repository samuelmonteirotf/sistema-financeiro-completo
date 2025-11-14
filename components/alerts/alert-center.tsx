"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { AlertItem } from "@/types/alerts"

const COLOR_MAP: Record<
  AlertItem["type"],
  { container: string; badge: string }
> = {
  warning: {
    container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200",
  },
  danger: {
    container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
  },
  success: {
    container: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200",
  },
  info: {
    container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
  },
}

export function AlertCenter() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/alerts")
        if (!response.ok) {
          throw new Error("Falha ao carregar alertas.")
        }

        const data: Array<Omit<AlertItem, "date"> & { date?: string | Date }> = await response.json()
        const parsed: AlertItem[] = data.map((alert) => ({
          ...alert,
          date: alert.date ? new Date(alert.date) : new Date(),
        }))
        setAlerts(parsed)
      } catch (err) {
        console.error("Erro ao carregar alertas:", err)
        setError("Não foi possível carregar os alertas.")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAlerts()

    const interval = setInterval(() => {
      void fetchAlerts()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    const previous = alerts
    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))

    try {
      setIsSyncing(true)
      const response = await fetch("/api/alerts/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: id }),
      })

      if (!response.ok) {
        throw new Error("Falha ao sincronizar alerta")
      }
    } catch (err) {
      console.error("Erro ao marcar alerta como lido:", err)
      setAlerts(previous)
    } finally {
      setIsSyncing(false)
    }
  }

  const renderBadge = (type: AlertItem["type"]) => {
    const colors = COLOR_MAP[type] ?? COLOR_MAP.info
    return <Badge className={colors.badge}>{type.toUpperCase()}</Badge>
  }

  const containerClasses = (type: AlertItem["type"], read: boolean) => {
    if (read) return "rounded-lg border p-4 bg-card border-border"
    const colors = COLOR_MAP[type] ?? COLOR_MAP.info
    return `rounded-lg border p-4 ${colors.container}`
  }

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Centro de Notificações</h2>
        {unreadCount > 0 && (
          <Badge className="bg-red-500 text-white">
            {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Alertas Recentes</CardTitle>
          <CardDescription>Fique atento às suas finanças</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-6 text-center text-muted-foreground">Carregando alertas...</p>
          ) : error ? (
            <p className="py-6 text-center text-red-500">{error}</p>
          ) : (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum alerta no momento</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`${containerClasses(alert.type, alert.read)} ${!alert.read ? "font-semibold" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-semibold">{alert.title}</p>
                          {renderBadge(alert.type)}
                          {!alert.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(alert.date)}</p>
                      </div>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleMarkAsRead(alert.id)}
                          className="whitespace-nowrap"
                          disabled={isSyncing}
                        >
                          Marcar como lida
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
