import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

function formatMonthShort(date: Date) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
  return formatter.format(date).replace('.', '').slice(0, 3)
}

function formatMonthLong(date: Date) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
  const label = formatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const now = new Date()
    const months: Array<{ start: Date; end: Date }> = []

    for (let i = 5; i >= 0; i--) {
      const target = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(target.getFullYear(), target.getMonth(), 1)
      const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999)
      months.push({ start, end })
    }

    const rangeStart = months[0].start
    const rangeEnd = months[months.length - 1].end

    const [expenses, incomes, fixedExpenses] = await Promise.all([
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: rangeStart,
            lte: rangeEnd
          }
        },
        include: {
          category: true
        }
      }),
      prisma.income.findMany({
        where: {
          userId,
          date: {
            gte: rangeStart,
            lte: rangeEnd
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

    const monthlyData = months.map(({ start, end }) => {
      const monthExpenses = expenses.filter(exp => exp.date >= start && exp.date <= end)
      const monthIncomes = incomes.filter(inc => inc.date >= start && inc.date <= end)

      const variableExpensesTotal = monthExpenses.reduce((sum, exp) =>
        sum.plus(new Decimal(exp.amount.toString())), new Decimal(0))
      const fixedExpensesTotal = fixedExpenses.reduce((sum, exp) =>
        sum.plus(new Decimal(exp.amount.toString())), new Decimal(0))
      const incomesTotal = monthIncomes.reduce((sum, inc) =>
        sum.plus(new Decimal(inc.amount.toString())), new Decimal(0))
      const totalExpenses = variableExpensesTotal.plus(fixedExpensesTotal)
      const savings = incomesTotal.minus(totalExpenses)

      return {
        month: formatMonthShort(start),
        referenceDate: start,
        income: incomesTotal.toNumber(),
        expenses: totalExpenses.toNumber(),
        savings: savings.toNumber()
      }
    })

    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0)
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0)
    const averageMonthlySavings = monthlyData.reduce((sum, month) => sum + month.savings, 0) / monthlyData.length
    const averageExpense = totalExpenses / monthlyData.length

    const highestExpenseMonth = monthlyData.reduce((prev, current) =>
      current.expenses > prev.expenses ? current : prev
    )
    const lowestExpenseMonth = monthlyData.reduce((prev, current) =>
      current.expenses < prev.expenses ? current : prev
    )

    // Quebra por categoria (apenas mês atual)
    const currentPeriod = months[months.length - 1]
    const currentMonthExpenses = expenses.filter(exp => exp.date >= currentPeriod.start && exp.date <= currentPeriod.end)
    const categoryMap = new Map<string, Decimal>()

    currentMonthExpenses.forEach(exp => {
      const name = exp.category?.name || 'Outros'
      const current = categoryMap.get(name) || new Decimal(0)
      categoryMap.set(name, current.plus(new Decimal(exp.amount.toString())))
    })

    // Somar despesas fixas por categoria (considerando valores recorrentes)
    fixedExpenses.forEach(exp => {
      const name = exp.category || 'Despesas Fixas'
      const current = categoryMap.get(name) || new Decimal(0)
      categoryMap.set(name, current.plus(new Decimal(exp.amount.toString())))
    })

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: value.toNumber()
      }))
      .sort((a, b) => b.value - a.value)

    const response = {
      monthly: monthlyData.map(({ referenceDate, ...rest }) => rest),
      categories: categoryData,
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        averageMonthlySavings: Number(averageMonthlySavings.toFixed(2)),
        averageExpense: Number(averageExpense.toFixed(2)),
        highestExpenseMonth: formatMonthLong(highestExpenseMonth.referenceDate),
        lowestExpenseMonth: formatMonthLong(lowestExpenseMonth.referenceDate)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating report summary:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}
