import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('teste123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'teste@financeiro.com' },
    update: {},
    create: {
      email: 'teste@financeiro.com',
      name: 'Usuário Teste',
      password: hashedPassword,
    },
  })

  console.log('✅ Usuário criado:', user.email)

  // Criar categorias
  const categories = [
    { name: 'Alimentação', type: 'expense', color: '#FF6B6B', icon: 'utensils' },
    { name: 'Transporte', type: 'expense', color: '#4ECDC4', icon: 'car' },
    { name: 'Lazer', type: 'expense', color: '#95E1D3', icon: 'coffee' },
    { name: 'Saúde', type: 'expense', color: '#FFE66D', icon: 'heart' },
    { name: 'Moradia', type: 'expense', color: '#A8E6CF', icon: 'home' },
    { name: 'Educação', type: 'expense', color: '#FFD3B6', icon: 'book' },
    { name: 'Outros', type: 'expense', color: '#CCCCCC', icon: 'circle' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name_type: { name: category.name, type: category.type } },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categorias criadas:', categories.length)

  // Criar cartão de crédito de teste
  const card = await prisma.creditCard.create({
    data: {
      userId: user.id,
      name: 'Nubank',
      lastFourDigits: '1234',
      brand: 'Mastercard',
      closingDay: 10,
      dueDay: 17,
      limit: 5000.00,
      isActive: true,
    },
  })

  console.log('✅ Cartão criado:', card.name)

  // Criar despesas de exemplo
  const alimentacaoCategory = await prisma.category.findFirst({
    where: { name: 'Alimentação', type: 'expense' }
  })

  if (alimentacaoCategory) {
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        description: 'Supermercado',
        amount: 350.50,
        date: new Date(),
        creditCardId: card.id,
        categoryId: alimentacaoCategory.id,
        installments: 1,
      },
    })

    console.log('✅ Despesa criada:', expense.description)
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📝 Credenciais de teste:')
  console.log('   Email: teste@financeiro.com')
  console.log('   Senha: teste123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
