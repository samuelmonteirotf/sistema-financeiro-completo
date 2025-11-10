"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Usar NextAuth signIn (seguro, cria sessão JWT no cookie HttpOnly)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciais inválidas")
        return
      }

      if (result?.ok) {
        // Redirecionar para dashboard
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fazer Login</CardTitle>
        <CardDescription>Acesse sua conta do Gestor Financeiro</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Não tem conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrar
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
