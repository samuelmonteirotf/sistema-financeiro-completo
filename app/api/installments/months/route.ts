import { NextResponse } from "next/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const installmentDates = await prisma.installment.findMany({
      where: {
        expense: {
          userId,
          installments: {
            gt: 1,
          },
        },
      },
      select: { dueDate: true },
      orderBy: { dueDate: "desc" },
    })

    const seen = new Set<string>()
    const months = installmentDates.reduce<Array<{ value: string; label: string }>>((acc, item) => {
      const value = format(item.dueDate, "yyyy-MM")
      if (seen.has(value)) {
        return acc
      }
      seen.add(value)
      acc.push({
        value,
        label: format(item.dueDate, "MMMM yyyy", { locale: ptBR }),
      })
      return acc
    }, [])

    return NextResponse.json(months)
  } catch (error) {
    console.error("Error fetching installment months:", error)
    return NextResponse.json({ error: "Erro ao buscar meses de parcelamentos" }, { status: 500 })
  }
}
