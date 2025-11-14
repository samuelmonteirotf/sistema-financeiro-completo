import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdOrUnauthorized } from "@/lib/auth-utils"
import { mergeAlertSettings, parseAlertSettings, serializeAlertSettings } from "@/lib/alert-settings"
import { DEFAULT_ALERT_PREFERENCES } from "@/lib/default-alert-preferences"

type MarkReadPayload =
  | { alertId: string; markRead?: boolean }
  | { alertIds: string[]; markRead?: boolean }

export async function POST(request: Request) {
  const maybeUser = await getUserIdOrUnauthorized()
  if (maybeUser instanceof NextResponse) return maybeUser

  const userId = maybeUser
  const body = (await request.json().catch(() => null)) as MarkReadPayload | null

  if (!body) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const ids =
    "alertIds" in body
      ? body.alertIds?.filter((id) => typeof id === "string")
      : body.alertId
        ? [body.alertId]
        : []

  if (!ids.length) {
    return NextResponse.json({ error: "Nenhum alerta informado" }, { status: 400 })
  }

  const markRead = body.markRead !== false

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  const parsed = parseAlertSettings(settings?.alerts)
  const readSet = new Set(parsed.readIds)

  if (markRead) {
    ids.forEach((id) => readSet.add(id))
  } else {
    ids.forEach((id) => readSet.delete(id))
  }

  const payload = mergeAlertSettings(parsed, {
    readIds: Array.from(readSet),
    preferences: parsed.preferences?.length ? parsed.preferences : DEFAULT_ALERT_PREFERENCES,
  })

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

  return NextResponse.json({ success: true, readIds: payload.readIds })
}
