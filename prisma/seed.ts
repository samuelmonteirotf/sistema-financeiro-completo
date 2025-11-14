import { PrismaClient, Prisma } from '@prisma/client'
import type { Plan } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const REPORT_PATH = path.resolve(__dirname, '..', 'logs', 'seed-report.json')

type TenantType = 'pessoa_fisica' | 'familia' | 'microempresa' | 'demo'
type PlanSlug = 'free' | 'pro' | 'premium'

interface TenantConfig {
  key: TenantType
  label: string
  userCount: number
  cardCount: number
  expenseCount: number
  categoryCount: number
  loanCount?: number
  planSlug?: PlanSlug
  notes?: string
}

interface TenantSummary {
  tenant: string
  type: TenantType
  stats: {
    users: number
    cards: number
    expenses: number
    categories: number
    loans: number
  }
  users: Array<{
    id: string
    email: string
    name: string
    password: string
    plan: string
  }>
  notes?: string
}

const defaultPlans: Array<{
  name: string
  slug: PlanSlug
  price: number
  currency?: string
  period?: string
  limits: Record<string, number | boolean>
  features: string[]
}> = [
  {
    name: 'Free',
    slug: 'free',
    price: 0,
    limits: {
      maxExpensesPerMonth: 50,
      maxCards: 2,
      maxCategories: 10,
      maxLoans: 0,
      canUseInvestments: false,
      canUseLentMoney: false,
      canExportReports: false,
      canUseAdvancedReports: false,
      maxHouseholdMembers: 1,
    },
    features: ['basic_controls'],
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: 1990,
    limits: {
      maxExpensesPerMonth: 500,
      maxCards: 5,
      maxCategories: -1,
      maxLoans: 2,
      canUseInvestments: true,
      canUseLentMoney: false,
      canExportReports: false,
      canUseAdvancedReports: false,
      maxHouseholdMembers: 3,
    },
    features: ['pix', 'export_csv', 'reports_basic'],
  },
  {
    name: 'Premium',
    slug: 'premium',
    price: 3990,
    limits: {
      maxExpensesPerMonth: 2000,
      maxCards: 20,
      maxCategories: -1,
      maxLoans: 5,
      canUseInvestments: true,
      canUseLentMoney: true,
      canExportReports: true,
      canUseAdvancedReports: true,
      maxHouseholdMembers: 5,
    },
    features: ['team', 'export_csv', 'reports_advanced', 'priority_support'],
  },
]

const tenantBlueprints: TenantConfig[] = [
  {
    key: 'pessoa_fisica',
    label: 'Perfil Solo',
    userCount: 1,
    cardCount: 2,
    expenseCount: 10,
    categoryCount: 5,
    planSlug: 'free',
    notes: 'Usuário individual focado em controle diário.',
  },
  {
    key: 'familia',
    label: 'Família Silva',
    userCount: 3,
    cardCount: 5,
    expenseCount: 30,
    categoryCount: 7,
    planSlug: 'pro',
    notes: 'Família compartilhando orçamento doméstico.',
  },
  {
    key: 'microempresa',
    label: 'Microempresa Criativa',
    userCount: 2,
    cardCount: 10,
    expenseCount: 60,
    categoryCount: 8,
    loanCount: 3,
    planSlug: 'premium',
    notes: 'Equipe administrativa + financeiro com visão completa.',
  },
]

if (process.env.DEMO === 'true') {
  tenantBlueprints.push({
    key: 'demo',
    label: 'Tenant Demo Oficial',
    userCount: 1,
    cardCount: 3,
    expenseCount: 15,
    categoryCount: 6,
    planSlug: 'pro',
    notes: 'Tenant adicional habilitado em modo DEMO.',
  })
}

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'Nubank'] as const
const CATEGORY_POOL = [
  { name: 'Alimentação', icon: 'utensils' },
  { name: 'Transporte', icon: 'car' },
  { name: 'Educação', icon: 'book' },
  { name: 'Saúde', icon: 'heart' },
  { name: 'Investimentos', icon: 'trending-up' },
  { name: 'Tecnologia', icon: 'cpu' },
  { name: 'Moradia', icon: 'home' },
  { name: 'Lazer', icon: 'smile' },
  { name: 'Serviços', icon: 'settings' },
  { name: 'Marketing', icon: 'megaphone' },
]

const usedEmails = new Set<string>()

const seedReport: {
  generatedAt: string
  totals: {
    tenants: number
    users: number
    cards: number
    expenses: number
    loans: number
  }
  tenants: TenantSummary[]
} = {
  generatedAt: new Date().toISOString(),
  totals: {
    tenants: 0,
    users: 0,
    cards: 0,
    expenses: 0,
    loans: 0,
  },
  tenants: [],
}

function buildEmail(firstName: string, lastName: string, tenantKey: string) {
  let email: string
  do {
    const username = faker.internet
      .username({
        firstName,
        lastName,
      })
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    email = `${username}.${tenantKey}${faker.number.int({ min: 10, max: 9999 })}@example.com`
  } while (usedEmails.has(email))

  usedEmails.add(email)
  return email
}

function decimalAmount(min: number, max: number, dec = 2) {
  const value = Number(faker.finance.amount({ min, max, dec }))
  return new Prisma.Decimal(value.toFixed(dec))
}

async function upsertPlans() {
  const planMap: Record<PlanSlug, Plan> = {} as Record<PlanSlug, Plan>

  for (const plan of defaultPlans) {
    const record = await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        price: plan.price,
        currency: plan.currency ?? 'BRL',
        period: plan.period ?? 'month',
        limits: plan.limits,
        features: plan.features,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        currency: plan.currency ?? 'BRL',
        period: plan.period ?? 'month',
        limits: plan.limits,
        features: plan.features,
      },
    })
    planMap[plan.slug] = record
  }

  return planMap
}

async function createSubscription(userId: string, plan: Plan) {
  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'active',
    },
  })
}

async function createCategoriesForUsers(userIds: string[], tenantCode: string, count: number) {
  const map = new Map<string, { id: string }[]>()

  for (const userId of userIds) {
    const categories: { id: string }[] = []
    for (let i = 0; i < count; i++) {
      const base = faker.helpers.arrayElement(CATEGORY_POOL)
      const category = await prisma.category.create({
        data: {
          name: `${base.name} ${tenantCode.toUpperCase()}-${i + 1}`,
          type: 'expense',
          color: faker.color.rgb({ casing: 'lower', prefix: '#' }),
          icon: base.icon,
          ownerId: userId,
        },
      })
      categories.push({ id: category.id })
    }
    map.set(userId, categories)
  }

  return map
}

async function createCards(userIds: string[], totalCards: number) {
  const cards = []
  for (let i = 0; i < totalCards; i++) {
    const owner = faker.helpers.arrayElement(userIds)
    const brand = faker.helpers.arrayElement(CARD_BRANDS)
    const closingDay = faker.number.int({ min: 1, max: 25 })
    const dueDay = Math.min(30, closingDay + faker.number.int({ min: 3, max: 7 }))

    const card = await prisma.creditCard.create({
      data: {
        userId: owner,
        name: `${brand} ${faker.company.buzzNoun()}`,
        lastFourDigits: faker.string.numeric({ length: 4 }),
        brand,
        closingDay,
        dueDay,
        limit: decimalAmount(1000, 10000),
        isActive: true,
      },
    })
    cards.push(card)
  }
  return cards
}

async function createExpenses(
  userIds: string[],
  categoryMap: Map<string, { id: string }[]>,
  cards: { id: string; userId: string }[],
  count: number
) {
  const expenses = []
  const fallbackCategories = Array.from(categoryMap.values())[0] ?? []

  for (let i = 0; i < count; i++) {
    const userId = faker.helpers.arrayElement(userIds)
    const categories = categoryMap.get(userId) ?? fallbackCategories
    if (categories.length === 0) {
      continue
    }
    const category = faker.helpers.arrayElement(categories)
    const useCard = cards.length > 0 && Math.random() > 0.35
    const eligibleCards = cards.filter((card) => card.userId === userId)
    const creditCard = useCard
      ? eligibleCards.length > 0
        ? faker.helpers.arrayElement(eligibleCards)
        : faker.helpers.arrayElement(cards)
      : null

    const expense = await prisma.expense.create({
      data: {
        userId,
        description: faker.commerce.productName(),
        amount: decimalAmount(25, 3500),
        date: faker.date.recent({ days: 90 }),
        creditCardId: creditCard?.id,
        categoryId: category.id,
        installments: 1,
        observations: faker.commerce.productDescription().slice(0, 120),
      },
    })
    expenses.push(expense)
  }
  return expenses
}

async function createLoans(userIds: string[], count = 0) {
  const loans = []
  for (let i = 0; i < count; i++) {
    const userId = faker.helpers.arrayElement(userIds)
    const originalAmount = Number(faker.finance.amount({ min: 5000, max: 50000, dec: 2 }))
    const installmentMonths = faker.number.int({ min: 6, max: 36 })
    const monthlyPayment = originalAmount / installmentMonths
    const startDate = faker.date.past({ years: 1 })
    const loan = await prisma.loan.create({
      data: {
        userId,
        name: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
        lenderName: faker.company.name(),
        originalAmount: new Prisma.Decimal(originalAmount.toFixed(2)),
        currentBalance: new Prisma.Decimal((originalAmount * 0.7).toFixed(2)),
        interestRate: new Prisma.Decimal(faker.finance.amount({ min: 0.02, max: 0.15, dec: 4 })),
        monthlyPayment: new Prisma.Decimal(monthlyPayment.toFixed(2)),
        startDate,
        endDate: faker.date.future({ years: 2, refDate: startDate }),
        status: 'active',
      },
    })

    for (let paymentIndex = 0; paymentIndex < 2; paymentIndex++) {
      const paymentAmount = monthlyPayment
      await prisma.loanPayment.create({
        data: {
          loanId: loan.id,
          amount: new Prisma.Decimal(paymentAmount.toFixed(2)),
          principal: new Prisma.Decimal((paymentAmount * 0.8).toFixed(2)),
          interest: new Prisma.Decimal((paymentAmount * 0.2).toFixed(2)),
          date: faker.date.recent({ days: 120 }),
          isPaid: true,
          paidAt: faker.date.recent({ days: 60 }),
        },
      })
    }

    loans.push(loan)
  }
  return loans
}

async function seedTenant(config: TenantConfig, plans: Record<PlanSlug, Plan>, planList: Plan[]) {
  const tenantCode = faker.helpers.slugify(`${config.key}-${faker.word.adjective()}`).toLowerCase()
  const tenantName =
    config.key === 'microempresa'
      ? `${config.label} ${faker.company.name()}`
      : `${config.label} ${faker.location.city()}`

  console.log(`\n🏗️  Criando tenant ${tenantName} (${config.key})`)

  const userRecords: TenantSummary['users'] = []
  const createdUsers = []
  const sharedSurname = config.key === 'familia' ? faker.person.lastName() : undefined

  for (let i = 0; i < config.userCount; i++) {
    const firstName = faker.person.firstName()
    const lastName = sharedSurname ?? faker.person.lastName()
    const email =
      config.key === 'demo' ? 'demo@seurobo.app' : buildEmail(firstName, lastName, tenantCode)
    if (config.key === 'demo') {
      usedEmails.add(email)
    }
    const plainPassword =
      config.key === 'demo' ? 'Demo#1234' : faker.internet.password({ length: 12, memorable: false })
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
      },
    })

    const plan =
      (config.planSlug ? plans[config.planSlug] : faker.helpers.arrayElement(planList)) ??
      plans.free
    await createSubscription(user.id, plan)

    createdUsers.push(user)
    userRecords.push({
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      password: plainPassword,
      plan: plan.slug,
    })
  }

  const userIds = createdUsers.map((user) => user.id)
  const categories = await createCategoriesForUsers(userIds, tenantCode, config.categoryCount)
  const cards = await createCards(
    userIds,
    config.cardCount
  )
  const expenses = await createExpenses(
    userIds,
    categories,
    cards,
    config.expenseCount
  )
  const loans = await createLoans(
    userIds,
    config.loanCount ?? 0
  )

  const categoryCount = Array.from(categories.values()).reduce(
    (total, entries) => total + entries.length,
    0,
  )

  const summary: TenantSummary = {
    tenant: tenantName,
    type: config.key,
    stats: {
      users: createdUsers.length,
      cards: cards.length,
      expenses: expenses.length,
      categories: categoryCount,
      loans: loans.length,
    },
    users: userRecords,
    notes: config.notes,
  }

  seedReport.totals.tenants += 1
  seedReport.totals.users += summary.stats.users
  seedReport.totals.cards += summary.stats.cards
  seedReport.totals.expenses += summary.stats.expenses
  seedReport.totals.loans += summary.stats.loans
  seedReport.tenants.push(summary)
}

async function main() {
  console.log('🌱 Iniciando geração de dados fictícios...')
  const planMap = await upsertPlans()
  const planList = Object.values(planMap)

  for (const config of tenantBlueprints) {
    await seedTenant(config, planMap, planList)
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await fs.writeFile(REPORT_PATH, JSON.stringify(seedReport, null, 2), 'utf8')

  console.log('\n📄 Relatório salvo em logs/seed-report.json')
  console.table(
    seedReport.tenants.map((tenant) => ({
      Tenant: tenant.tenant,
      Tipo: tenant.type,
      Usuários: tenant.stats.users,
      Cartões: tenant.stats.cards,
      Despesas: tenant.stats.expenses,
      Empréstimos: tenant.stats.loans,
    }))
  )
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
