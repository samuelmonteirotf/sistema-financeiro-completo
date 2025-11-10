"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface CryptoPrice {
  symbol: string
  priceUsd: number
  priceBrl: number
  priceUsdFormatted: string
  priceBrlFormatted: string
}

interface CryptoPriceTrackerProps {
  symbols: string[] // Ex: ["BTCUSDT", "ETHUSDT"]
  autoUpdate?: boolean
  updateInterval?: number // em milissegundos (padrão: 15000 = 15 segundos)
}

export function CryptoPriceTracker({
  symbols,
  autoUpdate = true,
  updateInterval = 15000
}: CryptoPriceTrackerProps) {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [usdBrlRate, setUsdBrlRate] = useState<number>(5.0)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/crypto/prices?symbols=${symbols.join(',')}`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar preços')
      }

      const data = await response.json()
      setPrices(data.prices)
      setUsdBrlRate(data.usdBrlRate)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('Erro ao buscar preços:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [symbols])

  // Atualização automática
  useEffect(() => {
    // Buscar imediatamente
    void fetchPrices()

    // Configurar intervalo de atualização
    if (autoUpdate && updateInterval > 0) {
      const interval = setInterval(() => {
        void fetchPrices()
      }, updateInterval)

      return () => clearInterval(interval)
    }
  }, [fetchPrices, autoUpdate, updateInterval])

  const getSymbolName = (symbol: string) => {
    return symbol.replace('USDT', '')
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Nunca'

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 10) return 'Agora'
    if (seconds < 60) return `${seconds}s atrás`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}min atrás`

    const hours = Math.floor(minutes / 60)
    return `${hours}h atrás`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cotações de Criptomoedas</CardTitle>
            <CardDescription>
              Atualização em tempo real via Binance
              {lastUpdate && ` • ${formatTimeAgo(lastUpdate)}`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void fetchPrices()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {prices.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma cotação disponível
            </p>
          )}

          {prices.map((price) => (
            <div
              key={price.symbol}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getSymbolName(price.symbol).slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold">{getSymbolName(price.symbol)}</h4>
                  <p className="text-sm text-muted-foreground">{price.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="font-semibold">{price.priceUsdFormatted}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {price.priceBrlFormatted}
                </p>
              </div>
            </div>
          ))}
        </div>

        {usdBrlRate && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground text-center">
            Taxa de câmbio: US$ 1,00 = R$ {usdBrlRate.toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
