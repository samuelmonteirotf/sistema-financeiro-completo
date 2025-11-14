import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'dev.user+finance@example.com' }
  })

  if (!user) {
    console.log('❌ Usuário não encontrado!')
    return
  }

  console.log('✅ Usuário encontrado:', user.email)
  console.log('Hash armazenado:', user.password)

  // Testar senha
  const passwordTest1 = await bcrypt.compare('Nina123', user.password)
  console.log('\nTeste senha "Nina123":', passwordTest1 ? '✅ CORRETO' : '❌ INCORRETO')

  // Gerar novo hash para comparação
  const newHash = await bcrypt.hash('Nina123', 10)
  console.log('\nNovo hash gerado:', newHash)
  const testNewHash = await bcrypt.compare('Nina123', newHash)
  console.log('Teste com novo hash:', testNewHash ? '✅ CORRETO' : '❌ INCORRETO')
}

main().finally(() => prisma.$disconnect())
