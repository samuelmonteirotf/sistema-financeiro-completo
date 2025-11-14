import { NextResponse } from 'next/server'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const maybeUser = await getUserIdOrUnauthorized()
    if (maybeUser instanceof NextResponse) {
      return maybeUser
    }
    const userId = maybeUser

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.stripeId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 404 }
      )
    }

    if (process.env.STRIPE_MOCK === 'true') {
      return NextResponse.json({
        url:
          process.env.STRIPE_SUCCESS_URL ||
          'http://localhost:3000/dashboard/billing?mockPortal=true',
      })
    }

    const stripeClient = getStripe()

    const session = await stripeClient.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url:
        process.env.STRIPE_SUCCESS_URL ||
        'http://localhost:3000/dashboard/billing',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar portal session:', error)
    return NextResponse.json(
      { error: 'Erro ao abrir portal de cobrança' },
      { status: 500 }
    )
  }
}
