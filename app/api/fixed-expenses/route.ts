import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { z } from 'zod'

const fixedExpenseSchema = z.object({
  description: z.string().trim().min(1, 'Descrição é obrigatória'),
  amount: z.union([z.string(), z.number()])
    .transform((value) => {
      if (typeof value === 'number') {
        return value
      }

      const cleaned = value.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(cleaned)
      return Number.isNaN(parsed) ? 0 : parsed
    })
    .refine(val => val > 0, 'Valor deve ser maior que zero'),
  category: z.string().trim().min(1, 'Categoria é obrigatória'),
  dueDay: z.coerce.number().int().min(1).max(31),
  frequency: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
  isActive: z.coerce.boolean().optional().default(true)
})

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const expenses = await prisma.fixedExpense.findMany({
      where: { userId: userId },
      orderBy: [
        { isActive: 'desc' },
        { dueDay: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching fixed expenses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar despesas fixas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const payload = await request.json()
    const validated = fixedExpenseSchema.parse(payload)

    const expense = await prisma.fixedExpense.create({
      data: {
        userId: userId,
        description: validated.description,
        amount: validated.amount,
        category: validated.category,
        dueDay: validated.dueDay,
        frequency: validated.frequency,
        isActive: validated.isActive
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating fixed expense:', error)
    return NextResponse.json(
      { error: 'Erro ao criar despesa fixa' },
      { status: 500 }
    )
  }
}
