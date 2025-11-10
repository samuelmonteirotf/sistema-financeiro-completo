# ⚡ CHEAT SHEET - COMANDOS ESSENCIAIS

## 🚀 COMEÇAR (5 MINUTOS)

\`\`\`bash
# 1. Criar projeto
npx create-next-app@latest controle-financeiro --typescript --tailwind --app --use-npm
cd controle-financeiro

# 2. Instalar dependências essenciais
npm install prisma @prisma/client decimal.js date-fns zod @tanstack/react-table recharts next-auth react-hook-form @hookform/resolvers

# 3. Configurar shadcn/ui
npx shadcn-ui@latest init -y
npx shadcn-ui@latest add button card input label select dialog table tabs form calendar popover

# 4. Inicializar Prisma
npx prisma init

# 5. Git
git init && git add . && git commit -m "initial setup"
\`\`\`

---

## 📁 ESTRUTURA DE PASTAS

\`\`\`bash
mkdir -p app/{api,\(auth\),\(dashboard\)}
mkdir -p components/{ui,dashboard,expenses,cards,forms,charts,layout}
mkdir -p lib/{validations,utils,api,hooks}
mkdir -p types prisma
\`\`\`

---

## 🗄️ BANCO DE DADOS

\`\`\`bash
# Criar migration
npx prisma migrate dev --name nome

# Aplicar em produção
npx prisma migrate deploy

# Gerar client
npx prisma generate

# Studio (UI visual)
npx prisma studio

# Reset (CUIDADO!)
npx prisma migrate reset
\`\`\`

---

## 💻 DESENVOLVIMENTO

\`\`\`bash
# Rodar local
npm run dev

# Build
npm run build

# Produção
npm start

# Type check
npx tsc --noEmit
\`\`\`

---

## 🔐 .ENV.LOCAL

\`\`\`env
DATABASE_URL="postgresql://user:pass@localhost:5432/financeiro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
\`\`\`

---

## 📊 SCHEMA PRISMA (MÍNIMO VIÁVEL)

\`\`\`prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  password String
}

model Card {
  id         String  @id @default(cuid())
  name       String
  closingDay Int
  dueDay     Int
  limit      Decimal @db.Decimal(12, 2)
  expenses   Expense[]
}

model Expense {
  id          String   @id @default(cuid())
  description String
  amount      Decimal  @db.Decimal(12, 2)
  date        DateTime
  cardId      String
  card        Card     @relation(fields: [cardId], references: [id])
}
\`\`\`

---

## 🎨 COMPONENTE BÁSICO

\`\`\`typescript
// components/ExpenseForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Decimal from 'decimal.js'

const schema = z.object({
  description: z.string().min(1),
  amount: z.string().transform(val => new Decimal(val)),
  date: z.date(),
  cardId: z.string()
})

export function ExpenseForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  })
  
  const onSubmit = async (data: any) => {
    await fetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
\`\`\`

---

## 🔧 API ROUTE BÁSICA

\`\`\`typescript
// app/api/expenses/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'

export async function POST(request: Request) {
  const data = await request.json()
  
  const expense = await prisma.expense.create({
    data: {
      description: data.description,
      amount: new Decimal(data.amount),
      date: new Date(data.date),
      cardId: data.cardId
    }
  })
  
  return NextResponse.json(expense)
}
\`\`\`

---

## 💰 CÁLCULO DE FATURA

\`\`\`typescript
import Decimal from 'decimal.js'

export async function calculateInvoice(cardId: string, month: Date) {
  const card = await prisma.card.findUnique({ where: { id: cardId }})
  
  // Período da fatura
  const start = new Date(month.getFullYear(), month.getMonth() - 1, card.closingDay + 1)
  const end = new Date(month.getFullYear(), month.getMonth(), card.closingDay)
  
  // Buscar despesas
  const expenses = await prisma.expense.findMany({
    where: {
      cardId,
      date: { gte: start, lte: end }
    }
  })
  
  // Somar com Decimal.js
  const total = expenses.reduce(
    (sum, exp) => sum.plus(exp.amount.toString()),
    new Decimal(0)
  )
  
  return { total, expenses }
}
\`\`\`

---

## 📦 DEPLOY RAILWAY

\`\`\`bash
# 1. Login
railway login

# 2. Criar projeto
railway init

# 3. Adicionar PostgreSQL
railway add --plugin postgres

# 4. Deploy
railway up

# 5. Migrations
railway run npx prisma migrate deploy
\`\`\`

---

## 💾 BACKUP AUTOMÁTICO

\`\`\`bash
#!/bin/bash
# backup.sh

pg_dump -U postgres financeiro > backup_$(date +%Y%m%d).sql
gzip backup_$(date +%Y%m%d).sql

# Agendar com cron (diário às 2h)
# crontab -e
# 0 2 * * * /path/to/backup.sh
\`\`\`

---

## 🎯 ATALHOS ÚTEIS

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Rodar em desenvolvimento |
| `npm run build` | Build de produção |
| `npx prisma studio` | Abrir interface do banco |
| `npx prisma format` | Formatar schema.prisma |
| `git add . && git commit -m "msg"` | Commit rápido |

---

## 🚨 TROUBLESHOOTING

### Erro: "Cannot find module '@prisma/client'"
\`\`\`bash
npx prisma generate
\`\`\`

### Erro: "Invalid `prisma.xxx.create()` invocation"
\`\`\`bash
# Verificar se migrations foram aplicadas
npx prisma migrate dev
\`\`\`

### Erro: Decimal não funciona
\`\`\`typescript
// ERRADO
const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

// CERTO
import Decimal from 'decimal.js'
const total = expenses.reduce((sum, exp) => sum.plus(exp.amount.toString()), new Decimal(0))
\`\`\`

### Build falha em produção
\`\`\`bash
# Adicionar ao package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
\`\`\`

---

## 📚 LINKS RÁPIDOS

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Decimal.js:** https://mikemcl.github.io/decimal.js
- **Railway:** https://railway.app/docs

---

## ✅ CHECKLIST DE PRODUÇÃO

- [ ] Trocar NEXTAUTH_SECRET
- [ ] Configurar variáveis de ambiente
- [ ] Habilitar HTTPS
- [ ] Configurar backup automático
- [ ] Testar migrations em staging
- [ ] Configurar monitoramento (Sentry)
- [ ] Rate limiting
- [ ] Validação de inputs

---

## 🔥 PRIMEIRA FEATURE EM 30 MIN

\`\`\`bash
# 1. Criar modelo (prisma/schema.prisma)
model Card {
  id   String @id @default(cuid())
  name String
}

# 2. Migration
npx prisma migrate dev --name add_cards

# 3. API (app/api/cards/route.ts)
export async function GET() {
  const cards = await prisma.card.findMany()
  return NextResponse.json(cards)
}

# 4. Página (app/cards/page.tsx)
export default async function CardsPage() {
  const res = await fetch('/api/cards')
  const cards = await res.json()
  return <div>{cards.map(c => <div>{c.name}</div>)}</div>
}

# 5. Testar
npm run dev
# Acessar: http://localhost:3000/cards
\`\`\`

---

**Imprima esta página e deixe na sua mesa! 📄**

**Tempo para dominar:** 1 semana de uso intenso ⚡
