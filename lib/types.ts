// User types
export interface User {
  id: string
  email: string
  name?: string
}

// Credit Card types
export interface CreditCard {
  id: string
  userId: string
  name: string
  cardNumber: string
  lastFourDigits: string
  brand: string
  expiryMonth: number
  expiryYear: number
  limit: number
  dueDay: number
  createdAt: Date
  updatedAt: Date
}

// Expense types
export interface Expense {
  id: string
  userId: string
  creditCardId?: string
  description: string
  amount: number
  category: string
  date: Date
  status: "pending" | "paid" | "disputed"
  installmentId?: string
  createdAt: Date
  updatedAt: Date
}

// Installment types
export interface Installment {
  id: string
  userId: string
  creditCardId?: string
  description: string
  totalAmount: number
  numberOfInstallments: number
  currentInstallment: number
  monthlyAmount: number
  startDate: Date
  status: "active" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

// Invoice types
export interface Invoice {
  id: string
  userId: string
  creditCardId: string
  referenceMonth: string
  dueDate: Date
  totalAmount: number
  paidAmount: number
  status: "open" | "partial_paid" | "paid"
  createdAt: Date
  updatedAt: Date
}

// Fixed Expense types
export interface FixedExpense {
  id: string
  userId: string
  description: string
  amount: number
  category: string
  dueDay: number
  frequency: "monthly" | "quarterly" | "yearly"
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

// Loan types
export interface Loan {
  id: string
  userId: string
  name: string
  lenderName: string
  originalAmount: number
  currentBalance: number
  interestRate: number
  monthlyPayment: number
  startDate: Date
  endDate: Date
  status: "active" | "completed" | "defaulted"
  createdAt: Date
  updatedAt: Date
}

// Investment types
export interface Investment {
  id: string
  userId: string
  name: string
  type: string
  amount: number
  currentValue: number
  purchasePrice: number
  purchaseDate: Date
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

// Dashboard summary types
export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  totalDebt: number
  totalInvestments: number
  availableCredit: number
  monthlyBudgetRemaining: number
}

// Category totals
export interface CategoryTotal {
  category: string
  amount: number
  percentage: number
}
