import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

let userSettingsTableKnown = false

async function userSettingsTableExists() {
  if (userSettingsTableKnown) return true
  try {
    const result = await prisma.$queryRaw<{ exists: string | null }[]>`
      SELECT table_name as exists
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'UserSettings'
      LIMIT 1
    `
    const exists = result?.[0]?.exists
    if (exists) {
      userSettingsTableKnown = true
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function findUserSettingsSafe(userId: string) {
  const exists = await userSettingsTableExists()
  if (!exists) {
    return null
  }

  try {
    return await prisma.userSettings.findUnique({
      where: { userId },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return null
    }
    throw error
  }
}
