import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateInvoicePeriod, sumDecimals } from '@/lib/utils/calculations'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month') // YYYY-MM

    if (!monthParam) {
      return NextResponse.json(
        { error: 'Parâmetro month é obrigatório (formato: YYYY-MM)' },
        { status: 400 }
      )
    }

    // Buscar cartão
    const card = await prisma.creditCard.findFirst({
      where: { id, userId }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    // Calcular período da fatura
    const referenceDate = new Date(monthParam + '-01')
    const { start, end } = calculateInvoicePeriod(referenceDate, card.closingDay)

    // Buscar despesas à vista do período
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        creditCardId: card.id,
        date: {
          gte: start,
          lte: end
        },
        installments: 1 // Apenas à vista
      },
      include: {
        category: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Buscar parcelas que vencem no período
    const installments = await prisma.installment.findMany({
      where: {
        creditCardId: card.id,
        dueDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        expense: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Montar items da fatura
    const items = [
      ...expenses.map(exp => ({
        id: exp.id,
        date: exp.date,
        description: exp.description,
        category: exp.category.name,
        amount: exp.amount,
        installment: null
      })),
      ...installments.map(inst => ({
        id: inst.id,
        date: inst.dueDate,
        description: inst.expense.description,
        category: inst.expense.category.name,
        amount: inst.amount,
        installment: `${inst.installmentNumber}/${inst.expense.installments}`
      }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calcular total com Decimal.js
    const total = sumDecimals([
      ...expenses.map(exp => new Decimal(exp.amount.toString())),
      ...installments.map(inst => new Decimal(inst.amount.toString()))
    ])

    return NextResponse.json({
      cardId: card.id,
      cardName: card.name,
      month: monthParam,
      closingDate: end,
      dueDate: new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + 1,
        card.dueDay
      ),
      items,
      total: total.toNumber()
    })
  } catch (error) {
    console.error('Error calculating invoice:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular fatura' },
      { status: 500 }
    )
  }
}
