import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    const where: any = {
      userId,
      installments: {
        gt: 1
      }
    }

    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam)
      const endDate = new Date(endDateParam)

      where.installmentDetails = {
        some: {
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        creditCard: true,
        installmentDetails: {
          orderBy: {
            installmentNumber: 'asc'
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    const summaries = expenses.map((expense) => {
      const totalInstallments = expense.installments
      const paidInstallments = expense.installmentDetails.filter((inst) => inst.isPaid)
      const paidCount = paidInstallments.length
      const remainingCount = Math.max(totalInstallments - paidCount, 0)
      const nextInstallment =
        expense.installmentDetails.find((inst) => !inst.isPaid) ??
        expense.installmentDetails[expense.installmentDetails.length - 1] ??
        null

      return {
        id: expense.id,
        description: expense.description,
        category: expense.category?.name ?? 'Outros',
        cardName: expense.creditCard?.name ?? null,
        totalAmount: expense.amount,
        totalInstallments,
        paidCount,
        remainingCount,
        nextInstallmentNumber: nextInstallment?.installmentNumber ?? totalInstallments,
        nextDueDate: nextInstallment?.dueDate ?? null,
        installmentValue: nextInstallment?.amount ?? new Decimal(expense.amount.toString()).dividedBy(totalInstallments).toNumber(),
        isCompleted: remainingCount === 0
      }
    })

    summaries.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }

      if (!a.nextDueDate) return 1
      if (!b.nextDueDate) return -1
      return a.nextDueDate.getTime() - b.nextDueDate.getTime()
    })

    const payload = summaries.map((item) => ({
      ...item,
      nextDueDate: item.nextDueDate ? item.nextDueDate.toISOString() : null
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching installments:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar parcelamentos' },
      { status: 500 }
    )
  }
}
