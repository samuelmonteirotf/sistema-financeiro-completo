import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"
import { mergeAlertSettings, parseAlertSettings, serializeAlertSettings } from "@/lib/alert-settings"

type MarkInvoicePayload = {
  cardId: string
  referenceMonth: string // yyyy-MM
  paid: boolean
}

export async function POST(request: Request) {
  const maybeUser = await getUserIdOrUnauthorized()
  if (maybeUser instanceof NextResponse) return maybeUser
  const userId = maybeUser

  const body = (await request.json().catch(() => null)) as MarkInvoicePayload | null
  if (!body || typeof body.cardId !== "string" || typeof body.referenceMonth !== "string") {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const key = `${body.cardId}|${body.referenceMonth}`

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  const parsed = parseAlertSettings(settings?.alerts)
  const invoicePayments = { ...(parsed.invoicePayments ?? {}) }
  invoicePayments[key] = {
    paid: body.paid,
    paidAt: body.paid ? new Date().toISOString() : null,
  }

  const payload = mergeAlertSettings(parsed, { invoicePayments })
  const jsonPayload = serializeAlertSettings(payload)

  try {
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        alerts: jsonPayload,
      },
      update: {
        alerts: jsonPayload,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela UserSettings não encontrada. Execute as migrações do Prisma para habilitar este recurso." },
        { status: 500 },
      )
    }
    throw error
  }

  return NextResponse.json({ success: true })
}
