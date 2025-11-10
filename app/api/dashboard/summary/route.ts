import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    // Calcular total de despesas do mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const totalExpenses = expenses.reduce((sum, exp) => {
      return sum.plus(new Decimal(exp.amount.toString()))
    }, new Decimal(0))

    // Calcular total de receitas do mês
    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const totalIncome = incomes.reduce((sum, income) => {
      return sum.plus(new Decimal(income.amount.toString()))
    }, new Decimal(0))

    // Calcular total de despesas fixas
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: {
        userId,
        isActive: true
      }
    })

    const totalFixed = fixedExpenses.reduce((sum, exp) => {
      return sum.plus(new Decimal(exp.amount.toString()))
    }, new Decimal(0))

    // Calcular dívidas (empréstimos)
    const loans = await prisma.loan.findMany({
      where: {
        userId,
        status: 'active'
      }
    })

    const totalDebt = loans.reduce((sum, loan) => {
      return sum.plus(new Decimal(loan.currentBalance.toString()))
    }, new Decimal(0))

    // Pegar crédito disponível dos cartões
    const cards = await prisma.creditCard.findMany({
      where: {
        userId,
        isActive: true
      }
    })

    const totalCredit = cards.reduce((sum, card) => {
      return sum.plus(new Decimal(card.limit.toString()))
    }, new Decimal(0))

    // Calcular crédito utilizado (despesas não pagas do mês)
    const usedCredit = totalExpenses
    const totalExpensesWithFixed = totalExpenses.plus(totalFixed)
    const availableCreditDecimal = totalCredit.minus(usedCredit)
    const availableCredit = availableCreditDecimal.gt(0)
      ? availableCreditDecimal.toNumber()
      : 0

    return NextResponse.json({
      totalIncome: totalIncome.toNumber(),
      totalExpenses: totalExpensesWithFixed.toNumber(),
      totalDebt: totalDebt.toNumber(),
      availableCredit,
      monthlyExpenses: totalExpenses.toNumber(),
      fixedExpenses: totalFixed.toNumber(),
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar resumo' },
      { status: 500 }
    )
  }
}
