import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Criando usuários de teste...\n')

  // Usuário A
  const hashedPasswordA = await bcrypt.hash('senha123', 10)
  const userA = await prisma.user.upsert({
    where: { email: 'usuarioa@teste.com' },
    update: {},
    create: {
      email: 'usuarioa@teste.com',
      name: 'Usuario A',
      password: hashedPasswordA,
    },
  })
  console.log('✅ Usuário A criado:')
  console.log(`   Email: usuarioa@teste.com`)
  console.log(`   Senha: senha123`)
  console.log(`   ID: ${userA.id}\n`)

  // Criar despesas para Usuário A
  const categoryA = await prisma.category.upsert({
    where: {
      name_type: {
        name: 'Alimentação',
        type: 'expense',
      },
    },
    update: {},
    create: {
      name: 'Alimentação',
      type: 'expense',
      color: '#FF6B6B',
      icon: 'utensils',
    },
  })

  await prisma.expense.createMany({
    data: [
      {
        userId: userA.id,
        description: 'Mercado do Usuário A',
        amount: 100.0,
        date: new Date(),
        categoryId: categoryA.id,
        installments: 1,
      },
      {
        userId: userA.id,
        description: 'Gasolina do Usuário A',
        amount: 200.0,
        date: new Date(),
        categoryId: categoryA.id,
        installments: 1,
      },
      {
        userId: userA.id,
        description: 'Farmácia do Usuário A',
        amount: 50.0,
        date: new Date(),
        categoryId: categoryA.id,
        installments: 1,
      },
    ],
    skipDuplicates: true,
  })
  console.log('💰 3 despesas criadas para Usuário A\n')

  // Usuário B
  const hashedPasswordB = await bcrypt.hash('senha456', 10)
  const userB = await prisma.user.upsert({
    where: { email: 'usuariob@teste.com' },
    update: {},
    create: {
      email: 'usuariob@teste.com',
      name: 'Usuario B',
      password: hashedPasswordB,
    },
  })
  console.log('✅ Usuário B criado:')
  console.log(`   Email: usuariob@teste.com`)
  console.log(`   Senha: senha456`)
  console.log(`   ID: ${userB.id}\n`)

  // Criar despesas para Usuário B
  await prisma.expense.createMany({
    data: [
      {
        userId: userB.id,
        description: 'Conta de Luz do B',
        amount: 300.0,
        date: new Date(),
        categoryId: categoryA.id,
        installments: 1,
      },
      {
        userId: userB.id,
        description: 'Internet do B',
        amount: 150.0,
        date: new Date(),
        categoryId: categoryA.id,
        installments: 1,
      },
      {
        userId: userB.id,
        description: 'Restaurante do B',
        amount: 80.0,
        date: new Date(),
        categoryId: categoryA.id,
        installments: 1,
      },
    ],
    skipDuplicates: true,
  })
  console.log('💰 3 despesas criadas para Usuário B\n')

  console.log('========================================')
  console.log('✅ USUÁRIOS DE TESTE CRIADOS COM SUCESSO!')
  console.log('========================================\n')

  console.log('📊 Resumo:')
  const countA = await prisma.expense.count({ where: { userId: userA.id } })
  const countB = await prisma.expense.count({ where: { userId: userB.id } })
  console.log(`   Usuário A: ${countA} despesas`)
  console.log(`   Usuário B: ${countB} despesas\n`)

  console.log('🔐 Para fazer login:')
  console.log('   http://localhost:3000/login\n')
  console.log('   Usuário A:')
  console.log('     Email: usuarioa@teste.com')
  console.log('     Senha: senha123\n')
  console.log('   Usuário B:')
  console.log('     Email: usuariob@teste.com')
  console.log('     Senha: senha456\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
