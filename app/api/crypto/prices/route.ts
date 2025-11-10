import { NextResponse } from 'next/server'

// Cache simples em memória (válido por 10 segundos)
interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 10000 // 10 segundos

// Taxa de câmbio USD/BRL (atualizada a cada minuto)
let usdBrlRate = 5.0 // Fallback
let usdBrlTimestamp = 0
const USD_BRL_CACHE_DURATION = 60000 // 1 minuto

async function getUsdBrlRate(): Promise<number> {
  const now = Date.now()

  // Usar cache se válido
  if (now - usdBrlTimestamp < USD_BRL_CACHE_DURATION) {
    return usdBrlRate
  }

  try {
    // Buscar taxa de câmbio da API pública
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

    if (response.ok) {
      const data = await response.json()
      usdBrlRate = data.rates.BRL || 5.0
      usdBrlTimestamp = now
    }
  } catch (error) {
    console.error('Erro ao buscar taxa USD/BRL:', error)
    // Manter taxa anterior em caso de erro
  }

  return usdBrlRate
}

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
    const cacheKey = symbols

    // Verificar cache
    const cached = cache.get(cacheKey)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        cacheAge: Math.floor((now - cached.timestamp) / 1000)
      })
    }

    // Buscar preços da Binance
    const binanceUrl = `https://data-api.binance.vision/api/v3/ticker/price?symbols=${JSON.stringify(symbolList)}`

    const response = await fetch(binanceUrl, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const binanceData = await response.json()

    // Buscar taxa de câmbio USD/BRL
    const usdBrl = await getUsdBrlRate()

    // Processar dados
    const prices = Array.isArray(binanceData) ? binanceData : [binanceData]

    const formattedPrices = prices.map((item: any) => {
      const priceUsd = parseFloat(item.price)
      const priceBrl = priceUsd * usdBrl

      return {
        symbol: item.symbol,
        priceUsd: priceUsd,
        priceBrl: priceBrl,
        priceUsdFormatted: `$${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
        priceBrlFormatted: `R$ ${priceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    })

    const result = {
      prices: formattedPrices,
      usdBrlRate: usdBrl,
      timestamp: now,
      cached: false
    }

    // Salvar no cache
    cache.set(cacheKey, {
      data: result,
      timestamp: now
    })

    // Limpar cache antigo (mais de 1 minuto)
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > 60000) {
        cache.delete(key)
      }
    }

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
      // Buscar informações de exchange da Binance
      const response = await fetch('https://data-api.binance.vision/api/v3/exchangeInfo')

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`)
      }

      const data = await response.json()

      // Filtrar apenas pares com USDT
      const usdtPairs = data.symbols
        .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .map((s: any) => ({
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset
        }))
        .sort((a: any, b: any) => a.baseAsset.localeCompare(b.baseAsset))

      return NextResponse.json({
        symbols: usdtPairs,
        count: usdtPairs.length
      })
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
