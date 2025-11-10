import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateInvoicePeriod, sumDecimals } from '@/lib/utils/calculations'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

function formatMonthYear(date: Date) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
  const label = formatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const MONTHS_TO_FETCH = 3

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const cards = await prisma.creditCard.findMany({
      where: { userId, isActive: true }
    })

    const now = new Date()
    const invoices: Array<{
      id: string
      cardId: string
      cardName: string
      referenceMonth: string
      dueDate: Date
      totalAmount: number
      paidAmount: number
      status: 'open' | 'partial_paid' | 'paid'
    }> = []

    for (const card of cards) {
      for (let offset = 0; offset < MONTHS_TO_FETCH; offset++) {
        const reference = new Date(now.getFullYear(), now.getMonth() - offset, 1)
        const { start, end } = calculateInvoicePeriod(reference, card.closingDay)

        const [expenses, installments] = await Promise.all([
          prisma.expense.findMany({
            where: {
              userId,
              creditCardId: card.id,
              date: {
                gte: start,
                lte: end
              },
              installments: 1
            }
          }),
          prisma.installment.findMany({
            where: {
              creditCardId: card.id,
              dueDate: {
                gte: start,
                lte: end
              }
            }
          })
        ])

        const total = sumDecimals([
          ...expenses.map(exp => new Decimal(exp.amount.toString())),
          ...installments.map(inst => new Decimal(inst.amount.toString()))
        ])

        if (total.isZero()) {
          continue
        }

        const paidAmountDecimal = installments
          .filter(inst => inst.isPaid && inst.dueDate <= end && inst.amount)
          .reduce((sum, inst) => sum.plus(new Decimal(inst.amount.toString())), new Decimal(0))

        const dueDate = new Date(
          reference.getFullYear(),
          reference.getMonth() + 1,
          card.dueDay
        )

        const totalAmount = total.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
        const paidAmount = paidAmountDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()

        let status: 'open' | 'partial_paid' | 'paid' = 'open'
        if (paidAmount >= totalAmount && totalAmount > 0) {
          status = 'paid'
        } else if (paidAmount > 0 && paidAmount < totalAmount) {
          status = 'partial_paid'
        } else if (dueDate < now && paidAmount === 0) {
          status = 'open'
        }

        invoices.push({
          id: `${card.id}-${reference.getFullYear()}-${reference.getMonth() + 1}`,
          cardId: card.id,
          cardName: card.name,
          referenceMonth: formatMonthYear(reference),
          dueDate,
          totalAmount,
          paidAmount,
          status
        })
      }
    }

    // Ordenar por dueDate desc
    invoices.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar faturas' },
      { status: 500 }
    )
  }
}
