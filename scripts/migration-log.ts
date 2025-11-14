import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOG_PATH = path.resolve(__dirname, '..', 'logs', 'migrate-subscription.json')
const status = process.argv[2] ?? 'start'
const migrationName = process.argv[3] ?? process.env.MIGRATION_NAME ?? 'add_subscription_schema'

interface MigrationEntry {
  timestamp: string
  migration: string
  result: 'ok' | 'error'
}

async function readLog(): Promise<MigrationEntry[]> {
  try {
    const data = await fs.readFile(LOG_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error: unknown) {
    return []
  }
}

async function writeLog(entries: MigrationEntry[]) {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true })
  await fs.writeFile(LOG_PATH, JSON.stringify(entries, null, 2), 'utf8')
}

async function main() {
  const entries = await readLog()
  if (status === 'ok') {
    const lastEntry = [...entries].reverse().find((entry) => entry.migration === migrationName)
    if (lastEntry) {
      lastEntry.result = 'ok'
      await writeLog(entries)
      return
    }
  }

  entries.push({
    timestamp: new Date().toISOString(),
    migration: migrationName,
    result: status === 'ok' ? 'ok' : 'error',
  })
  await writeLog(entries)
}

main().catch((error) => {
  console.error('Erro ao registrar migração:', error)
  process.exit(1)
})
