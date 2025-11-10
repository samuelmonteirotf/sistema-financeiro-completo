import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando importação dos dados reais...\n')

  // Criar usuário
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@financeiro.com' },
    update: {},
    create: {
      email: 'admin@financeiro.com',
      name: 'Administrador',
      password: hashedPassword,
    },
  })
  console.log('✅ Usuário criado:', user.email)

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

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name_type: { name: cat.name, type: cat.type } },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categorias criadas:', categoriesData.length)

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
  console.log('✅ Cartão criado:', card.name)

  // Importar Despesas Fixas
  console.log('\n📊 Importando Despesas Fixas...')
  const fixasPath = path.join(process.cwd(), 'dados', 'Movimentação financeira 2025.xlsx - Despesas_fixas.csv')
  const fixasContent = fs.readFileSync(fixasPath, 'utf-8')
  const fixasRecords = parse(fixasContent, { skip_empty_lines: true })

  let fixasCount = 0
  for (let i = 6; i < fixasRecords.length; i++) {
    const row = fixasRecords[i]
    const description = row[0]?.trim()

    if (!description || description === '' || description.includes('Total') || description.includes('Despesas')) {
      continue
    }

    // Pegar valor do primeiro mês disponível (coluna 1 = dezembro)
    let amount = 0
    for (let col = 1; col < row.length; col++) {
      const valueStr = row[col]?.replace(',', '.').replace('-', '').trim()
      if (valueStr && !isNaN(parseFloat(valueStr))) {
        amount = Math.abs(parseFloat(valueStr))
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
  console.log(`✅ Despesas fixas importadas: ${fixasCount}`)

  // Criar algumas despesas de exemplo dos últimos meses
  console.log('\n📊 Criando despesas de exemplo...')

  const categories = await prisma.category.findMany()
  const alimentacaoCategory = categories.find(c => c.name === 'Alimentação')
  const combustivelCategory = categories.find(c => c.name === 'Combustível')
  const deliveryCategory = categories.find(c => c.name === 'Delivery')
  const outrosCategory = categories.find(c => c.name === 'Outros')

  // Despesas de Outubro 2025
  const despesasExemplo = [
    {
      description: 'Supermercado Extra',
      amount: 458.90,
      date: new Date(2025, 9, 5), // Outubro
      categoryId: alimentacaoCategory?.id,
    },
    {
      description: 'Posto Ipiranga',
      amount: 250.00,
      date: new Date(2025, 9, 12),
      categoryId: combustivelCategory?.id,
    },
    {
      description: 'iFood - Almoço',
      amount: 89.50,
      date: new Date(2025, 9, 15),
      categoryId: deliveryCategory?.id,
    },
    {
      description: 'Mercado Livre',
      amount: 149.90,
      date: new Date(2025, 9, 20),
      categoryId: outrosCategory?.id,
      installments: 3,
    },
    {
      description: 'Farmácia Drogaria',
      amount: 87.30,
      date: new Date(2025, 9, 25),
      categoryId: categories.find(c => c.name === 'Farmácia')?.id,
    },
  ]

  for (const desp of despesasExemplo) {
    if (desp.categoryId) {
      const expense = await prisma.expense.create({
        data: {
          userId: user.id,
          creditCardId: card.id,
          description: desp.description,
          amount: desp.amount,
          date: desp.date,
          categoryId: desp.categoryId,
          installments: desp.installments || 1,
        },
      })

      // Criar parcelas se for parcelado
      if (desp.installments && desp.installments > 1) {
        const installmentAmount = desp.amount / desp.installments
        for (let i = 0; i < desp.installments; i++) {
          const dueDate = new Date(desp.date)
          dueDate.setMonth(dueDate.getMonth() + i)

          await prisma.installment.create({
            data: {
              expenseId: expense.id,
              creditCardId: card.id,
              installmentNumber: i + 1,
              dueDate,
              amount: installmentAmount,
              isPaid: i === 0, // Primeira parcela já paga
            },
          })
        }
      }
    }
  }
  console.log(`✅ Despesas de exemplo criadas: ${despesasExemplo.length}`)

  console.log('\n🎉 Importação concluída com sucesso!')
  console.log('\n📝 Credenciais de acesso:')
  console.log('   Email: admin@financeiro.com')
  console.log('   Senha: admin123')
  console.log('\n🚀 Execute: npm run dev')
}

main()
  .catch((e) => {
    console.error('❌ Erro na importação:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
