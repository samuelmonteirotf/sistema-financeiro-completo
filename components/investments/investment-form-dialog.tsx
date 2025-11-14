"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { INVESTMENT_TYPES } from "@/lib/constants"
import { PlusCircle, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InvestmentFormDialogProps {
  onSuccess?: () => void
}

export function InvestmentFormDialog({ onSuccess }: InvestmentFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingSymbols, setIsSearchingSymbols] = useState(false)
  const [cryptoSymbols, setCryptoSymbols] = useState<string[]>([])
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    amount: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  })

  const isCrypto = formData.type === "Criptomoeda"

  // Buscar símbolos de criptomoedas disponíveis na Binance
  useEffect(() => {
    if (isCrypto && cryptoSymbols.length === 0) {
      fetchCryptoSymbols()
    }
  }, [isCrypto])

  const fetchCryptoSymbols = async () => {
    setIsSearchingSymbols(true)
    try {
      const response = await fetch("/api/crypto/prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "list-symbols" }),
      })

      if (response.ok) {
        const data = await response.json()
        // Extrair símbolo base (ex: BTC de BTCUSDT)
        const symbols = (data.symbols ?? [])
          .map((s: any) => {
            if (typeof s === "string") {
              return s.replace("USDT", "")
            }
            return s.baseAsset ?? s.symbol?.replace("USDT", "")
          })
          .filter(Boolean)
          .sort()
        setCryptoSymbols(symbols)
      }
    } catch (error) {
      console.error("Erro ao buscar símbolos:", error)
    } finally {
      setIsSearchingSymbols(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações
      if (!formData.name || !formData.type || !formData.amount || !formData.purchasePrice || !formData.purchaseDate) {
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Para crypto, usar o símbolo selecionado sem USDT
      const payload = {
        ...formData,
        type: isCrypto ? "crypto" : formData.type,
        amount: parseFloat(formData.amount),
        purchasePrice: parseFloat(formData.purchasePrice),
      }

      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar investimento")
      }

      toast({
        title: "Sucesso!",
        description: "Investimento criado com sucesso",
      })

      // Reset form
      setFormData({
        name: "",
        type: "",
        amount: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      })

      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Erro ao criar investimento:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o investimento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Investimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Adicionar Investimento</DialogTitle>
          <DialogDescription>
            Preencha os dados do seu investimento. Para criptomoedas, os valores serão atualizados automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tipo de Investimento */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Investimento *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value, name: "" })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome/Símbolo */}
            {isCrypto ? (
              <div className="grid gap-2">
                <Label htmlFor="name">Criptomoeda *</Label>
                {isSearchingSymbols ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Carregando símbolos...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={formData.name}
                    onValueChange={(value) =>
                      setFormData({ ...formData, name: value })
                    }
                  >
                    <SelectTrigger id="name">
                      <SelectValue placeholder="Selecione a criptomoeda" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {cryptoSymbols.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Investimento *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Tesouro Selic 2030"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            )}

            {/* Quantidade */}
            <div className="grid gap-2">
              <Label htmlFor="amount">
                {isCrypto ? "Quantidade de Moedas" : "Quantidade"} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>

            {/* Preço de Compra */}
            <div className="grid gap-2">
              <Label htmlFor="purchasePrice">
                {isCrypto ? "Preço de Compra (R$ por moeda)" : "Preço de Compra (R$)"} *
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
              />
            </div>

            {/* Data de Compra */}
            <div className="grid gap-2">
              <Label htmlFor="purchaseDate">Data de Compra *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar Investimento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
