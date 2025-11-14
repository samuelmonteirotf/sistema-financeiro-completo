import { NextResponse } from "next/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const dates = await prisma.expense.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
    })

    const seen = new Set<string>()
    const months = dates.reduce<Array<{ value: string; label: string }>>((acc, item) => {
      const value = format(item.date, "yyyy-MM")
      if (seen.has(value)) {
        return acc
      }
      seen.add(value)
      acc.push({
        value,
        label: format(item.date, "MMMM yyyy", { locale: ptBR }),
      })
      return acc
    }, [])

    return NextResponse.json(months)
  } catch (error) {
    console.error("Error fetching expense months:", error)
    return NextResponse.json({ error: "Erro ao buscar meses de despesas" }, { status: 500 })
  }
}
