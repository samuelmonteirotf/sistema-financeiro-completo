import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const { searchParams } = new URL(request.url)
    const includeRoi = searchParams.get('includeRoi') === 'true'
    const updateCrypto = searchParams.get('updateCrypto') === 'true'

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Se solicitado, calcular ROI
    if (includeRoi) {
      const enrichedInvestments = investments.map(inv => {
        const invested = new Decimal(inv.amount.toString())
          .times(new Decimal(inv.purchasePrice.toString()))
        const current = new Decimal(inv.currentValue.toString())
        const profit = current.minus(invested)
        const roiPercent = invested.gt(0)
          ? profit.dividedBy(invested).times(100)
          : new Decimal(0)

        return {
          ...inv,
          investedValue: invested.toNumber(),
          profit: profit.toNumber(),
          profitPercent: roiPercent.toNumber(),
          isPositive: profit.gte(0)
        }
      })

      return NextResponse.json(enrichedInvestments)
    }

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar investimentos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    const body = await request.json()
    const {
      name,
      type,
      amount,
      purchasePrice,
      purchaseDate
    } = body

    // Validações básicas
    if (!name || !type || !amount || !purchasePrice || !purchaseDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, type, amount, purchasePrice, purchaseDate' },
        { status: 400 }
      )
    }

    // Para crypto, currentValue = amount * preço atual
    // Para outros, currentValue = amount * purchasePrice (inicial)
    let currentValue = amount * purchasePrice

    // Se for crypto, buscar preço atual
    if (type === 'crypto') {
      try {
        const symbol = `${name.toUpperCase()}USDT`
        const priceResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/crypto/prices?symbols=${symbol}`
        )

        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          if (priceData.prices && priceData.prices.length > 0) {
            currentValue = amount * priceData.prices[0].priceBrl
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar preço atual, usando purchasePrice:', error)
      }
    }

    const investment = await prisma.investment.create({
      data: {
        userId,
        name,
        type,
        amount: parseFloat(amount),
        purchasePrice: parseFloat(purchasePrice),
        currentValue,
        purchaseDate: new Date(purchaseDate),
        status: 'active'
      }
    })

    return NextResponse.json(investment, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar investimento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar investimento', message: error.message },
      { status: 500 }
    )
  }
}
