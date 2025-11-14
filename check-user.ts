import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'dev.user+finance@example.com' }
  })

  if (user) {
    console.log('✅ Usuário encontrado no banco:')
    console.log('   ID:', user.id)
    console.log('   Email:', user.email)
    console.log('   Nome:', user.name)
    console.log('   Password hash:', user.password.substring(0, 20) + '...')
  } else {
    console.log('❌ Usuário NÃO encontrado no banco!')
  }
}

main().finally(() => prisma.$disconnect())
