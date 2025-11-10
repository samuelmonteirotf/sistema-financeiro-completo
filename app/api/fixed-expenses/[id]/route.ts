import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

const fixedExpenseUpdateSchema = z.object({
  description: z.string().trim().min(1, 'Descrição é obrigatória').optional(),
  amount: z.union([z.string(), z.number()])
    .transform((value) => {
      if (typeof value === 'number') {
        return value
      }
      const cleaned = value.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(cleaned)
      return Number.isNaN(parsed) ? 0 : parsed
    })
    .refine(val => val > 0, 'Valor deve ser maior que zero')
    .optional(),
  category: z.string().trim().min(1, 'Categoria é obrigatória').optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  isActive: z.coerce.boolean().optional()
})

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    const fixedExpense = await prisma.fixedExpense.findFirst({
      where: {
        id,
        userId
      },
    })

    if (!fixedExpense) {
      return NextResponse.json({ error: 'Despesa fixa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(fixedExpense)
  } catch (error) {
    console.error('Erro ao buscar despesa fixa:', error)
    return NextResponse.json({ error: 'Erro ao buscar despesa fixa' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    const existing = await prisma.fixedExpense.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Despesa fixa não encontrada' }, { status: 404 })
    }

    const payload = await request.json()
    const validated = fixedExpenseUpdateSchema.parse(payload)

    const updated = await prisma.fixedExpense.update({
      where: { id: existing.id },
      data: {
        description: validated.description ?? existing.description,
        amount: validated.amount ?? existing.amount,
        category: validated.category ?? existing.category,
        dueDay: validated.dueDay ?? existing.dueDay,
        frequency: validated.frequency ?? existing.frequency,
        isActive: validated.isActive ?? existing.isActive
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error updating fixed expense:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar despesa fixa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    const existing = await prisma.fixedExpense.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Despesa fixa não encontrada' }, { status: 404 })
    }

    await prisma.fixedExpense.delete({
      where: { id: existing.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fixed expense:', error)
    return NextResponse.json(
      { error: 'Erro ao remover despesa fixa' },
      { status: 500 }
    )
  }
}
