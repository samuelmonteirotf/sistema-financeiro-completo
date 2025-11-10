import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const [cards, expenses, incomes, fixedExpenses] = await Promise.all([
      prisma.creditCard.findMany({
        where: { userId, isActive: true },
        orderBy: { name: 'asc' }
      }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          amount: true,
          creditCardId: true
        }
      }),
      prisma.income.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      prisma.fixedExpense.findMany({
        where: {
          userId,
          isActive: true
        }
      })
    ])

    const alerts: Array<{
      id: string
      type: 'warning' | 'danger' | 'info' | 'success'
      title: string
      message: string
      date: Date
      read: boolean
    }> = []

    const expensesTotal = expenses.reduce((sum, item) =>
      sum.plus(new Decimal(item.amount.toString())), new Decimal(0))
    const incomesTotal = incomes.reduce((sum, item) =>
      sum.plus(new Decimal(item.amount.toString())), new Decimal(0))

    const expensesByCard = expenses.reduce<Record<string, Decimal>>((acc, exp) => {
      if (!exp.creditCardId) return acc
      const currentAmount = acc[exp.creditCardId] || new Decimal(0)
      acc[exp.creditCardId] = currentAmount.plus(new Decimal(exp.amount.toString()))
      return acc
    }, {})

    // Alertas de limite de cartão
    cards.forEach((card) => {
      const cardExpenses = expensesByCard[card.id] || new Decimal(0)
      const cardLimit = new Decimal(card.limit.toString())
      if (cardLimit.lte(0)) {
        return
      }

      const usagePercent = cardExpenses.dividedBy(cardLimit).times(100).toNumber()
      if (usagePercent >= 80) {
        alerts.push({
          id: `credit-limit-${card.id}`,
          type: usagePercent >= 95 ? 'danger' : 'warning',
          title: 'Limite de crédito em uso',
          message: `Você utilizou ${usagePercent.toFixed(0)}% do limite do cartão ${card.name}`,
          date: now,
          read: false
        })
      }
    })

    // Alertas de vencimento de fatura
    cards.forEach((card) => {
      let dueDate = new Date(now.getFullYear(), now.getMonth(), card.dueDay)
      if (dueDate < now) {
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, card.dueDay)
      }

      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / MS_PER_DAY)
      if (diffDays >= 0 && diffDays <= 3) {
        alerts.push({
          id: `invoice-due-${card.id}`,
          type: diffDays <= 1 ? 'warning' : 'info',
          title: 'Fatura próxima do vencimento',
          message: `A fatura do cartão ${card.name} vence em ${diffDays === 0 ? 'hoje' : `${diffDays} dia(s)`}`,
          date: dueDate,
          read: false
        })
      }
    })

    // Alertas de despesas fixas
    fixedExpenses.forEach((expense) => {
      let dueDate = new Date(now.getFullYear(), now.getMonth(), expense.dueDay)
      if (dueDate < now) {
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, expense.dueDay)
      }

      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / MS_PER_DAY)
      if (diffDays >= 0 && diffDays <= 5) {
        alerts.push({
          id: `fixed-expense-${expense.id}`,
          type: diffDays <= 2 ? 'warning' : 'info',
          title: 'Despesa fixa a vencer',
          message: `${expense.description} vence em ${diffDays === 0 ? 'hoje' : `${diffDays} dia(s)`}`,
          date: dueDate,
          read: false
        })
      }
    })

    // Alerta de orçamento extrapolado
    if (incomesTotal.gt(0) && expensesTotal.gt(incomesTotal)) {
      const percentage = expensesTotal.minus(incomesTotal)
        .dividedBy(incomesTotal)
        .times(100)
        .toNumber()
      alerts.push({
        id: 'budget-overrun',
        type: 'danger',
        title: 'Gastos acima da receita',
        message: `Suas despesas deste mês excederam as receitas em ${percentage.toFixed(1)}%`,
        date: now,
        read: false
      })
    }

    // Alerta quando não há receitas mas existem despesas
    if (incomesTotal.eq(0) && expensesTotal.gt(0)) {
      alerts.push({
        id: 'missing-income',
        type: 'warning',
        title: 'Sem receitas registradas',
        message: 'Ainda não há receitas cadastradas neste mês, mas despesas foram encontradas.',
        date: now,
        read: false
      })
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar alertas' },
      { status: 500 }
    )
  }
}
