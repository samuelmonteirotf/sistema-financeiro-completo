"use client"

import { ExpenseList } from "@/components/expenses/expense-list"
import { InstallmentList } from "@/components/expenses/installment-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DespesasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Despesas</h1>
        <p className="text-muted-foreground">Registre e acompanhe todas as suas despesas</p>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Todas</TabsTrigger>
          <TabsTrigger value="installments">Parcelamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpenseList />
        </TabsContent>
        <TabsContent value="installments">
          <InstallmentList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
