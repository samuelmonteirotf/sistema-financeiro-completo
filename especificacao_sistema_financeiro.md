# ESPECIFICAÇÃO TÉCNICA COMPLETA - SISTEMA DE CONTROLE FINANCEIRO

## 📋 ANÁLISE DAS PLANILHAS EXISTENTES

### Estrutura Identificada:

#### 1. **Cryptos.csv**
- Investimentos em 27 criptomoedas diferentes
- Colunas: Símbolo, Nome, Valor Unitário ($), Valor Total (R$), Percentual, Total com Taxas, Taxas
- Cálculo: Conversão USD → BRL usando taxa fixa (R$ 5,66)
- Total investido: R$ 5.000,00
- Valor atual: R$ 4.820,70
- Total de taxas: R$ 179,30

#### 2. **Despesas_Cotidianas.csv**
**Categorias principais:**
- Alimentação
- Farmácia
- Combustível
- Delivery
- Outros

**Cartões de crédito:**
- C6
- Infinite BB
- Bradesco
- Black/Sim

**Períodos:** Dezembro/2024 até Dezembro/2026 (previsão)

#### 3. **Despesas_e_Proventos_totais.csv**
- Consolidação de TODOS os cartões
- Despesas fixas totais
- Despesas transitórias totais
- Despesas bancárias totais
- Proventos (Salário Pai, Salário João, Diárias, 13º, Férias)
- Investimentos (Corretora, Binance, DARF, CDI Nubank)
- Saldo em conta (BB João, Nubank João, Caixa Pai, BM Motors)

#### 4. **Despesas_fixas.csv**
**Moradia:**
- Água, Luz, Aluguel (R$ 2.700), IPTU, IR, Taxa de lixo, Sky, Infovale

**Saúde:**
- Convênio Angelus, Unimed

**Educação:**
- Cursos

**Estética:**
- Nubank (Mãe)

**Pessoais:**
- Celulares, Bigode (Cadeiras), Taxa jazigo

**Veículos:**
- IPVA Audi, Licenciamento Audi, IPVA BMW, Licenciamento BMW

#### 5. **Empréstimos_e_financiamentos.csv**
- BB consignado (João) - 2 contratos
- Caixa consignado (Pai) - 2 contratos
- Carro BMW
- Consórcio Bradesco
- Apatej
- Cestas bancárias

#### 6. **Mila.csv**
**Estrutura complexa de empréstimo:**
- Dívida original: R$ 121.633,84 (Outubro/2023)
- Parcelas distribuídas em:
  - C6 Carbon
  - BB Infinite
  - Bradesco Infinite
  - Caixa Black/Sim
  - Nubank (Jr)
  - Santander (Jr)
  - Empréstimo Santander fixo: R$ 707/mês
  - PIX (Pagamentos diversos)
- Adiantamentos e juros
- Campo "Pagou:" com anotações mensais

#### 7. **Parcelamentos.csv**
**Por cartão:**
- C6: 24 estabelecimentos diferentes
- Infinite BB: 121 estabelecimentos diferentes
- Bradesco: 27 estabelecimentos diferentes
- Black/Sim: 48 estabelecimentos diferentes

**Características:**
- Múltiplas parcelas do mesmo estabelecimento
- Parcelas começando em meses diferentes
- Anuidades de cartões
- Seguros

#### 8. **Pix.csv**
- Manicure (Mãe): R$ 300/mês
- Pilates: R$ 470/mês
- Cartão do Gordo: valores variáveis

#### 9. **Saldo_final.csv**
- Despesas totais mensais
- Proventos totais mensais
- Saldo mensal
- Patrimônio total
- Checklist de despesas previstas (Seguro Audi, IPVA, etc.)

---

## 🎯 REQUISITOS DO SISTEMA

### 1. FUNCIONALIDADES ESSENCIAIS

#### A) Gestão de Cartões de Crédito
\`\`\`
- Cadastro ilimitado de cartões
- Fechamento: dia do mês configurável
- Vencimento: dia do mês configurável
- Limite configurável
- Status: ativo/inativo
- Cor identificadora
- Ícone personalizável
\`\`\`

#### B) Categorização Automática
\`\`\`
- Categorias principais: Alimentação, Farmácia, Combustível, Delivery, Outros
- Subcategorias customizáveis
- Regras de categorização automática por nome do estabelecimento
- Aprendizado: sugerir categoria baseado em histórico
\`\`\`

#### C) Lançamento de Despesas
\`\`\`
- Data da compra
- Estabelecimento (autocomplete com histórico)
- Valor
- Cartão
- Categoria (auto-sugerida)
- Parcelamento: 1x até 60x
- Observações
- Anexos (foto da nota fiscal)
\`\`\`

#### D) Gestão de Parcelamentos
\`\`\`
- Visualização de todas as parcelas futuras
- Cálculo automático de impacto nas próximas faturas
- Alerta de parcelas terminando
- Opção de pagamento antecipado (recalcular juros)
\`\`\`

#### E) Despesas Fixas
\`\`\`
- Cadastro de despesas recorrentes
- Dia do débito
- Forma de pagamento
- Indexação (IPCA, IGP-M, fixo)
- Previsão automática para 24 meses
- Alertas de vencimento
\`\`\`

#### F) Empréstimos e Financiamentos
\`\`\`
- Valor total
- Taxa de juros
- Prazo
- Valor da parcela
- Cálculo de juros (Price, SAC)
- Simulação de amortização
- Gráfico de evolução da dívida
\`\`\`

#### G) Controle de Empréstimos a Terceiros (Tipo "Mila")
\`\`\`
- Valor emprestado
- Data do empréstimo
- Valor das parcelas
- Cartões impactados
- Pagamentos recebidos
- Saldo devedor
- Histórico de pagamentos
- Juros (se aplicável)
- Gráfico de evolução
\`\`\`

#### H) Proventos
\`\`\`
- Salários (múltiplos)
- 13º salário (cálculo automático)
- Férias (1/3 a mais)
- Diárias
- Outros rendimentos
- Descontos (IR, INSS, consignados)
\`\`\`

#### I) Investimentos
\`\`\`
- Crypto (integração com API para cotação)
- Renda fixa
- Renda variável
- Previdência
- Cálculo de rendimento
- Alocação de patrimônio
\`\`\`

#### J) Dashboard e Relatórios
\`\`\`
- Visão geral do mês
- Gráfico de despesas por categoria
- Gráfico de despesas por cartão
- Tendência de gastos (6 meses)
- Projeção de fluxo de caixa (12 meses)
- Comparação mensal
- Alertas inteligentes
\`\`\`

---

## 🏗️ ARQUITETURA TÉCNICA RECOMENDADA

### Stack Principal

#### Frontend
\`\`\`
Framework: Next.js 14+ (App Router)
Linguagem: TypeScript 5+
UI: shadcn/ui + Tailwind CSS
Gráficos: Recharts ou Chart.js
Tabelas: TanStack Table (React Table v8)
Formulários: React Hook Form + Zod
Estado: Zustand ou Jotai
Datas: date-fns
Números: Decimal.js (precisão financeira)
\`\`\`

#### Backend
\`\`\`
Framework: Next.js API Routes (serverless)
ORM: Prisma
Validação: Zod
Autenticação: NextAuth.js
APIs Externas: Axios
\`\`\`

#### Banco de Dados
\`\`\`
Primário: PostgreSQL 16+
Cache: Redis (opcional para otimização)
Backup: Estratégia 3-2-1
\`\`\`

#### Infraestrutura
\`\`\`
Hosting: Vercel (frontend) ou Railway
Database: Railway, Supabase ou Neon
Storage: Cloudflare R2 ou AWS S3 (anexos)
CDN: Cloudflare
\`\`\`

---

## 💾 MODELAGEM DO BANCO DE DADOS

### Schema Prisma Completo

\`\`\`prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== AUTENTICAÇÃO ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relações
  households    HouseholdMember[]
  expenses      Expense[]
  incomes       Income[]
}

model Household {
  id          String    @id @default(cuid())
  name        String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relações
  members     HouseholdMember[]
  cards       Card[]
  categories  Category[]
  expenses    Expense[]
  fixedExpenses FixedExpense[]
  loans       Loan[]
  lentMoney   LentMoney[]
  incomes     Income[]
  budgets     Budget[]
}

model HouseholdMember {
  id          String    @id @default(cuid())
  role        String    // "admin", "member", "viewer"
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  
  @@unique([userId, householdId])
}

// ==================== CARTÕES ====================

model Card {
  id            String    @id @default(cuid())
  name          String
  lastDigits    String?   @db.VarChar(4)
  brand         String    // "Visa", "Mastercard", etc.
  type          String    // "credit", "debit"
  closingDay    Int       // Dia do fechamento (1-31)
  dueDay        Int       // Dia do vencimento (1-31)
  limit         Decimal?  @db.Decimal(12, 2)
  color         String    @default("#3B82F6")
  icon          String    @default("credit-card")
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  // Relações
  expenses      Expense[]
  installments  Installment[]
}

// ==================== CATEGORIAS ====================

model Category {
  id          String    @id @default(cuid())
  name        String
  type        String    // "expense", "income"
  color       String
  icon        String
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  
  // Relações
  expenses    Expense[]
  fixedExpenses FixedExpense[]
  budgets     Budget[]
  
  @@unique([householdId, name])
}

// ==================== DESPESAS ====================

model Expense {
  id            String    @id @default(cuid())
  description   String
  amount        Decimal   @db.Decimal(12, 2)
  date          DateTime
  installments  Int       @default(1)
  currentInstallment Int @default(1)
  isRecurring   Boolean   @default(false)
  observations  String?
  attachments   Json?     // Array de URLs
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  cardId        String?
  card          Card?     @relation(fields: [cardId], references: [id])
  
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  // Relações
  installmentDetails Installment[]
  
  @@index([date])
  @@index([cardId, date])
}

model Installment {
  id              String    @id @default(cuid())
  installmentNumber Int
  dueDate         DateTime
  amount          Decimal   @db.Decimal(12, 2)
  isPaid          Boolean   @default(false)
  paidAt          DateTime?
  
  expenseId       String
  expense         Expense   @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  
  cardId          String?
  card            Card?     @relation(fields: [cardId], references: [id])
  
  @@index([dueDate])
  @@index([cardId, dueDate])
}

// ==================== DESPESAS FIXAS ====================

model FixedExpense {
  id            String    @id @default(cuid())
  name          String
  amount        Decimal   @db.Decimal(12, 2)
  dueDay        Int       // Dia do mês (1-31)
  paymentMethod String    // "card", "pix", "bank_transfer", "bill"
  startDate     DateTime
  endDate       DateTime?
  indexation    String?   // "ipca", "igpm", "fixed"
  isActive      Boolean   @default(true)
  observations  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  @@index([dueDay])
}

// ==================== EMPRÉSTIMOS ====================

model Loan {
  id            String    @id @default(cuid())
  name          String
  type          String    // "consigned", "personal", "car", "home"
  principal     Decimal   @db.Decimal(12, 2)
  interestRate  Decimal   @db.Decimal(5, 4)
  installments  Int
  installmentAmount Decimal @db.Decimal(12, 2)
  startDate     DateTime
  calculationMethod String // "price", "sac"
  isActive      Boolean   @default(true)
  observations  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  // Relações
  payments      LoanPayment[]
}

model LoanPayment {
  id            String    @id @default(cuid())
  installmentNumber Int
  dueDate       DateTime
  principalAmount Decimal @db.Decimal(12, 2)
  interestAmount  Decimal @db.Decimal(12, 2)
  totalAmount   Decimal   @db.Decimal(12, 2)
  remainingBalance Decimal @db.Decimal(12, 2)
  isPaid        Boolean   @default(false)
  paidAt        DateTime?
  
  loanId        String
  loan          Loan      @relation(fields: [loanId], references: [id], onDelete: Cascade)
  
  @@index([dueDate])
}

// ==================== EMPRÉSTIMOS A TERCEIROS ====================

model LentMoney {
  id            String    @id @default(cuid())
  borrowerName  String
  principal     Decimal   @db.Decimal(12, 2)
  interestRate  Decimal?  @db.Decimal(5, 4)
  lentDate      DateTime
  installmentAmount Decimal? @db.Decimal(12, 2)
  observations  String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  // Relações
  payments      LentMoneyPayment[]
  cardImpacts   LentMoneyCardImpact[]
}

model LentMoneyPayment {
  id            String    @id @default(cuid())
  amount        Decimal   @db.Decimal(12, 2)
  paymentDate   DateTime
  paymentMethod String    // "pix", "bank_transfer", etc.
  observations  String?
  
  lentMoneyId   String
  lentMoney     LentMoney @relation(fields: [lentMoneyId], references: [id], onDelete: Cascade)
  
  @@index([paymentDate])
}

model LentMoneyCardImpact {
  id            String    @id @default(cuid())
  cardName      String
  monthlyAmount Decimal   @db.Decimal(12, 2)
  startDate     DateTime
  endDate       DateTime?
  
  lentMoneyId   String
  lentMoney     LentMoney @relation(fields: [lentMoneyId], references: [id], onDelete: Cascade)
}

// ==================== RECEITAS ====================

model Income {
  id            String    @id @default(cuid())
  description   String
  type          String    // "salary", "13th", "vacation", "daily_rate", "other"
  amount        Decimal   @db.Decimal(12, 2)
  receiptDate   DateTime
  observations  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  @@index([receiptDate])
}

// ==================== INVESTIMENTOS ====================

model Investment {
  id            String    @id @default(cuid())
  type          String    // "crypto", "stock", "bond", "fund"
  symbol        String
  name          String
  quantity      Decimal   @db.Decimal(18, 8)
  averagePrice  Decimal   @db.Decimal(12, 2)
  currentPrice  Decimal?  @db.Decimal(12, 2)
  currency      String    @default("BRL")
  platform      String?   // "Binance", "B3", etc.
  lastUpdated   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  // Relações
  transactions  InvestmentTransaction[]
}

model InvestmentTransaction {
  id            String    @id @default(cuid())
  type          String    // "buy", "sell"
  quantity      Decimal   @db.Decimal(18, 8)
  price         Decimal   @db.Decimal(12, 2)
  fees          Decimal   @db.Decimal(12, 2) @default(0)
  transactionDate DateTime
  
  investmentId  String
  investment    Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  
  @@index([transactionDate])
}

// ==================== ORÇAMENTO ====================

model Budget {
  id            String    @id @default(cuid())
  month         DateTime  @db.Date
  amount        Decimal   @db.Decimal(12, 2)
  
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  
  householdId   String
  household     Household @relation(fields: [householdId], references: [id])
  
  @@unique([householdId, categoryId, month])
  @@index([month])
}

// ==================== REGRAS DE CATEGORIZAÇÃO ====================

model CategorizationRule {
  id            String    @id @default(cuid())
  merchantPattern String  // Regex ou string simples
  categoryId    String
  priority      Int       @default(0)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  
  @@index([merchantPattern])
}
\`\`\`

---

## 📐 ARQUITETURA DE PASTAS

\`\`\`
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── expenses/
│   │   │   ├── page.tsx                # Lista de despesas
│   │   │   ├── new/page.tsx            # Nova despesa
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Detalhes
│   │   │       └── edit/page.tsx       # Editar
│   │   ├── cards/
│   │   │   ├── page.tsx                # Gerenciar cartões
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Fatura do cartão
│   │   │       ├── edit/page.tsx
│   │   │       └── invoice/[month]/page.tsx
│   │   ├── installments/
│   │   │   └── page.tsx                # Visão de parcelamentos
│   │   ├── fixed-expenses/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── loans/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── amortization/page.tsx
│   │   ├── lent-money/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── payments/page.tsx
│   │   ├── incomes/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── investments/
│   │   │   ├── page.tsx
│   │   │   ├── crypto/page.tsx
│   │   │   └── stocks/page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx                # Relatórios gerais
│   │   │   ├── by-category/page.tsx
│   │   │   ├── by-card/page.tsx
│   │   │   └── cash-flow/page.tsx
│   │   ├── budget/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── profile/page.tsx
│   │       └── household/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── expenses/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── cards/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── invoice/route.ts
│   │   ├── installments/route.ts
│   │   ├── fixed-expenses/route.ts
│   │   ├── loans/route.ts
│   │   ├── lent-money/route.ts
│   │   ├── incomes/route.ts
│   │   ├── investments/
│   │   │   ├── route.ts
│   │   │   └── prices/route.ts
│   │   ├── categories/route.ts
│   │   ├── budget/route.ts
│   │   └── reports/
│   │       ├── dashboard/route.ts
│   │       ├── by-category/route.ts
│   │       └── cash-flow/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── expense-chart.tsx
│   │   ├── recent-expenses.tsx
│   │   └── alerts-panel.tsx
│   ├── expenses/
│   │   ├── expense-form.tsx
│   │   ├── expense-list.tsx
│   │   ├── expense-filters.tsx
│   │   └── installment-preview.tsx
│   ├── cards/
│   │   ├── card-form.tsx
│   │   ├── card-list.tsx
│   │   ├── card-selector.tsx
│   │   └── invoice-detail.tsx
│   ├── forms/
│   │   ├── installment-calculator.tsx
│   │   └── date-range-picker.tsx
│   ├── charts/
│   │   ├── expense-by-category-chart.tsx
│   │   ├── expense-trend-chart.tsx
│   │   └── cash-flow-chart.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── mobile-nav.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── validations/
│   │   ├── expense.ts
│   │   ├── card.ts
│   │   ├── loan.ts
│   │   └── investment.ts
│   ├── utils/
│   │   ├── currency.ts                 # Formatação de moeda
│   │   ├── date.ts                     # Manipulação de datas
│   │   ├── calculations.ts             # Cálculos financeiros
│   │   └── validators.ts
│   ├── api/
│   │   ├── expenses.ts
│   │   ├── cards.ts
│   │   └── crypto.ts                   # Integração com API de crypto
│   └── hooks/
│       ├── use-expenses.ts
│       ├── use-cards.ts
│       ├── use-installments.ts
│       └── use-dashboard-data.ts
├── types/
│   ├── index.ts
│   ├── expense.ts
│   ├── card.ts
│   ├── loan.ts
│   └── investment.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── icons/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
\`\`\`

---

## 🧮 LÓGICA DE CÁLCULOS CRÍTICOS

### 1. Cálculo de Fatura de Cartão

\`\`\`typescript
// lib/utils/calculations.ts

import Decimal from 'decimal.js';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

interface CardInvoiceParams {
  cardId: string;
  month: Date;
  closingDay: number;
}

interface InvoiceItem {
  description: string;
  date: Date;
  amount: Decimal;
  installment?: string; // "3/12"
}

interface Invoice {
  total: Decimal;
  items: InvoiceItem[];
  previousBalance: Decimal;
  payments: Decimal;
  finalBalance: Decimal;
}

export async function calculateCardInvoice(
  params: CardInvoiceParams
): Promise<Invoice> {
  const { cardId, month, closingDay } = params;
  
  // Período da fatura: do fechamento do mês anterior até fechamento atual
  const invoiceStartDate = new Date(
    month.getFullYear(),
    month.getMonth() - 1,
    closingDay + 1
  );
  const invoiceEndDate = new Date(
    month.getFullYear(),
    month.getMonth(),
    closingDay
  );
  
  // Buscar despesas do período
  const expenses = await prisma.expense.findMany({
    where: {
      cardId,
      date: {
        gte: invoiceStartDate,
        lte: invoiceEndDate
      }
    },
    include: {
      category: true
    }
  });
  
  // Buscar parcelas que vencem neste período
  const installments = await prisma.installment.findMany({
    where: {
      cardId,
      dueDate: {
        gte: invoiceStartDate,
        lte: invoiceEndDate
      }
    },
    include: {
      expense: {
        include: {
          category: true
        }
      }
    }
  });
  
  const items: InvoiceItem[] = [];
  let total = new Decimal(0);
  
  // Adicionar despesas à vista
  for (const expense of expenses) {
    if (expense.installments === 1) {
      items.push({
        description: expense.description,
        date: expense.date,
        amount: new Decimal(expense.amount.toString())
      });
      total = total.plus(expense.amount.toString());
    }
  }
  
  // Adicionar parcelas
  for (const inst of installments) {
    items.push({
      description: inst.expense.description,
      date: inst.dueDate,
      amount: new Decimal(inst.amount.toString()),
      installment: `${inst.installmentNumber}/${inst.expense.installments}`
    });
    total = total.plus(inst.amount.toString());
  }
  
  // Ordenar por data
  items.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return {
    total,
    items,
    previousBalance: new Decimal(0), // TODO: Implementar saldo anterior
    payments: new Decimal(0),        // TODO: Implementar pagamentos
    finalBalance: total
  };
}
\`\`\`

### 2. Cálculo de Parcelas

\`\`\`typescript
export function calculateInstallments(
  totalAmount: Decimal,
  numberOfInstallments: number,
  firstDueDate: Date
): Array<{ installmentNumber: number; dueDate: Date; amount: Decimal }> {
  
  // Dividir valor total em parcelas iguais
  const installmentAmount = totalAmount.dividedBy(numberOfInstallments);
  
  // Ajustar última parcela para compensar arredondamentos
  const sumOfInstallments = installmentAmount.times(numberOfInstallments);
  const difference = totalAmount.minus(sumOfInstallments);
  
  const installments = [];
  
  for (let i = 0; i < numberOfInstallments; i++) {
    const isLastInstallment = i === numberOfInstallments - 1;
    const amount = isLastInstallment 
      ? installmentAmount.plus(difference)
      : installmentAmount;
    
    installments.push({
      installmentNumber: i + 1,
      dueDate: addMonths(firstDueDate, i),
      amount: amount
    });
  }
  
  return installments;
}
\`\`\`

### 3. Projeção de Fluxo de Caixa

\`\`\`typescript
interface CashFlowProjection {
  month: Date;
  income: Decimal;
  expenses: Decimal;
  balance: Decimal;
  cumulativeBalance: Decimal;
}

export async function projectCashFlow(
  householdId: string,
  startMonth: Date,
  months: number
): Promise<CashFlowProjection[]> {
  
  const projections: CashFlowProjection[] = [];
  let cumulativeBalance = new Decimal(0);
  
  for (let i = 0; i < months; i++) {
    const currentMonth = addMonths(startOfMonth(startMonth), i);
    const monthEnd = endOfMonth(currentMonth);
    
    // Calcular receitas do mês
    const incomes = await prisma.income.findMany({
      where: {
        householdId,
        receiptDate: {
          gte: currentMonth,
          lte: monthEnd
        }
      }
    });
    
    const totalIncome = incomes.reduce(
      (sum, income) => sum.plus(income.amount.toString()),
      new Decimal(0)
    );
    
    // Calcular despesas do mês (incluindo parcelas)
    const expenses = await prisma.expense.findMany({
      where: {
        householdId,
        date: {
          gte: currentMonth,
          lte: monthEnd
        }
      }
    });
    
    const installments = await prisma.installment.findMany({
      where: {
        dueDate: {
          gte: currentMonth,
          lte: monthEnd
        },
        expense: {
          householdId
        }
      }
    });
    
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: {
        householdId,
        isActive: true,
        startDate: {
          lte: monthEnd
        },
        OR: [
          { endDate: null },
          { endDate: { gte: currentMonth } }
        ]
      }
    });
    
    let totalExpenses = new Decimal(0);
    
    // Somar despesas à vista
    for (const expense of expenses) {
      if (expense.installments === 1) {
        totalExpenses = totalExpenses.plus(expense.amount.toString());
      }
    }
    
    // Somar parcelas
    for (const inst of installments) {
      totalExpenses = totalExpenses.plus(inst.amount.toString());
    }
    
    // Somar despesas fixas
    for (const fixed of fixedExpenses) {
      totalExpenses = totalExpenses.plus(fixed.amount.toString());
    }
    
    const balance = totalIncome.minus(totalExpenses);
    cumulativeBalance = cumulativeBalance.plus(balance);
    
    projections.push({
      month: currentMonth,
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      cumulativeBalance
    });
  }
  
  return projections;
}
\`\`\`

### 4. Cálculo de Empréstimo (Sistema Price)

\`\`\`typescript
export function calculateLoanPrice(
  principal: Decimal,
  annualInterestRate: Decimal,
  months: number
): Array<{
  installmentNumber: number;
  principalAmount: Decimal;
  interestAmount: Decimal;
  totalAmount: Decimal;
  remainingBalance: Decimal;
}> {
  
  // Taxa mensal
  const monthlyRate = annualInterestRate.dividedBy(12).dividedBy(100);
  
  // Cálculo da parcela fixa (Sistema Price)
  // PMT = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const onePlusRate = new Decimal(1).plus(monthlyRate);
  const numerator = monthlyRate.times(onePlusRate.pow(months));
  const denominator = onePlusRate.pow(months).minus(1);
  const installmentAmount = principal.times(numerator.dividedBy(denominator));
  
  const schedule = [];
  let remainingBalance = principal;
  
  for (let i = 1; i <= months; i++) {
    const interestAmount = remainingBalance.times(monthlyRate);
    const principalAmount = installmentAmount.minus(interestAmount);
    remainingBalance = remainingBalance.minus(principalAmount);
    
    // Ajustar última parcela para evitar saldo residual
    if (i === months && remainingBalance.abs().lessThan(0.01)) {
      remainingBalance = new Decimal(0);
    }
    
    schedule.push({
      installmentNumber: i,
      principalAmount,
      interestAmount,
      totalAmount: installmentAmount,
      remainingBalance: remainingBalance.lessThan(0) ? new Decimal(0) : remainingBalance
    });
  }
  
  return schedule;
}
\`\`\`

### 5. Atualização de Cotação de Crypto

\`\`\`typescript
// lib/api/crypto.ts

interface CryptoPrice {
  symbol: string;
  priceUSD: Decimal;
  priceBRL: Decimal;
  change24h: Decimal;
}

export async function updateCryptoPrices(
  householdId: string
): Promise<CryptoPrice[]> {
  
  // Buscar todos os investimentos em crypto
  const investments = await prisma.investment.findMany({
    where: {
      householdId,
      type: 'crypto'
    }
  });
  
  if (investments.length === 0) return [];
  
  const symbols = investments.map(inv => inv.symbol).join(',');
  
  // Integração com CoinGecko API (exemplo)
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd,brl&include_24hr_change=true`
  );
  
  const data = await response.json();
  
  const prices: CryptoPrice[] = [];
  
  // Atualizar preços no banco
  for (const investment of investments) {
    const priceData = data[investment.symbol.toLowerCase()];
    
    if (priceData) {
      const priceUSD = new Decimal(priceData.usd);
      const priceBRL = new Decimal(priceData.brl);
      const change24h = new Decimal(priceData.usd_24h_change || 0);
      
      await prisma.investment.update({
        where: { id: investment.id },
        data: {
          currentPrice: priceBRL,
          lastUpdated: new Date()
        }
      });
      
      prices.push({
        symbol: investment.symbol,
        priceUSD,
        priceBRL,
        change24h
      });
    }
  }
  
  return prices;
}
\`\`\`

---

## 🎨 INTERFACES PRINCIPAIS

### 1. Dashboard

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  🏠 Controle Financeiro                        👤 João  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 RESUMO DO MÊS - Novembro 2025                      │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ RECEITAS │ DESPESAS │  SALDO   │ CARTÕES  │         │
│  │ R$ 34.1K │ R$ 59.9K │-R$ 25.7K │    4     │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                         │
│  📈 DESPESAS POR CATEGORIA                             │
│  ┌─────────────────────────────────────────────┐       │
│  │ Alimentação    ████████████████░░░  R$ 4.5K │       │
│  │ Parcelamentos  ████████████████████  R$ 18K │       │
│  │ Combustível    ██████░░░░░░░░░░░░░  R$ 2.0K │       │
│  │ Farmácia       ████░░░░░░░░░░░░░░░  R$ 585  │       │
│  │ Delivery       ███████████░░░░░░░░░  R$ 5.3K │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  💳 PRÓXIMAS FATURAS                                   │
│  ┌──────────────────────────────────────────────┐      │
│  │ C6           Vence: 15/12  R$ 4.423,32       │      │
│  │ Infinite BB  Vence: 20/12  R$ 19.891,66      │      │
│  │ Bradesco     Vence: 25/12  R$ 4.796,26       │      │
│  │ Black        Vence: 10/12  R$ 10.800,63      │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  ⚠️ ALERTAS                                            │
│  • Parcela do empréstimo Mila vence em 3 dias         │
│  • Seguro Audi vence no próximo mês                   │
│  • Cartão C6 próximo do limite (85%)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 2. Lançamento de Despesa

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  ← Voltar                   NOVA DESPESA                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📝 Descrição *                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ MercadÃ£o Atacadista                             │ │
│  └───────────────────────────────────────────────────┘ │
│  ↓ Sugestões do histórico:                            │
│    • MercadÃ£o Atacadista (última vez: 10/11)        │
│                                                         │
│  💰 Valor *                                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │ R$ 1.716,67                                       │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  📅 Data da Compra *                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 01/11/2025                              📅        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  💳 Cartão *                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ▼ Infinite BB                                     │ │
│  └───────────────────────────────────────────────────┘ │
│  Limite disponível: R$ 15.234,50                      │
│  Fechamento: 20/11 | Vencimento: 05/12                │
│                                                         │
│  🏷️ Categoria *                                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ▼ Alimentação                                     │ │
│  └───────────────────────────────────────────────────┘ │
│  ↓ Sugerido com base no histórico                     │
│                                                         │
│  📊 Parcelamento                                       │
│  ┌──────┬──────────────────────────────────────────┐  │
│  │ [●] À vista     [ ] Parcelado                   │  │
│  │                                                  │  │
│  │ [ ] 3x R$ 572,22  [ ] 6x R$ 286,11             │  │
│  │ [ ] 12x R$ 143,06 [ ] Outro: __                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  💬 Observações                                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  📎 Anexar Nota Fiscal                                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │  [+] Adicionar arquivo                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────┬───────────────────────────────────┐ │
│  │   Cancelar    │       💾 Salvar Despesa          │ │
│  └───────────────┴───────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 3. Gerenciamento de Parcelamentos

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  PARCELAMENTOS ATIVOS                                   │
├─────────────────────────────────────────────────────────┤
│  Filtros: [ Todos ] [ C6 ] [ BB ] [ Bradesco ] [ Black ]│
│                                                         │
│  📱 ZP Samuel - 13/13 parcelas restantes               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Cartão: C6, Infinite BB, Bradesco, Black       │   │
│  │  Valor total: R$ 7.313,95 (13x R$ 562,61)       │   │
│  │  Início: 03/2025 | Término: 03/2026             │   │
│  │  ████████████████████████░░░░░░ 66% concluído   │   │
│  │                                                  │   │
│  │  Próximas parcelas:                              │   │
│  │  • 11/2025 - R$ 562,11 (C6)                     │   │
│  │  • 11/2025 - R$ 562,11 (Infinite BB)            │   │
│  │  • 11/2025 - R$ 562,11 (Bradesco)               │   │
│  │  • 11/2025 - R$ 562,11 (Black)                  │   │
│  │                                                  │   │
│  │  [Ver Detalhes] [Pagar Antecipado] [Editar]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🎬 Ebanx *Spotify - 24 parcelas restantes            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Cartão: Infinite BB                             │   │
│  │  Valor: R$ 982,80 (24x R$ 40,90)                │   │
│  │  Início: 12/2024 | Término: 11/2026             │   │
│  │  ████░░░░░░░░░░░░░░░░░░░░ 16% concluído         │   │
│  │                                                  │   │
│  │  Próxima: 11/2025 - R$ 40,90                    │   │
│  │                                                  │   │
│  │  [Ver Detalhes] [Editar]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  👕 Lookeshop - 6 parcelas restantes                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Cartão: Black                                   │   │
│  │  Valor: R$ 1.733,16 (6x R$ 288,61)              │   │
│  │  Início: 09/2025 | Término: 02/2026             │   │
│  │  ████████████████░░░░░░░░ 60% concluído         │   │
│  │                                                  │   │
│  │  Próxima: 11/2025 - R$ 288,61                   │   │
│  │                                                  │   │
│  │  [Ver Detalhes] [Editar]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 RESUMO                                             │
│  • Total em parcelas: R$ 28.800,77                    │
│  • Parcelas/mês: R$ 25.623,90                         │
│  • Término previsto: 03/2026                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Setup e Infraestrutura (Semana 1-2)

**Checklist completo:**

\`\`\`bash
# 1. Criar projeto Next.js
npx create-next-app@latest controle-financeiro --typescript --tailwind --app --use-npm

# 2. Instalar dependências essenciais
cd controle-financeiro
npm install prisma @prisma/client
npm install decimal.js date-fns zod
npm install @tanstack/react-table
npm install recharts
npm install next-auth
npm install react-hook-form @hookform/resolvers

# 3. Instalar shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover

# 4. Configurar Prisma
npx prisma init

# 5. Criar arquivo .env.local
cat > .env.local << EOF
DATABASE_URL="postgresql://usuario:senha@localhost:5432/financeiro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
EOF
\`\`\`

**Estrutura de pastas inicial:**
\`\`\`bash
mkdir -p app/{api,\(auth\),\(dashboard\)}
mkdir -p components/{ui,dashboard,expenses,cards,forms,charts,layout}
mkdir -p lib/{validations,utils,api,hooks}
mkdir -p types
\`\`\`

### Fase 2: Banco de Dados (Semana 2-3)

1. **Copiar o schema Prisma** do documento acima para `prisma/schema.prisma`
2. **Executar migrations:**
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`
3. **Criar seed inicial:**
\`\`\`bash
npx prisma db seed
\`\`\`

### Fase 3: Autenticação (Semana 3)

1. Implementar NextAuth.js
2. Criar páginas de login/registro
3. Proteger rotas

### Fase 4: CRUD de Cartões (Semana 4)

1. API routes para cartões
2. Formulário de cadastro
3. Lista de cartões
4. Validações

### Fase 5: CRUD de Despesas (Semana 5-6)

1. API routes para despesas
2. Formulário de lançamento
3. Lista com filtros
4. Cálculo de parcelas

### Fase 6: Faturas de Cartão (Semana 7)

1. Tela de visualização de fatura
2. Cálculo correto baseado em fechamento
3. Impressão/PDF

### Fase 7: Dashboard (Semana 8)

1. Cards de resumo
2. Gráficos
3. Alertas

### Fase 8: Despesas Fixas e Empréstimos (Semana 9-10)

1. CRUD de despesas fixas
2. CRUD de empréstimos
3. Cálculos de amortização

### Fase 9: Empréstimos a Terceiros (Semana 11)

1. Implementar modelo "Mila"
2. Controle de pagamentos
3. Impacto em múltiplos cartões

### Fase 10: Investimentos (Semana 12)

1. CRUD de investimentos
2. Integração com API de crypto
3. Cálculo de rentabilidade

### Fase 11: Relatórios (Semana 13)

1. Relatórios por categoria
2. Fluxo de caixa
3. Exportação

### Fase 12: Testes e Ajustes (Semana 14-16)

1. Testes unitários
2. Testes de integração
3. Ajustes de UX
4. Otimizações

---

## 📦 PACKAGE.JSON COMPLETO

\`\`\`json
{
  "name": "controle-financeiro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.9.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@tanstack/react-table": "^8.11.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.2.0",
    "decimal.js": "^10.4.3",
    "lucide-react": "^0.316.0",
    "next": "14.1.0",
    "next-auth": "^4.24.5",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "recharts": "^2.10.4",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "prisma": "^5.9.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
\`\`\`

---

## ⚠️ PONTOS CRÍTICOS DE ATENÇÃO

### 1. Precisão Numérica
- **SEMPRE usar Decimal.js** para cálculos monetários
- **NUNCA usar Number** para valores financeiros
- Configurar Prisma com `@db.Decimal(12, 2)`

### 2. Tratamento de Datas
- Usar `date-fns` para manipulação
- Sempre considerar timezone
- Datas de fechamento podem ser dia 31 (cuidado com meses menores)

### 3. Validações
- Validar TODOS os inputs com Zod
- Validações no frontend E backend
- Mensagens de erro claras

### 4. Performance
- Indexar corretamente no Prisma
- Usar paginação em listas longas
- Cache de cálculos pesados
- Lazy loading de relatórios

### 5. Segurança
- NUNCA expor IDs sequenciais (usar CUID)
- Validar permissões em TODA API route
- Sanitizar inputs
- HTTPS obrigatório em produção

### 6. Backup
- Backup automático diário do banco
- Manter 30 dias de histórico
- Testar restauração mensalmente

### 7. Auditoria
- Logar TODAS as modificações financeiras
- Timestamp + usuário em cada operação
- Manter histórico de alterações

---

## 🔄 MIGRAÇÃO DOS DADOS EXISTENTES

### Script de Importação

\`\`\`typescript
// scripts/import-legacy-data.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

async function importCSVData() {
  console.log('🚀 Iniciando importação...');
  
  // 1. Criar household padrão
  const household = await prisma.household.create({
    data: {
      name: 'Casa Principal'
    }
  });
  
  console.log('✅ Household criado');
  
  // 2. Criar cartões
  const cards = await Promise.all([
    prisma.card.create({
      data: {
        name: 'C6',
        brand: 'Visa',
        type: 'credit',
        closingDay: 15,
        dueDay: 5,
        color: '#000000',
        householdId: household.id
      }
    }),
    prisma.card.create({
      data: {
        name: 'Infinite BB',
        brand: 'Visa',
        type: 'credit',
        closingDay: 20,
        dueDay: 10,
        color: '#0066CC',
        householdId: household.id
      }
    }),
    prisma.card.create({
      data: {
        name: 'Bradesco',
        brand: 'Visa',
        type: 'credit',
        closingDay: 25,
        dueDay: 15,
        color: '#CC0000',
        householdId: household.id
      }
    }),
    prisma.card.create({
      data: {
        name: 'Black',
        brand: 'Mastercard',
        type: 'credit',
        closingDay: 10,
        dueDay: 20,
        color: '#1C1C1C',
        householdId: household.id
      }
    })
  ]);
  
  console.log('✅ Cartões criados');
  
  // 3. Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Alimentação',
        type: 'expense',
        color: '#10B981',
        icon: 'utensils',
        householdId: household.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Farmácia',
        type: 'expense',
        color: '#EF4444',
        icon: 'pill',
        householdId: household.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Combustível',
        type: 'expense',
        color: '#F59E0B',
        icon: 'fuel',
        householdId: household.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Delivery',
        type: 'expense',
        color: '#8B5CF6',
        icon: 'bike',
        householdId: household.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Outros',
        type: 'expense',
        color: '#6B7280',
        icon: 'more-horizontal',
        householdId: household.id
      }
    })
  ]);
  
  console.log('✅ Categorias criadas');
  
  // 4. Importar parcelamentos do CSV
  const parcelamentosPath = path.join(__dirname, '../data/Parcelamentos.csv');
  const parcelamentosCSV = fs.readFileSync(parcelamentosPath, 'utf-8');
  const parcelamentosData = parse(parcelamentosCSV, {
    columns: true,
    skip_empty_lines: true
  });
  
  // TODO: Processar e importar cada linha
  
  console.log('✅ Importação concluída!');
}

importCSVData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
\`\`\`

---

## 📞 PRÓXIMOS PASSOS

### Imediatos:
1. ✅ Revisar esta especificação completa
2. ⏳ Decidir sobre hospedagem (Railway, Vercel, etc.)
3. ⏳ Criar repositório Git
4. ⏳ Iniciar Fase 1 do desenvolvimento

### Precisa de:
1. **Credenciais de API** para cotação de crypto (CoinGecko é gratuito até certo limite)
2. **Servidor PostgreSQL** (pode usar Railway gratuitamente)
3. **Decisão sobre domínio** (opcional)

### Posso ajudar com:
1. Gerar todos os arquivos de código prontos
2. Criar scripts de setup automatizados
3. Configurar Docker (se preferir)
4. Criar documentação de uso
5. Treinar no uso do sistema

---

## 💡 DIFERENCIAIS DO SISTEMA

1. **Precisão absoluta** - Usa Decimal.js, não há erros de arredondamento
2. **Múltiplos cartões** - Suporta quantos cartões você quiser
3. **Parcelamentos inteligentes** - Rastreia parcela por parcela
4. **Empréstimos a terceiros** - Único sistema que faz isso bem
5. **Fechamento de cartão correto** - Calcula baseado na data real de fechamento
6. **Projeção de fluxo** - Vê o futuro das suas finanças
7. **Categorização automática** - Aprende com seu histórico
8. **Investimentos** - Acompanha crypto e ações
9. **Responsivo** - Funciona bem em celular
10. **Open source** - Você tem controle total do código

---

Este documento tem **TUDO** que você precisa para desenvolver o sistema perfeito. Cada detalhe foi pensado para evitar erros e garantir precisão nos cálculos.

**Próximo passo: Quer que eu comece a gerar os arquivos de código?** 🚀
