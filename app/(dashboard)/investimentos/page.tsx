"use client"

import { useState } from "react"
import { CryptoInvestmentsList } from "@/components/crypto/crypto-investments-list"
import { InvestmentList } from "@/components/investments/investment-list"
import { InvestmentFormDialog } from "@/components/investments/investment-form-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InvestimentosPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleInvestmentCreated = () => {
    // Força o refresh dos componentes incrementando a key
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">Monitore o desempenho dos seus investimentos</p>
        </div>
        <InvestmentFormDialog onSuccess={handleInvestmentCreated} />
      </div>

      <Tabs defaultValue="crypto" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crypto">Criptomoedas</TabsTrigger>
          <TabsTrigger value="all">Todos os Investimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-4">
          <CryptoInvestmentsList
            key={`crypto-${refreshKey}`}
            autoUpdate={true}
            updateInterval={30000} // 30 segundos
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <InvestmentList key={`all-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
