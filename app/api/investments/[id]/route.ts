import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Obter userId da sessão JWT (stateless)
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    // Await params (Next.js 16)
    const { id } = await context.params

    const investment = await prisma.investment.findFirst({
      where: {
        id: id,
        userId: userId, // ✅ Usar userId da sessão
      },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investimento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Erro ao buscar investimento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar investimento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Obter userId da sessão JWT (stateless)
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    // Await params (Next.js 16)
    const { id } = await context.params

    // Verificar se o investimento existe e pertence ao usuário
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id: id,
        userId: userId, // ✅ Usar userId da sessão
      },
    })

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investimento não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      type,
      amount,
      purchasePrice,
      purchaseDate,
      status,
    } = body

    // Atualizar campos fornecidos
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice)
    if (purchaseDate !== undefined) updateData.purchaseDate = new Date(purchaseDate)
    if (status !== undefined) updateData.status = status

    // Se for crypto e algum valor mudou, atualizar currentValue
    if (type === 'crypto' || existingInvestment.type === 'crypto') {
      // Converter para number (existingInvestment.amount é Decimal do Prisma)
      const finalAmount = amount !== undefined
        ? parseFloat(amount)
        : parseFloat(existingInvestment.amount.toString())
      const cryptoName = name || existingInvestment.name

      try {
        const symbol = `${cryptoName.toUpperCase()}USDT`
        const priceResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/crypto/prices?symbols=${symbol}`
        )

        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          if (priceData.prices && priceData.prices.length > 0) {
            // Converter Decimal para number antes de multiplicar
            const priceBrl = typeof priceData.prices[0].priceBrl === 'number'
              ? priceData.prices[0].priceBrl
              : parseFloat(priceData.prices[0].priceBrl.toString())
            updateData.currentValue = finalAmount * priceBrl
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar preço atual:', error)
      }
    }

    const updatedInvestment = await prisma.investment.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json(updatedInvestment)
  } catch (error: any) {
    console.error('Erro ao atualizar investimento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar investimento', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Obter userId da sessão JWT (stateless)
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    // Await params (Next.js 16)
    const { id } = await context.params

    // Verificar se o investimento existe e pertence ao usuário
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id: id,
        userId: userId, // ✅ Usar userId da sessão
      },
    })

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investimento não encontrado' }, { status: 404 })
    }

    await prisma.investment.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Investimento excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir investimento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir investimento', message: error.message },
      { status: 500 }
    )
  }
}
