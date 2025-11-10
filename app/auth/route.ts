import { type NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json()

    if (action === "register") {
      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json({ error: "Usuário já existe" }, { status: 400 })
      }

      // Criar novo usuário
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        }
      })

      return NextResponse.json({
        success: true,
        message: "Usuário registrado com sucesso",
        user: { email: user.email, name: user.name }
      }, { status: 201 })
    }

    if (action === "login") {
      console.log('🔐 Tentativa de login:', email)

      // Buscar usuário no banco
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log('❌ Usuário não encontrado:', email)
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
      }

      console.log('✅ Usuário encontrado:', user.email)
      console.log('🔑 Testando senha...')

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password)
      console.log('🔑 Senha match:', passwordMatch)

      if (!passwordMatch) {
        console.log('❌ Senha incorreta para:', email)
        return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
      }

      console.log('✅ Login bem-sucedido:', user.email)
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }, { status: 200 })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
