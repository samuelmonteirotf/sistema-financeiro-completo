import { Prisma } from "@prisma/client"
import type { AlertPreference } from "@/types/alert-preferences"
import { DEFAULT_ALERT_PREFERENCES } from "@/lib/default-alert-preferences"

export type InvoicePaymentStatus = {
  paid: boolean
  paidAt?: string | null
}

export type StoredAlertSettings = {
  preferences: AlertPreference[]
  readIds: string[]
  invoicePayments?: Record<string, InvoicePaymentStatus>
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")

const isPreferenceArray = (value: unknown): value is AlertPreference[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as AlertPreference).id === "string" &&
      typeof (item as AlertPreference).name === "string" &&
      typeof (item as AlertPreference).description === "string" &&
      typeof (item as AlertPreference).enabled === "boolean"
  )

const isInvoicePaymentsRecord = (value: unknown): value is Record<string, InvoicePaymentStatus> => {
  if (typeof value !== "object" || value === null) return false
  return Object.values(value).every((entry) => {
    if (typeof entry !== "object" || entry === null) return false
    return typeof (entry as InvoicePaymentStatus).paid === "boolean"
  })
}

export function parseAlertSettings(payload: unknown): StoredAlertSettings {
  if (!payload) {
    return { preferences: DEFAULT_ALERT_PREFERENCES, readIds: [], invoicePayments: {} }
  }

  if (isPreferenceArray(payload)) {
    return { preferences: payload, readIds: [], invoicePayments: {} }
  }

  if (typeof payload === "object" && payload !== null) {
    const maybePreferences = (payload as any).preferences
    const maybeReadIds = (payload as any).readIds
    const maybeInvoicePayments = (payload as any).invoicePayments

    return {
      preferences: isPreferenceArray(maybePreferences) ? maybePreferences : DEFAULT_ALERT_PREFERENCES,
      readIds: isStringArray(maybeReadIds) ? maybeReadIds : [],
      invoicePayments: isInvoicePaymentsRecord(maybeInvoicePayments) ? maybeInvoicePayments : {},
    }
  }

  return { preferences: DEFAULT_ALERT_PREFERENCES, readIds: [], invoicePayments: {} }
}

export function mergeAlertSettings(
  base: StoredAlertSettings,
  updates: Partial<StoredAlertSettings>
): StoredAlertSettings {
  return {
    preferences: updates.preferences ?? base.preferences,
    readIds: updates.readIds ?? base.readIds,
    invoicePayments: updates.invoicePayments ?? base.invoicePayments,
  }
}

export function serializeAlertSettings(settings: StoredAlertSettings): Prisma.JsonObject {
  const payload: Record<string, unknown> = {
    preferences: settings.preferences.map((pref) => ({ ...pref })),
    readIds: [...settings.readIds],
  }

  if (settings.invoicePayments) {
    payload.invoicePayments = Object.fromEntries(
      Object.entries(settings.invoicePayments).map(([key, value]) => [
        key,
        { paid: value.paid, paidAt: value.paidAt ?? null },
      ])
    )
  }

  return payload as Prisma.JsonObject
}
