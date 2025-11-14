import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expenseSchema } from '@/lib/validations/expense'
import { calculateInstallments } from '@/lib/utils/calculations'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { checkLimit, recordUsage } from '@/lib/limits'
import { paymentRequired } from '@/lib/http'

export async function GET(request: Request) {
  try {
    // Obter userId da sessão JWT (stateless, sem consulta ao banco)
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    const creditCardId = searchParams.get('creditCardId')

    const where: any = {
      userId: userId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (creditCardId) {
      where.creditCardId = creditCardId
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        creditCard: true,
        installmentDetails: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar despesas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Obter userId da sessão JWT (stateless, sem consulta ao banco)
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const limitCheck = await checkLimit(userId, 'expenses')
    if (!limitCheck.ok) {
      return paymentRequired({
        resource: 'expenses',
        requiredPlan: limitCheck.requiredPlan,
        used: limitCheck.used,
        limit: limitCheck.limit,
      })
    }

    const body = await request.json()

    // Validar com Zod
    const validatedData = expenseSchema.parse(body)

    const category = await prisma.category.findFirst({
      where: { id: validatedData.categoryId, ownerId: userId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    const amountDecimal = validatedData.amount
    const amount = amountDecimal.toNumber()

    // Criar despesa
    const expense = await prisma.expense.create({
      data: {
        userId: userId,
        description: validatedData.description,
        amount,
        date: validatedData.date,
        creditCardId: validatedData.creditCardId,
        categoryId: category.id,
        installments: validatedData.installments,
        observations: validatedData.observations
      }
    })

    // Se for parcelado, criar as parcelas
    if (validatedData.installments > 1) {
      const installmentsData = calculateInstallments(
        amountDecimal,
        validatedData.installments,
        validatedData.date
      )

      await prisma.installment.createMany({
        data: installmentsData.map(inst => ({
          expenseId: expense.id,
          installmentNumber: inst.installmentNumber,
          dueDate: inst.dueDate,
          amount: inst.amount.toNumber(),
          creditCardId: validatedData.creditCardId
        }))
      })
    }

    const expenseWithRelations = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        category: true,
        creditCard: true,
        installmentDetails: true
      }
    })

    const responsePayload = expenseWithRelations ?? expense

    await recordUsage(
      limitCheck.subscriptionId,
      'expenses',
      limitCheck.used + 1,
      limitCheck.limit,
      limitCheck.plan
    )

    return NextResponse.json(responsePayload, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      )
    }

    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Erro ao criar despesa' },
      { status: 500 }
    )
  }
}
