import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for display
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Format date
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }

  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace("R$", "").replace(".", "").replace(",", ".").trim())
}

// Calculate invoice total for a month
export function calculateMonthlyTotal(expenses: any[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

// Calculate installment payment date
export function getInstallmentDueDate(startDate: Date, installmentNumber: number): Date {
  const dueDate = new Date(startDate)
  dueDate.setMonth(dueDate.getMonth() + installmentNumber)
  return dueDate
}

// Get months remaining until year end
export function getMonthsRemaining(): number {
  const now = new Date()
  return 11 - now.getMonth()
}

// Calculate remaining budget
export function calculateRemainingBudget(limit: number, spent: number): number {
  return Math.max(0, limit - spent)
}

// Format credit card number for display
export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\s/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
}
