import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { z } from 'zod'
import { checkLimit, recordUsage } from '@/lib/limits'
import { paymentRequired } from '@/lib/http'

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(loans)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2021' || error.code === 'P2022')) {
      return NextResponse.json(
        { error: 'Estrutura de banco desatualizada. Execute `npx prisma migrate dev` para aplicar as últimas tabelas.' },
        { status: 500 }
      )
    }
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar empréstimos' },
      { status: 500 }
    )
  }
}

export const loanSchema = z.object({
  name: z.string().min(2),
  lenderName: z.string().min(2),
  originalAmount: z.number().positive(),
  currentBalance: z.number().min(0).optional(),
  interestRate: z.number().min(0),
  monthlyPayment: z.number().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.string().default("active"),
  loanType: z.enum(["loan", "financing"]).default("loan"),
})

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const limitCheck = await checkLimit(userId, 'loans')
    if (!limitCheck.ok) {
      return paymentRequired({
        resource: 'loans',
        requiredPlan: limitCheck.requiredPlan,
        used: limitCheck.used,
        limit: limitCheck.limit,
      })
    }

    const body = await request.json()
    const payload = loanSchema.parse(body)

    const loan = await prisma.loan.create({
      data: {
        userId,
        name: payload.name,
        lenderName: payload.lenderName,
        originalAmount: payload.originalAmount,
        currentBalance: payload.currentBalance ?? payload.originalAmount,
        interestRate: payload.interestRate,
        monthlyPayment: payload.monthlyPayment,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status ?? 'active',
        loanType: payload.loanType ?? 'loan',
      },
    })

    await recordUsage(
      limitCheck.subscriptionId,
      'loans',
      limitCheck.used + 1,
      limitCheck.limit,
      limitCheck.plan
    )

    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2021' || error.code === 'P2022')) {
      return NextResponse.json(
        { error: 'Estrutura de banco desatualizada. Execute `npx prisma migrate dev` para aplicar as últimas tabelas.' },
        { status: 500 }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Erro ao criar empréstimo' },
      { status: 500 }
    )
  }
}
