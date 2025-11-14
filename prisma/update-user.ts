import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Atualizando usuário...')

  const hashedPassword = await bcrypt.hash('SenhaFicticia123', 10)

  // Deletar usuário antigo se existir
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'admin@example.com' },
        { email: 'dev.user+finance@example.com' }
      ]
    }
  })

  // Criar novo usuário
  const user = await prisma.user.create({
    data: {
      email: 'dev.user+finance@example.com',
      name: 'Usuário Demo',
      password: hashedPassword,
    },
  })

  console.log('✅ Usuário criado:', user.email)

  // Atualizar todas as despesas, cartões, etc para este usuário
  await prisma.creditCard.updateMany({
    data: {
      userId: user.id
    }
  })

  await prisma.expense.updateMany({
    data: {
      userId: user.id
    }
  })

  await prisma.fixedExpense.updateMany({
    data: {
      userId: user.id
    }
  })

  console.log('✅ Todos os dados atualizados para o novo usuário')
  console.log('\n📝 Credenciais:')
  console.log('   Email: dev.user+finance@example.com')
  console.log('   Senha: SenhaFicticia123')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
