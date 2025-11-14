import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const prisma = new PrismaClient()
const REPORT_PATH = path.resolve(__dirname, '..', 'logs', 'seed-report.json')

async function clearDatabase() {
  console.log('🧹 Limpando tabelas...')
  await prisma.$transaction([
    prisma.limitHistory.deleteMany(),
    prisma.subscriptionHistory.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.plan.deleteMany(),
    prisma.budget.deleteMany(),
    prisma.installment.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.creditCard.deleteMany(),
    prisma.fixedExpense.deleteMany(),
    prisma.loanPayment.deleteMany(),
    prisma.loan.deleteMany(),
    prisma.investment.deleteMany(),
    prisma.income.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
  ])
}

function runSeed() {
  console.log('🌱 Executando novo seed...')
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' })
}

function printReport() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.warn('⚠️  Relatório de seed não encontrado.')
    return
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
  console.log('\n📊 Resumo após reset:')
  console.table(
    report.tenants?.map((tenant: any) => ({
      Tenant: tenant.tenant,
      Tipo: tenant.type,
      Usuários: tenant.stats.users,
      Despesas: tenant.stats.expenses,
      Cartões: tenant.stats.cards,
    })) ?? []
  )
}

async function main() {
  await clearDatabase()
  await prisma.$disconnect()
  runSeed()
  printReport()
}

main().catch((error) => {
  console.error('❌ Falha ao resetar seed:', error)
  process.exit(1)
})
