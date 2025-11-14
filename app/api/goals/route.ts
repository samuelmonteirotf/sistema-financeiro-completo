import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"

const goalSchema = z.object({
  name: z.string().min(2),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  deadline: z.coerce.date().optional(),
  status: z.enum(["active", "paused", "completed"]).default("active"),
})

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const goals = await prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const result = goals.map((goal) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
    }))

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela FinancialGoal ainda não existe. Execute `npx prisma migrate dev` para criar as tabelas." },
        { status: 500 },
      )
    }
    console.error("Erro ao buscar metas financeiras:", error)
    return NextResponse.json({ error: "Erro ao buscar metas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const body = await request.json()
    const payload = goalSchema.parse(body)

    const goal = await prisma.financialGoal.create({
      data: {
        userId,
        name: payload.name,
        targetAmount: payload.targetAmount,
        currentAmount: payload.currentAmount ?? 0,
        deadline: payload.deadline,
        status: payload.status,
      },
    })

    return NextResponse.json(
      {
        ...goal,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela FinancialGoal ainda não existe. Execute `npx prisma migrate dev` para criar as tabelas." },
        { status: 500 },
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 400 })
    }

    console.error("Erro ao criar meta financeira:", error)
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 })
  }
}
