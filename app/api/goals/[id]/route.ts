import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"

const updateSchema = z.object({
  name: z.string().min(2),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0),
  deadline: z.coerce.date().optional().nullable(),
  status: z.enum(["active", "paused", "completed"]),
})

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const body = await request.json()
    const payload = updateSchema.parse(body)

    const goal = await prisma.financialGoal.updateMany({
      where: { id, userId },
      data: {
        name: payload.name,
        targetAmount: payload.targetAmount,
        currentAmount: payload.currentAmount,
        deadline: payload.deadline ?? null,
        status: payload.status,
      },
    })
    if (goal.count === 0) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 })
    }

    const refreshed = await prisma.financialGoal.findUniqueOrThrow({
      where: { id },
    })

    return NextResponse.json({
      ...refreshed,
      targetAmount: Number(refreshed.targetAmount),
      currentAmount: Number(refreshed.currentAmount),
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela FinancialGoal ausente. Execute `npx prisma migrate dev` para criar as tabelas." },
        { status: 500 },
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 })
    }
    console.error("Erro ao atualizar meta:", error)
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const result = await prisma.financialGoal.deleteMany({
      where: { id, userId },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela FinancialGoal ausente. Execute `npx prisma migrate dev` para criar as tabelas." },
        { status: 500 },
      )
    }
    console.error("Erro ao excluir meta:", error)
    return NextResponse.json({ error: "Erro ao excluir meta" }, { status: 500 })
  }
}
