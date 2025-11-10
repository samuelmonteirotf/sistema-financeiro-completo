"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface Alert {
  id: string
  type: "warning" | "danger" | "info" | "success"
  title: string
  message: string
  date: Date
  read: boolean
}

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/alerts")
        if (!response.ok) {
          throw new Error("Falha ao carregar alertas.")
        }

        const data = await response.json()
        const parsed = data.map((alert: any) => ({
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
  }, [])

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "danger":
        return "bg-red-50 border-red-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>
      case "danger":
        return <Badge className="bg-red-100 text-red-800">Alerta</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Informação</Badge>
      default:
        return <Badge>Padrão</Badge>
    }
  }

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
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

      <Card>
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
                    className={`rounded-lg border p-4 ${getAlertColor(alert.type)} ${!alert.read ? "font-semibold" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-semibold">{alert.title}</p>
                          {getAlertBadge(alert.type)}
                          {!alert.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-700">{alert.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(alert.date)}</p>
                      </div>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="whitespace-nowrap"
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
