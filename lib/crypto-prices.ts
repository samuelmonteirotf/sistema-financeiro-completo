const PRICE_CACHE_DURATION = 10000 // 10s
const USD_BRL_CACHE_DURATION = 60000 // 1 min

type CacheEntry<T> = {
  data: T
  timestamp: number
}

type PriceEntry = {
  symbol: string
  priceUsd: number
  priceBrl: number
  priceUsdFormatted: string
  priceBrlFormatted: string
}

type PriceResult = {
  prices: PriceEntry[]
  usdBrlRate: number
  timestamp: number
  cached: boolean
}

const priceCache = new Map<string, CacheEntry<PriceResult>>()
let usdBrlRate = 5
let usdBrlTimestamp = 0

async function getUsdBrlRate(): Promise<number> {
  const now = Date.now()
  if (now - usdBrlTimestamp < USD_BRL_CACHE_DURATION) {
    return usdBrlRate
  }

  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
    if (response.ok) {
      const data = await response.json()
      usdBrlRate = data.rates?.BRL ?? usdBrlRate
      usdBrlTimestamp = now
    }
  } catch (error) {
    console.error("Erro ao buscar taxa USD/BRL:", error)
  }

  return usdBrlRate
}

function sanitizeSymbols(symbols: string[]): string[] {
  return symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
}

export async function fetchCryptoPrices(
  symbols: string[],
  { useCache = true }: { useCache?: boolean } = {}
): Promise<PriceResult> {
  const sanitizedSymbols = sanitizeSymbols(symbols)
  if (sanitizedSymbols.length === 0) {
    throw new Error("Nenhum símbolo válido informado")
  }

  const cacheKey = sanitizedSymbols.join(",")
  const now = Date.now()

  if (useCache) {
    const cached = priceCache.get(cacheKey)
    if (cached && now - cached.timestamp < PRICE_CACHE_DURATION) {
      return cached.data
    }
  }

  const binanceUrl = `https://data-api.binance.vision/api/v3/ticker/price?symbols=${encodeURIComponent(
    JSON.stringify(sanitizedSymbols)
  )}`

  const response = await fetch(binanceUrl, { headers: { Accept: "application/json" } })

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`)
  }

  const rawData = await response.json()
  const usdBrl = await getUsdBrlRate()

  const pricesArray = Array.isArray(rawData) ? rawData : [rawData]
  const formattedPrices: PriceEntry[] = pricesArray.map((item: any) => {
    const priceUsd = Number(item.price)
    const priceBrl = priceUsd * usdBrl
    return {
      symbol: item.symbol,
      priceUsd,
      priceBrl,
      priceUsdFormatted: `$${priceUsd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      })}`,
      priceBrlFormatted: `R$ ${priceBrl.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    }
  })

  const result: PriceResult = {
    prices: formattedPrices,
    usdBrlRate,
    timestamp: now,
    cached: false,
  }

  if (useCache) {
    priceCache.set(cacheKey, { data: result, timestamp: now })
  }

  return result
}

export async function listBinanceSymbols() {
  const response = await fetch("https://data-api.binance.vision/api/v3/exchangeInfo")

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`)
  }

  const data = await response.json()
  const usdtPairs = (data.symbols ?? [])
    .filter((s: any) => s.quoteAsset === "USDT" && s.status === "TRADING")
    .map((s: any) => ({
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
    }))
    .sort((a: any, b: any) => a.baseAsset.localeCompare(b.baseAsset))

  return {
    symbols: usdtPairs,
    count: usdtPairs.length,
  }
}
