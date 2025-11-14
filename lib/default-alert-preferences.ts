import type { AlertPreference } from "@/types/alert-preferences"

export const DEFAULT_ALERT_PREFERENCES: AlertPreference[] = [
  {
    id: "credit-limit",
    name: "Limite de Crédito",
    description: "Notificar quando atingir % do limite",
    enabled: true,
    threshold: 80,
  },
  {
    id: "budget-exceeded",
    name: "Orçamento Excedido",
    description: "Notificar quando exceder orçamento",
    enabled: true,
  },
  {
    id: "invoice-due",
    name: "Fatura Próxima",
    description: "Notificar quando fatura for emitida",
    enabled: true,
  },
  {
    id: "fixed-expense",
    name: "Despesa Fixa",
    description: "Notificar antes de despesa fixa vencer",
    enabled: true,
  },
  {
    id: "loan-payment",
    name: "Pagamento de Empréstimo",
    description: "Notificar sobre pagamentos de empréstimos",
    enabled: false,
  },
]
