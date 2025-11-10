"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/cartoes", label: "Cartões", icon: "💳" },
  { href: "/despesas", label: "Despesas", icon: "💸" },
  { href: "/despesas-fixas", label: "Despesas Fixas", icon: "📌" },
  { href: "/faturas", label: "Faturas", icon: "📄" },
  { href: "/emprestimos", label: "Empréstimos", icon: "📈" },
  { href: "/investimentos", label: "Investimentos", icon: "💰" },
  { href: "/relatorios", label: "Relatórios", icon: "📊" },
  { href: "/notificacoes", label: "Notificações", icon: "🔔" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.clear() // Limpar todo o localStorage
    router.push("/login")
    router.refresh() // Forçar refresh
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg border p-4 space-y-2 sticky top-6">
            <h2 className="text-lg font-bold px-2">Menu</h2>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant={pathname === item.href ? "default" : "ghost"} className="w-full justify-start">
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <span className="mr-2">🚪</span>
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-4">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
