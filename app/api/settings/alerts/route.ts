"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"
import type { AlertPreference } from "@/types/alert-preferences"
import { DEFAULT_ALERT_PREFERENCES } from "@/lib/default-alert-preferences"
import { mergeAlertSettings, parseAlertSettings, serializeAlertSettings } from "@/lib/alert-settings"

export async function GET() {
  const maybeUser = await getUserIdOrUnauthorized()
  if (maybeUser instanceof NextResponse) {
    return maybeUser
  }

  const userId = maybeUser

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  const parsed = parseAlertSettings(settings?.alerts)
  return NextResponse.json(parsed.preferences ?? DEFAULT_ALERT_PREFERENCES)
}

export async function PUT(request: Request) {
  const maybeUser = await getUserIdOrUnauthorized()
  if (maybeUser instanceof NextResponse) {
    return maybeUser
  }

  const userId = maybeUser
  const body = await request.json().catch(() => null)

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  const existing = parseAlertSettings(settings?.alerts)
  const payload = mergeAlertSettings(existing, { preferences: body })

  const jsonPayload = serializeAlertSettings(payload)

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

  return NextResponse.json({ success: true })
}
