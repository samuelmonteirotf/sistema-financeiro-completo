import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expenseSchema } from '@/lib/validations/expense'
import { calculateInstallments } from '@/lib/utils/calculations'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId
      },
      include: {
        category: true,
        creditCard: true,
        installmentDetails: true,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Erro ao buscar despesa:', error)
    return NextResponse.json({ error: 'Erro ao buscar despesa' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    // Verificar se a despesa existe e pertence ao usuário
    const existing = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        installmentDetails: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const validated = expenseSchema.parse(body)

    // Se a despesa tinha parcelas, deletar as antigas
    if (existing.installmentDetails.length > 0) {
      await prisma.installment.deleteMany({
        where: { expenseId: id },
      })
    }

    // Atualizar a despesa
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description: validated.description,
        amount: validated.amount.toNumber(),
        date: validated.date,
        creditCardId: validated.creditCardId || null,
        categoryId: validated.categoryId,
        installments: validated.installments,
        observations: validated.observations,
      },
    })

    // Se tiver parcelas, criar as novas
    if (validated.installments > 1 && validated.creditCardId) {
      const card = await prisma.creditCard.findUnique({
        where: { id: validated.creditCardId },
      })

      if (card) {
        const installmentsData = calculateInstallments(
          validated.amount,
          validated.installments,
          validated.date
        )

        for (const installment of installmentsData) {
          await prisma.installment.create({
            data: {
              expenseId: expense.id,
              creditCardId: card.id,
              installmentNumber: installment.installmentNumber,
              dueDate: installment.dueDate,
              amount: installment.amount.toNumber(),
            },
          })
        }
      }
    }

    // Buscar expense atualizada com relações
    const updated = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        category: true,
        creditCard: true,
        installmentDetails: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro ao atualizar despesa:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao atualizar despesa' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    // Verificar se a despesa existe e pertence ao usuário
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Despesa não encontrada' }, { status: 404 })
    }

    // Deletar despesa (Prisma irá deletar as parcelas automaticamente por causa do onDelete: Cascade)
    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Despesa deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar despesa:', error)
    return NextResponse.json({ error: 'Erro ao deletar despesa' }, { status: 500 })
  }
}
