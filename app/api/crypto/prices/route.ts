import { NextResponse } from 'next/server'
import { fetchCryptoPrices, listBinanceSymbols } from '@/lib/crypto-prices'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols') // Ex: "BTCUSDT,ETHUSDT"

    if (!symbols) {
      return NextResponse.json(
        { error: 'Parâmetro symbols é obrigatório' },
        { status: 400 }
      )
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase())
    const result = await fetchCryptoPrices(symbolList, { useCache: true })
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Erro ao buscar preços de crypto:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar preços',
        message: error.message
      },
      { status: 500 }
    )
  }
}

// Endpoint para buscar todas as moedas disponíveis na Binance
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'list-symbols') {
      const data = await listBinanceSymbols()
      return NextResponse.json(data)
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Erro ao listar símbolos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar símbolos', message: error.message },
      { status: 500 }
    )
  }
}
