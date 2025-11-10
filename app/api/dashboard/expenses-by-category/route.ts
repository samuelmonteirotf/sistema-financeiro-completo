import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    // Pegar despesas do mês atual
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
      },
      include: {
        category: true
      }
    })

    // Agrupar por categoria
    const categoryMap = new Map<string, Decimal>()

    expenses.forEach(expense => {
      const categoryName = expense.category.name
      const currentAmount = categoryMap.get(categoryName) || new Decimal(0)
      categoryMap.set(categoryName, currentAmount.plus(new Decimal(expense.amount.toString())))
    })

    // Calcular total para percentuais
    const total = Array.from(categoryMap.values()).reduce(
      (sum, amount) => sum.plus(amount),
      new Decimal(0)
    )

    // Formatar resultado
    const result = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount: amount.toNumber(),
      percentage: total.gt(0) ? amount.dividedBy(total).times(100).toDecimalPlaces(1).toNumber() : 0
    }))

    // Ordenar por valor decrescente
    result.sort((a, b) => b.amount - a.amount)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching expenses by category:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar despesas por categoria' },
      { status: 500 }
    )
  }
}
