"use client"

import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName = "Usuário" }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, Ministro Xandão!</h1>
        <p className="text-white/80">Veja seu resumo financeiro abaixo</p>
      </div>
      <Button variant="secondary">Sair</Button>
    </div>
  )
}
