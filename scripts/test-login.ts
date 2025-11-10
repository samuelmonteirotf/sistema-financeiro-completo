import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testando login...\n')

  const email = 'usuarioa@teste.com'
  const senha = 'senha123'

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.log('❌ Usuário não encontrado!')
    return
  }

  console.log('✅ Usuário encontrado:')
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Nome: ${user.name}`)
  console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
  console.log()

  // Testar senha
  console.log('🔐 Testando senha...')
  const passwordMatch = await bcrypt.compare(senha, user.password)

  if (passwordMatch) {
    console.log('✅ SENHA CORRETA!')
    console.log(`   A senha "${senha}" corresponde ao hash`)
  } else {
    console.log('❌ SENHA INCORRETA!')
    console.log(`   A senha "${senha}" NÃO corresponde ao hash`)
  }
  console.log()

  // Testar outros usuários
  console.log('📊 Todos os usuários no banco:')
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  for (const u of allUsers) {
    console.log(`   - ${u.email} (${u.name})`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
