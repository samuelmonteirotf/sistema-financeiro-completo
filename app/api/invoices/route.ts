import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateInvoicePeriod, sumDecimals } from '@/lib/utils/calculations'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { parseAlertSettings } from '@/lib/alert-settings'
import { format, startOfMonth, differenceInMonths } from 'date-fns'
import { findUserSettingsSafe } from '@/lib/user-settings'

function formatMonthYear(date: Date) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
  const label = formatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const MAX_MONTHS_LOOKBACK = 24

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const [cards, settings] = await Promise.all([
      prisma.creditCard.findMany({
        where: { userId, isActive: true }
      }),
      findUserSettingsSafe(userId)
    ])

    const alertSettings = parseAlertSettings(settings?.alerts)
    const invoicePayments = alertSettings.invoicePayments ?? {}

    const now = new Date()
    const invoices: Array<{
      id: string
      cardId: string
      cardName: string
      referenceMonth: string
      referenceValue: string
      dueDate: Date
      totalAmount: number
      paidAmount: number
      status: 'open' | 'partial_paid' | 'paid'
      isMarkedPaid: boolean
      items: Array<{
        id: string
        type: 'expense' | 'installment'
        description: string
        amount: number
        date: Date
      }>
    }> = []

    for (const card of cards) {
      const [earliestExpense, earliestInstallment] = await Promise.all([
        prisma.expense.findFirst({
          where: { userId, creditCardId: card.id },
          orderBy: { date: 'asc' },
          select: { date: true }
        }),
        prisma.installment.findFirst({
          where: { creditCardId: card.id },
          orderBy: { dueDate: 'asc' },
          select: { dueDate: true }
        })
      ])

      const candidates = [earliestExpense?.date, earliestInstallment?.dueDate].filter((date): date is Date => !!date)
  if (candidates.length === 0) {
    continue
  }
  const earliestDate = new Date(Math.min(...candidates.map((date) => date.getTime())))
      const monthsDiff = Math.max(
        differenceInMonths(startOfMonth(now), startOfMonth(earliestDate)),
        0
      )
      const maxOffset = Math.min(monthsDiff, MAX_MONTHS_LOOKBACK)

      for (let offset = 0; offset <= maxOffset; offset++) {
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
            },
            include: {
              expense: {
                select: {
                  description: true,
                  installments: true
                }
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
        const referenceValue = format(reference, "yyyy-MM")
        const paymentKey = `${card.id}|${referenceValue}`
        const manualPayment = invoicePayments[paymentKey]
        const isMarkedPaid = !!manualPayment?.paid

        if (paidAmount >= totalAmount && totalAmount > 0) {
          status = 'paid'
        } else if (paidAmount > 0 && paidAmount < totalAmount) {
          status = 'partial_paid'
        } else if (dueDate < now && paidAmount === 0) {
          status = 'open'
        }

        if (isMarkedPaid) {
          status = 'paid'
        }

        const items = [
          ...expenses.map(exp => ({
            id: exp.id,
            type: 'expense' as const,
            description: exp.description,
            amount: new Decimal(exp.amount.toString()).toNumber(),
            date: exp.date
          })),
          ...installments.map(inst => ({
            id: inst.id,
            type: 'installment' as const,
            description: inst.expense?.description
              ? `${inst.expense.description} • Parcela ${inst.installmentNumber}/${inst.expense.installments}`
              : `Parcela ${inst.installmentNumber}`,
            amount: new Decimal(inst.amount.toString()).toNumber(),
            date: inst.dueDate
          }))
        ].sort((a, b) => a.date.getTime() - b.date.getTime())

        invoices.push({
          id: `${card.id}-${reference.getFullYear()}-${reference.getMonth() + 1}`,
          cardId: card.id,
          cardName: card.name,
          referenceMonth: formatMonthYear(reference),
          dueDate,
          referenceValue,
          totalAmount,
          paidAmount,
          status,
          isMarkedPaid,
          items,
        })
      }
    }

    // Ordenar por dueDate desc
    invoices.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())

    const payload = invoices.map((invoice) => ({
      ...invoice,
      items: invoice.items.map((item) => ({
        ...item,
        date: item.date.toISOString()
      }))
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar faturas' },
      { status: 500 }
    )
  }
}
