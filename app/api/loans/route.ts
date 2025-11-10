import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET() {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar empréstimos' },
      { status: 500 }
    )
  }
}
