export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Moradia",
  "Utilidades",
  "Vestuário",
  "Tecnologia",
  "Viagem",
  "Outro",
]

export const CREDIT_CARD_BRANDS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Discover"]

export const INVESTMENT_TYPES = ["Ação", "Fundo", "Criptomoeda", "Poupança", "Tesouro", "CDB", "LCI/LCA", "Outro"]

export const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
  month: "long",
  day: "numeric",
})
