"use client"

import { AlertCenter } from "@/components/alerts/alert-center"
import { AlertPreferences } from "@/components/alerts/alert-preferences"

export default function NotificacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notificações e Alertas</h1>
        <p className="text-muted-foreground">Gerencie todas as suas notificações financeiras</p>
      </div>

      <AlertCenter />

      <AlertPreferences />
    </div>
  )
}
