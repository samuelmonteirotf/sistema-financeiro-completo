"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  userName?: string
  unreadAlerts?: number
}

export function DashboardHeader({ userName, unreadAlerts = 0 }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const displayName = session?.user?.name ?? userName ?? "Usuário"

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold leading-tight">Bem-vindo, {displayName}!</h1>
        <p className="text-white/80">Veja seu resumo financeiro abaixo</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggle
          variant="secondary"
          className="bg-white/15 hover:bg-white/20 border-white/30 text-white"
        />
        <Button
          asChild
          variant="secondary"
          className="bg-white/15 hover:bg-white/20 border-white/30 text-white relative"
        >
          <Link href="/notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
            {unreadAlerts > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold">
                {unreadAlerts}
              </span>
            )}
          </Link>
        </Button>
        <Button variant="secondary" onClick={() => void signOut({ callbackUrl: "/login" })}>
          Sair
        </Button>
      </div>
    </div>
  )
}
