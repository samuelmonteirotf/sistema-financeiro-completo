"use client"

import { CreditCardList } from "@/components/credit-cards/credit-card-list"

export default function CartoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cartões de Crédito</h1>
        <p className="text-muted-foreground">Gerencie todos os seus cartões de crédito</p>
      </div>

      <CreditCardList />
    </div>
  )
}
