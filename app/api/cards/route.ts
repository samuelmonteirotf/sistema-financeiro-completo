import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { z } from 'zod'
import { checkLimit, recordUsage } from '@/lib/limits'
import { paymentRequired } from '@/lib/http'

export const cardSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  brand: z.string().trim().min(1, 'Bandeira é obrigatória'),
  lastFourDigits: z.string()
    .trim()
    .length(4, 'Informe os 4 últimos dígitos')
    .regex(/^\d{4}$/, 'Use apenas números'),
  closingDay: z.coerce.number().int().min(1).max(31),
  dueDay: z.coerce.number().int().min(1).max(31),
  limit: z.union([z.string(), z.number()])
    .transform((value) => {
      if (typeof value === 'number') {
        return value
      }

      let sanitized = value.replace(/\s/g, '').replace(/R\$/gi, '').replace(/\$/g, '')

      if (sanitized.includes(',') && sanitized.includes('.')) {
        sanitized = sanitized.replace(/\./g, '')
      }

      if (sanitized.includes(',') && !sanitized.includes('.')) {
        sanitized = sanitized.replace(',', '.')
      }

      sanitized = sanitized.replace(/[^0-9.-]/g, '')

      const parsed = Number.parseFloat(sanitized)
      return Number.isNaN(parsed) ? 0 : parsed
    })
    .refine(val => val > 0, 'Limite deve ser maior que zero')
})

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const cards = await prisma.creditCard.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cartões' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const limitCheck = await checkLimit(userId, 'cards')
    if (!limitCheck.ok) {
      return paymentRequired({
        resource: 'cards',
        requiredPlan: limitCheck.requiredPlan,
        used: limitCheck.used,
        limit: limitCheck.limit,
      })
    }

    const body = await request.json()
    const validated = cardSchema.parse(body)

    const card = await prisma.creditCard.create({
      data: {
        userId: userId,
        name: validated.name,
        lastFourDigits: validated.lastFourDigits,
        brand: validated.brand,
        closingDay: validated.closingDay,
        dueDay: validated.dueDay,
        limit: validated.limit,
        isActive: true,
      }
    })

    await recordUsage(
      limitCheck.subscriptionId,
      'cards',
      limitCheck.used + 1,
      limitCheck.limit,
      limitCheck.plan
    )

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cartão' },
      { status: 500 }
    )
  }
}
