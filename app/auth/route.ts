import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { ensureDefaultCategories } from "@/lib/default-categories"

const MIN_PASSWORD_LENGTH = 6

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Payload inválido" }, { status: 400 })
    }

    const action = typeof body.action === "string" ? body.action.trim().toLowerCase() : ""

    if (action !== "register") {
      return NextResponse.json({ success: false, error: "Ação não suportada" }, { status: 400 })
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    if (!email.includes("@") || email.length < 5) {
      return NextResponse.json({ success: false, error: "Email inválido" }, { status: 400 })
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres` },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Usuário já existe" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    await ensureDefaultCategories(user.id)

    return NextResponse.json(
      {
        success: true,
        message: "Usuário registrado com sucesso",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error("Erro ao conectar ao banco de dados", error)
      return NextResponse.json(
        {
          success: false,
          error: "Banco de dados indisponível. Confirme se o PostgreSQL está rodando (ex: docker compose up -d).",
        },
        { status: 503 }
      )
    }

    console.error("Erro ao registrar usuário", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
