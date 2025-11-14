import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"
import { loanSchema } from "@/app/api/loans/route"

const updateSchema = loanSchema.extend({
  status: z.string(),
  loanType: z.enum(["loan", "financing"]),
})

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const body = await request.json()
    const payload = updateSchema.parse(body)

    const result = await prisma.loan.updateMany({
      where: { id, userId },
      data: {
        name: payload.name,
        lenderName: payload.lenderName,
        originalAmount: payload.originalAmount,
        currentBalance: payload.currentBalance ?? payload.originalAmount,
        interestRate: payload.interestRate,
        monthlyPayment: payload.monthlyPayment,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status,
        loanType: payload.loanType,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 })
    }

    const refreshed = await prisma.loan.findUnique({ where: { id } })
    return NextResponse.json(refreshed)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022")) {
      return NextResponse.json(
        { error: "Estrutura de banco desatualizada. Execute `npx prisma migrate dev` para aplicar as últimas tabelas." },
        { status: 500 },
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 })
    }
    console.error("Erro ao atualizar empréstimo:", error)
    return NextResponse.json({ error: "Erro ao atualizar empréstimo" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const result = await prisma.loan.deleteMany({
      where: { id, userId },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022")) {
      return NextResponse.json(
        { error: "Estrutura de banco desatualizada. Execute `npx prisma migrate dev` para aplicar as últimas tabelas." },
        { status: 500 },
      )
    }
    console.error("Erro ao remover empréstimo:", error)
    return NextResponse.json({ error: "Erro ao remover empréstimo" }, { status: 500 })
  }
}
