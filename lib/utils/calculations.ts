import Decimal from 'decimal.js'
import { addMonths } from 'date-fns'

/**
 * Calcula parcelas de uma compra parcelada
 * Garante que a soma das parcelas seja EXATAMENTE o valor total
 */
export function calculateInstallments(
  totalAmount: Decimal,
  numberOfInstallments: number,
  firstDueDate: Date
): Array<{
  installmentNumber: number
  dueDate: Date
  amount: Decimal
}> {
  if (numberOfInstallments < 1) {
    throw new Error('Número de parcelas deve ser >= 1')
  }

  if (totalAmount.lte(0)) {
    throw new Error('Valor total deve ser positivo')
  }

  // Calcular valor base da parcela
  const baseInstallmentAmount = totalAmount.dividedBy(numberOfInstallments)

  // Calcular diferença devido a arredondamento
  const sumOfBaseInstallments = baseInstallmentAmount.times(numberOfInstallments)
  const difference = totalAmount.minus(sumOfBaseInstallments)

  const installments = []

  for (let i = 0; i < numberOfInstallments; i++) {
    const isLastInstallment = i === numberOfInstallments - 1

    // A última parcela absorve a diferença de arredondamento
    const amount = isLastInstallment
      ? baseInstallmentAmount.plus(difference)
      : baseInstallmentAmount

    installments.push({
      installmentNumber: i + 1,
      dueDate: addMonths(firstDueDate, i),
      amount: amount
    })
  }

  return installments
}

/**
 * Calcula o período de uma fatura de cartão
 */
export function calculateInvoicePeriod(
  referenceMonth: Date,
  closingDay: number
): { start: Date; end: Date } {
  const year = referenceMonth.getFullYear()
  const month = referenceMonth.getMonth()

  // Período vai do dia após o fechamento do mês anterior
  // até o dia do fechamento do mês atual
  const start = new Date(year, month - 1, closingDay + 1)
  const end = new Date(year, month, closingDay)

  return { start, end }
}

/**
 * Soma valores com Decimal.js
 */
export function sumDecimals(values: Decimal[]): Decimal {
  return values.reduce(
    (sum, value) => sum.plus(value),
    new Decimal(0)
  )
}

/**
 * Converte string ou number para Decimal de forma segura
 */
export function toDecimal(value: string | number): Decimal {
  try {
    return new Decimal(value)
  } catch {
    throw new Error(`Valor inválido para conversão: ${value}`)
  }
}

/**
 * Formata Decimal como moeda BRL
 */
export function formatCurrency(value: Decimal): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value.toNumber())
}
