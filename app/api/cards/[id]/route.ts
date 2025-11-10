import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cardSchema } from '../route'
import { z } from 'zod'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

const cardUpdateSchema = cardSchema.extend({
  isActive: z.coerce.boolean().optional()
})

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { id } = await context.params

    const existing = await prisma.creditCard.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 })
    }

    const payload = await request.json()
    const validated = cardUpdateSchema.parse(payload)

    const updated = await prisma.creditCard.update({
      where: { id: existing.id },
      data: {
        name: validated.name,
        brand: validated.brand,
        lastFourDigits: validated.lastFourDigits,
        closingDay: validated.closingDay,
        dueDay: validated.dueDay,
        limit: validated.limit,
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

    console.error('Error updating card:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cartão' },
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

    const existing = await prisma.creditCard.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 })
    }

    await prisma.creditCard.delete({
      where: { id: existing.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json(
      { error: 'Erro ao remover cartão' },
      { status: 500 }
    )
  }
}
