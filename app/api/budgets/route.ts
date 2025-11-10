import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')

    const currentDate = new Date()
    const month = monthParam ? Number.parseInt(monthParam, 10) : currentDate.getMonth() + 1
    const year = yearParam ? Number.parseInt(yearParam, 10) : currentDate.getFullYear()

    // Buscar budgets definidos para o mês/ano
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
        isActive: true,
      },
      include: {
        category: true,
      },
    })

    // Buscar despesas do mês para comparar com budget
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    // Agrupar despesas por categoria
    const expensesByCategory: Record<string, Decimal> = {}
    for (const expense of expenses) {
      const categoryName = expense.category.name
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = new Decimal(0)
      }
      expensesByCategory[categoryName] = expensesByCategory[categoryName].plus(
        new Decimal(expense.amount.toString())
      )
    }

    // Formatar resposta
    const budgetData = budgets.map((budget) => {
      const categoryName = budget.category.name
      const allocated = new Decimal(budget.amount.toString())
      const spent = expensesByCategory[categoryName] || new Decimal(0)
      const remaining = allocated.minus(spent)

      return {
        id: budget.id,
        category: categoryName,
        categoryColor: budget.category.color,
        allocated: allocated.toNumber(),
        spent: spent.toNumber(),
        remaining: remaining.toNumber(),
        percentage: allocated.gt(0) ? spent.dividedBy(allocated).times(100).toNumber() : 0,
      }
    })

    return NextResponse.json(budgetData)
  } catch (error) {
    console.error('Erro ao buscar budgets:', error)
    return NextResponse.json({ error: 'Erro ao buscar budgets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const body = await request.json()
    const { categoryId, amount, month, year } = body

    if (!categoryId || !amount || !month || !year) {
      return NextResponse.json(
        { error: 'categoryId, amount, month e year são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe budget para esta categoria/mês/ano
    const existing = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
    })

    if (existing) {
      // Atualizar existente
      const updated = await prisma.budget.update({
        where: { id: existing.id },
        data: { amount },
      })
      return NextResponse.json(updated)
    }

    // Criar novo
    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        month,
        year,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar/atualizar budget:', error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar budget' }, { status: 500 })
  }
}
