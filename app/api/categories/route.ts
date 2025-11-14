import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { checkLimit, recordUsage } from '@/lib/limits'
import { paymentRequired } from '@/lib/http'
import { z } from 'zod'
import { ensureDefaultCategories } from '@/lib/default-categories'

const categorySchema = z.object({
  name: z.string().min(2),
  type: z.enum(['expense', 'income']).default('expense'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    await ensureDefaultCategories(userId)

    const categories = await prisma.category.findMany({
      where: { ownerId: userId },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const limitCheck = await checkLimit(userId, 'categories')
    if (!limitCheck.ok) {
      return paymentRequired({
        resource: 'categories',
        requiredPlan: limitCheck.requiredPlan,
        used: limitCheck.used,
        limit: limitCheck.limit,
      })
    }

    const body = await request.json()
    const payload = categorySchema.parse(body)

    const category = await prisma.category.create({
      data: {
        name: payload.name,
        type: payload.type,
        color: payload.color ?? '#3B82F6',
        icon: payload.icon ?? 'circle',
        ownerId: userId,
      },
    })

    await recordUsage(
      limitCheck.subscriptionId,
      'categories',
      limitCheck.used + 1,
      limitCheck.limit,
      limitCheck.plan
    )

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}
