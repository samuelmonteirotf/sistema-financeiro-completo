"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PaywallCardProps {
  requiredPlan?: string
  title?: string
  description?: string
  benefits?: string[]
}

export function PaywallCard({
  requiredPlan = "pro",
  title = "Plano necessário",
  description = "Este recurso faz parte de um plano superior.",
  benefits = ["Limites maiores", "Exportação avançada", "Suporte prioritário"],
}: PaywallCardProps) {
  return (
    <Card className="border-dashed border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          🚀 {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <Button asChild>
          <Link href={`/pricing?highlight=${requiredPlan}`}>Quero o plano {requiredPlan.toUpperCase()}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
