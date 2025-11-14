import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { fetchCryptoPrices } from '@/lib/crypto-prices'

export async function POST(request: Request) {
  try {
    const userId = await getUserIdOrUnauthorized()
    if (userId instanceof NextResponse) return userId

    // Buscar investimentos de crypto ativos
    const cryptoInvestments = await prisma.investment.findMany({
      where: {
        userId,
        type: 'crypto',
        status: 'active'
      }
    })

    if (cryptoInvestments.length === 0) {
      return NextResponse.json({
        message: 'Nenhum investimento em crypto encontrado',
        updated: 0
      })
    }

    // Extrair símbolos únicos (assumindo que name é o símbolo, ex: "BTC", "ETH")
    const symbols = [...new Set(cryptoInvestments.map(inv => `${inv.name}USDT`))]

    // Buscar preços atuais diretamente da Binance
    const pricesData = await fetchCryptoPrices(symbols, { useCache: false })
    const priceMap = new Map(
      pricesData.prices.map((p: any) => [p.symbol, p.priceBrl])
    )

    // Atualizar cada investimento
    const updates = []

    for (const investment of cryptoInvestments) {
      const symbol = `${investment.name}USDT`
      const currentPriceBrl = priceMap.get(symbol)

      if (currentPriceBrl !== undefined && currentPriceBrl !== null) {
        // Calcular valor atual baseado na quantidade
        const quantity = new Decimal(investment.amount.toString())
        const priceBrl = new Decimal(currentPriceBrl.toString())
        const currentValue = quantity.times(priceBrl)

        // Atualizar no banco
        const updated = await prisma.investment.update({
          where: { id: investment.id },
          data: {
            currentValue: currentValue.toNumber(),
          }
        })

        updates.push({
          id: updated.id,
          name: updated.name,
          quantity: quantity.toNumber(),
          currentPrice: priceBrl.toNumber(),
          currentValue: currentValue.toNumber(),
          purchaseValue: new Decimal(investment.amount.toString())
            .times(new Decimal(investment.purchasePrice.toString()))
            .toNumber()
        })
      }
    }

    return NextResponse.json({
      message: 'Investimentos atualizados com sucesso',
      updated: updates.length,
      investments: updates,
      usdBrlRate: pricesData.usdBrlRate,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erro ao atualizar investimentos:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar investimentos', message: error.message },
      { status: 500 }
    )
  }
}
