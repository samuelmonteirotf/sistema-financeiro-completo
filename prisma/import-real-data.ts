import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Mapear meses para datas
const MONTHS_2025 = {
  'dezembro': new Date(2024, 11, 15), // Dezembro 2024
  'janeiro': new Date(2025, 0, 15),
  'fevereiro': new Date(2025, 1, 15),
  'março': new Date(2025, 2, 15),
  'abril': new Date(2025, 3, 15),
  'maio': new Date(2025, 4, 15),
  'junho': new Date(2025, 5, 15),
  'julho': new Date(2025, 6, 15),
  'agosto': new Date(2025, 7, 15),
  'setembro': new Date(2025, 8, 15),
  'outubro': new Date(2025, 9, 15),
  'novembro': new Date(2025, 10, 15),
}

const MONTH_NAME_TO_INDEX: Record<string, number> = {
  'janeiro': 0,
  'fevereiro': 1,
  'março': 2,
  'abril': 3,
  'maio': 4,
  'junho': 5,
  'julho': 6,
  'agosto': 7,
  'setembro': 8,
  'outubro': 9,
  'novembro': 10,
  'dezembro': 11,
}

function parseValue(value: string): number {
  if (!value) return 0

  let sanitized = value.replace(/"/g, '').replace(/\s/g, '').replace(/R\$/gi, '').replace(/\$/g, '')

  if (sanitized.includes(',') && sanitized.includes('.')) {
    sanitized = sanitized.replace(/\./g, '')
  }

  if (sanitized.includes(',') && !sanitized.includes('.')) {
    sanitized = sanitized.replace(',', '.')
  }

  sanitized = sanitized.replace(/[^0-9.-]/g, '')

  const num = Number.parseFloat(sanitized)
  return Number.isNaN(num) ? 0 : Math.abs(num) // Sempre positivo
}

async function main() {
  console.log('🚀 Iniciando importação COMPLETA dos dados reais...\n')

  // Limpar dados antigos
  console.log('🧹 Limpando dados antigos...')
  await prisma.installment.deleteMany({})
  await prisma.expense.deleteMany({})
  await prisma.fixedExpense.deleteMany({})
  await prisma.loan.deleteMany({})
  await prisma.income.deleteMany({})
  await prisma.investment.deleteMany({})
  await prisma.creditCard.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('✅ Dados antigos removidos\n')

  // Criar usuário (usa variáveis de ambiente para segurança)
  const userEmail = process.env.IMPORT_USER_EMAIL || 'usuario@exemplo.com'
  const userPassword = process.env.IMPORT_USER_PASSWORD || 'senha123'
  const userName = process.env.IMPORT_USER_NAME || 'Usuário Teste'

  if (!process.env.IMPORT_USER_EMAIL || !process.env.IMPORT_USER_PASSWORD) {
    console.warn('⚠️  AVISO: Usando credenciais padrão. Configure IMPORT_USER_EMAIL e IMPORT_USER_PASSWORD no .env\n')
  }

  const hashedPassword = await bcrypt.hash(userPassword, 10)
  const user = await prisma.user.create({
    data: {
      email: userEmail,
      name: userName,
      password: hashedPassword,
    },
  })
  console.log('✅ Usuário criado:', user.email, '\n')

  // Criar categorias
  const categoriesData = [
    { name: 'Alimentação', type: 'expense', color: '#FF6B6B', icon: 'utensils' },
    { name: 'Farmácia', type: 'expense', color: '#4ECDC4', icon: 'pill' },
    { name: 'Combustível', type: 'expense', color: '#95E1D3', icon: 'fuel' },
    { name: 'Delivery', type: 'expense', color: '#FFE66D', icon: 'truck' },
    { name: 'Moradia', type: 'expense', color: '#A8E6CF', icon: 'home' },
    { name: 'Saúde', type: 'expense', color: '#FFD3B6', icon: 'heart' },
    { name: 'Parcelamentos', type: 'expense', color: '#FFAAA5', icon: 'credit-card' },
    { name: 'Outros', type: 'expense', color: '#CCCCCC', icon: 'circle' },
  ]

  const categories: any = {}
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        ...cat,
        ownerId: user.id,
      },
    })
    categories[cat.name] = created
  }
  console.log('✅ Categorias criadas:', categoriesData.length, '\n')

  // Criar cartão C6
  const card = await prisma.creditCard.create({
    data: {
      userId: user.id,
      name: 'C6 Bank',
      lastFourDigits: '0000',
      brand: 'Mastercard',
      closingDay: 10,
      dueDay: 17,
      limit: 50000.00,
      isActive: true,
    },
  })
  console.log('✅ Cartão criado:', card.name, '\n')

  // ========================================
  // IMPORTAR DESPESAS FIXAS
  // ========================================
  console.log('📊 Importando DESPESAS FIXAS...')
  const fixasPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Despesas_fixas.csv')
  const fixasContent = fs.readFileSync(fixasPath, 'utf-8')
  const fixasRecords = parse(fixasContent, { skip_empty_lines: true })

  let fixasCount = 0
  for (let i = 7; i < fixasRecords.length; i++) {
    const row = fixasRecords[i]
    const description = row[0]?.trim()

    if (!description || description === '' || description.includes('Total') || description.includes('Despesas')) {
      continue
    }

    // Pegar primeiro valor disponível
    let amount = 0
    for (let col = 1; col < 13; col++) {
      const val = parseValue(row[col])
      if (val > 0) {
        amount = val
        break
      }
    }

    if (amount > 0) {
      await prisma.fixedExpense.create({
        data: {
          userId: user.id,
          description,
          amount,
          category: 'Moradia',
          dueDay: 10,
          frequency: 'monthly',
          isActive: true,
        },
      })
      fixasCount++
    }
  }
  console.log(`✅ Despesas fixas importadas: ${fixasCount}\n`)

  // ========================================
  // IMPORTAR DESPESAS COTIDIANAS
  // ========================================
  console.log('📊 Importando DESPESAS COTIDIANAS...')
  const cotidianasPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Despesas_Cotidianas.csv')
  const cotidianasContent = fs.readFileSync(cotidianasPath, 'utf-8')
  const cotidianasRecords = parse(cotidianasContent, { skip_empty_lines: true })

  // Linha 2 tem os meses
  const monthsRow = cotidianasRecords[2]
  const monthNames = monthsRow.slice(1, 13) // colunas 1-12

  let cotidianasCount = 0
  let currentCategory = 'Outros'

  for (let i = 17; i < cotidianasRecords.length; i++) {
    const row = cotidianasRecords[i]
    const firstCol = row[0]?.trim()

    if (!firstCol) continue

    // Detectar categoria
    if (firstCol.includes('Alimentação')) {
      currentCategory = 'Alimentação'
      continue
    } else if (firstCol.includes('Farmácia')) {
      currentCategory = 'Farmácia'
      continue
    } else if (firstCol.includes('Combustível')) {
      currentCategory = 'Combustível'
      continue
    } else if (firstCol.includes('Delivery')) {
      currentCategory = 'Delivery'
      continue
    } else if (firstCol.includes('Outros')) {
      currentCategory = 'Outros'
      continue
    }

    // Pular linhas de total e subtotal
    if (firstCol.includes('total') || firstCol.includes('Total')) continue

    const description = firstCol

    // Processar cada mês
    for (let col = 1; col <= 12; col++) {
      const value = parseValue(row[col])
      if (value > 0) {
        const monthName = monthNames[col - 1]?.toLowerCase().trim()
        const date = MONTHS_2025[monthName as keyof typeof MONTHS_2025]

        if (date && categories[currentCategory]) {
          await prisma.expense.create({
            data: {
              userId: user.id,
              creditCardId: card.id,
              description,
              amount: value,
              date,
              categoryId: categories[currentCategory].id,
              installments: 1,
            },
          })
          cotidianasCount++
        }
      }
    }
  }
  console.log(`✅ Despesas cotidianas importadas: ${cotidianasCount}\n`)

  // ========================================
  // IMPORTAR PARCELAMENTOS
  // ========================================
  console.log('📊 Importando PARCELAMENTOS...')
  const parcelamentosPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Parcelamentos.csv')
  const parcelamentosContent = fs.readFileSync(parcelamentosPath, 'utf-8')
  const parcelamentosRecords = parse(parcelamentosContent, { skip_empty_lines: true })

  let parcelamentosCount = 0
  for (let i = 7; i < parcelamentosRecords.length; i++) {
    const row = parcelamentosRecords[i]
    const description = row[0]?.trim()

    if (!description || description === '' || description.includes('Total')) continue

    // Contar quantos meses têm valor
    let installments = 0
    const amounts: number[] = []
    for (let col = 1; col <= 25; col++) {
      const val = parseValue(row[col])
      if (val > 0) {
        installments++
        amounts.push(val)
      }
    }

    if (installments > 0 && categories['Parcelamentos']) {
      // Calcular total CORRETO: soma de todas as parcelas
      const totalAmount = amounts.reduce((sum, val) => sum + val, 0)
      const firstMonth = Object.values(MONTHS_2025)[0] // Dezembro 2024

      const expense = await prisma.expense.create({
        data: {
          userId: user.id,
          creditCardId: card.id,
          description,
          amount: totalAmount,
          date: firstMonth,
          categoryId: categories['Parcelamentos'].id,
          installments,
        },
      })

      // Criar cada parcela
      for (let i = 0; i < installments && i < amounts.length; i++) {
        const monthDate = new Date(firstMonth)
        monthDate.setMonth(monthDate.getMonth() + i)

        // Marcar como pago apenas se a data de vencimento já passou
        const isPaid = monthDate < new Date()

        await prisma.installment.create({
          data: {
            expenseId: expense.id,
            creditCardId: card.id,
            installmentNumber: i + 1,
            dueDate: monthDate,
            amount: amounts[i],
            isPaid,
            paidAt: isPaid ? monthDate : null,
          },
        })
      }

      parcelamentosCount++
    }
  }
  console.log(`✅ Parcelamentos importados: ${parcelamentosCount}\n`)

  // ========================================
  // IMPORTAR EMPRÉSTIMOS
  // ========================================
  console.log('📊 Importando EMPRÉSTIMOS...')
  const emprestimosPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Empréstimos_e_financiamentos.csv')
  const emprestimosContent = fs.readFileSync(emprestimosPath, 'utf-8')
  const emprestimosRecords = parse(emprestimosContent, { skip_empty_lines: true })

  let emprestimosCount = 0
  for (let i = 1; i < Math.min(emprestimosRecords.length, 10); i++) {
    const row = emprestimosRecords[i]
    const description = row[0]?.trim()

    if (!description || description === '' || description.includes('Total')) continue

    const firstValue = parseValue(row[1])
    if (firstValue > 0) {
      await prisma.loan.create({
        data: {
          userId: user.id,
          name: description,
          lenderName: 'Banco',
          originalAmount: firstValue * 12, // Estimativa
          currentBalance: firstValue * 6,
          interestRate: 0.0199,
          monthlyPayment: firstValue,
          startDate: new Date(2024, 11, 1),
          endDate: new Date(2025, 11, 31),
          status: 'active',
        },
      })
      emprestimosCount++
    }
  }
  console.log(`✅ Empréstimos importados: ${emprestimosCount}\n`)

  // ========================================
  // IMPORTAR INVESTIMENTOS (CRIPTOMOEDAS)
  // ========================================
  console.log('📊 Importando INVESTIMENTOS...')
  const cryptoPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Cryptos.csv')
  const cryptoContent = fs.readFileSync(cryptoPath, 'utf-8')
  const cryptoRecords = parse(cryptoContent, { skip_empty_lines: false })

  let investmentsCount = 0
  for (const row of cryptoRecords) {
    const symbolRaw = row[0]?.trim()
    const nameRaw = row[1]?.trim()

    if (!symbolRaw || !nameRaw) {
      continue
    }

    const normalizedSymbol = symbolRaw.toLowerCase()
    if (normalizedSymbol === 'total' || normalizedSymbol === 'taxas:' || normalizedSymbol === 'taxas' || normalizedSymbol === '0') {
      continue
    }

    const purchasePrice = parseValue(row[2])
    const investedAmount = parseValue(row[4])
    const currentValue = parseValue(row[5])

    if (currentValue <= 0 && investedAmount <= 0) {
      continue
    }

    const purchaseDate = new Date(2024, 11, 1) // Dezembro 2024

    await prisma.investment.create({
      data: {
        userId: user.id,
        name: `${nameRaw} (${symbolRaw})`,
        type: 'Criptomoeda',
        amount: investedAmount > 0 ? investedAmount : currentValue,
        currentValue: currentValue > 0 ? currentValue : investedAmount,
        purchasePrice: purchasePrice > 0 ? purchasePrice : investedAmount,
        purchaseDate,
        status: 'active'
      }
    })

    investmentsCount++
  }
  console.log(`✅ Investimentos importados: ${investmentsCount}\n`)

  // ========================================
  // IMPORTAR PROVENTOS (RECEITAS)
  // ========================================
  console.log('📊 Importando PROVENTOS...')
  const proventosPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Despesas_e_Proventos_totais.csv')
  const proventosContent = fs.readFileSync(proventosPath, 'utf-8')
  const proventosRecords = parse(proventosContent, { skip_empty_lines: false })

  const periodRow = proventosRecords.find(row => row[0]?.toLowerCase().includes('período'))
  const proventosRow = proventosRecords.find(row => row[0]?.toLowerCase().includes('proventos'))

  let proventosCount = 0
  if (periodRow && proventosRow) {
    const monthColumns = periodRow.slice(1)

    for (let index = 0; index < monthColumns.length; index++) {
      const monthValue = monthColumns[index]
      const monthName = monthValue?.toLowerCase().trim()
      if (!monthName) continue

      const date = MONTHS_2025[monthName as keyof typeof MONTHS_2025]
      if (!date) continue

      const amount = parseValue(proventosRow[index + 1])
      if (amount <= 0) continue

      const formattedLabel = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).format(date)

      try {
        await prisma.income.create({
          data: {
            userId: user.id,
            description: `Proventos - ${formattedLabel}`,
            amount,
            date
          }
        })
        proventosCount++
      } catch (error) {
        console.warn(`Não foi possível importar provento para ${formattedLabel}:`, error)
      }
    }
  }
  console.log(`✅ Proventos importados: ${proventosCount}\n`)

  // Resumo final
  const totalExpenses = await prisma.expense.count()
  const totalFixed = await prisma.fixedExpense.count()
  const totalInstallments = await prisma.installment.count()
  const totalLoans = await prisma.loan.count()
  const totalIncomes = await prisma.income.count()
  const totalInvestments = await prisma.investment.count()

  console.log('\n🎉 IMPORTAÇÃO COMPLETA!')
  console.log('=' .repeat(50))
  console.log('📊 RESUMO DOS DADOS:')
  console.log(`   👤 Usuário: ${user.email}`)
  console.log(`   💳 Cartões: 1`)
  console.log(`   📁 Categorias: ${Object.keys(categories).length}`)
  console.log(`   💰 Despesas: ${totalExpenses}`)
  console.log(`   🔄 Despesas Fixas: ${totalFixed}`)
  console.log(`   📦 Parcelas: ${totalInstallments}`)
  console.log(`   🏦 Empréstimos: ${totalLoans}`)
  console.log(`   💵 Receitas: ${totalIncomes}`)
  console.log(`   📈 Investimentos: ${totalInvestments}`)
  console.log('=' .repeat(50))
  console.log('\n✅ Todos os seus dados reais foram importados!')
  console.log('\n📝 Credenciais:')
  console.log('   Email: dev.user+finance@example.com')
  console.log('   Senha: <SEGREDO>')
}

main()
  .catch((e) => {
    console.error('❌ Erro na importação:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
