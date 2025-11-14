import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

type Severity = 'low' | 'medium' | 'high'

interface PatternDefinition {
  name: string
  regex: RegExp
  description: string
  severity: Severity
  autoRedact?: boolean
  filter?: (match: string) => boolean
}

interface Finding {
  file: string
  line: number
  match: string
  pattern: string
  severity: Severity
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const REPORT_PATH = path.join(ROOT_DIR, 'logs', 'auditoria-lgpd-report.json')
const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  '.turbo',
  '.vercel',
  'dist',
  'coverage',
])

const SAFE_EMAIL_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'example.br',
  'test.com',
  'teste.com',
  'empresa.com',
  'empresa.com.br',
  'financeiro.com',
  'financeiro.com.br',
  'sistemafinanceiro.com',
  'sistemafinanceiro.com.br',
  'seurobo.app',
]

const SAFE_EMAIL_KEYWORDS = [
  'seu-email',
  'seuemail',
  'usuario',
  'user',
  'contato',
  'suporte',
  'dev',
  'teste',
  'fake',
]

const SAFE_ENDPOINT_HOSTS = new Set([
  'min-api.cryptocompare.com',
  'api.stripe.com',
  'hooks.stripe.com',
  'data-api.binance.vision',
  'api.exchangerate-api.com',
  'api.coingecko.com',
])

const PATTERNS: PatternDefinition[] = [
  {
    name: 'CPF',
    regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
    description: 'Formato de CPF brasileiro (xxx.xxx.xxx-xx)',
    severity: 'high',
    autoRedact: true,
  },
  {
    name: 'RG',
    regex: /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g,
    description: 'Formato clássico de RG',
    severity: 'high',
    autoRedact: true,
  },
  {
    name: 'Email',
    regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    description: 'Endereços de e-mail',
    severity: 'medium',
    autoRedact: true,
    filter: (match) => {
      const value = match.toLowerCase()
      const [local, domain] = value.split('@')
      if (!domain) return true
      if (value.includes('local')) return false
      if (local.includes('{{')) return false
      if (SAFE_EMAIL_DOMAINS.some((safeDomain) => domain === safeDomain || domain.endsWith(`.${safeDomain}`))) {
        return false
      }
      if (domain.includes('example') || domain.includes('exemplo')) {
        return false
      }
      if (SAFE_EMAIL_KEYWORDS.some((keyword) => local.includes(keyword))) {
        return false
      }
      return true
    },
  },
  {
    name: 'Stripe Keys',
    regex: /(sk_live_[0-9a-zA-Z]+|pk_live_[0-9a-zA-Z]+)/g,
    description: 'Chaves reais do Stripe',
    severity: 'high',
    autoRedact: true,
  },
  {
    name: 'Google API Keys',
    regex: /(AIza[0-9A-Za-z-_]{35})/g,
    description: 'Chaves da API do Google',
    severity: 'high',
    autoRedact: true,
  },
  {
    name: 'GitHub Tokens',
    regex: /(ghp_[0-9A-Za-z]{36,})/g,
    description: 'Tokens pessoais do GitHub',
    severity: 'high',
    autoRedact: true,
  },
  {
    name: 'Bearer Tokens',
    regex: /(Bearer\s+[A-Za-z0-9\-._~+/=]{20,})/g,
    description: 'Tokens do tipo Bearer',
    severity: 'medium',
    autoRedact: true,
  },
  {
    name: 'Hardcoded Password',
    regex: /\b(password|senha)\b\s*[:=]\s*['"][^'"]+['"]/gi,
    description: 'Senhas hardcoded em strings',
    severity: 'high',
    autoRedact: false,
    filter: (match) => {
      const normalized = match.toLowerCase()
      if (normalized.includes('placeholder') || normalized.includes('<senha')) {
        return false
      }
      return true
    },
  },
  {
    name: 'External Endpoint',
    regex: /https?:\/\/(api|hooks|webhook|storage|s3|files)\.[^\s"'`]+/gi,
    description: 'Endpoints externos que podem apontar para APIs privadas',
    severity: 'low',
    filter: (match) => {
      const sanitized = match
        .replace(/['"`<>]/g, '')
        .replace(/[),.;]+$/, '')
      try {
        const url = new URL(sanitized)
        return !SAFE_ENDPOINT_HOSTS.has(url.hostname)
      } catch {
        return true
      }
    },
  },
]

async function ensureReportDir() {
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true })
}

async function readFileSafely(filePath: string) {
  const buffer = await fs.readFile(filePath)
  const hasBinary = buffer.includes(0)
  if (hasBinary) {
    return null
  }

  return buffer.toString('utf8')
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue
    if (entry.name.startsWith('.DS_')) continue

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files
}

function maskMatch(value: string) {
  if (value.length <= 6) return value
  return `${value.slice(0, 3)}***${value.slice(-3)}`
}

async function scanFile(filePath: string): Promise<{ findings: Finding[]; sanitizedContent?: string }> {
  const content = await readFileSafely(filePath)
  if (content === null) {
    return { findings: [] }
  }

  const relativePath = path.relative(ROOT_DIR, filePath) || path.basename(filePath)
  const lines = content.split(/\r?\n/)
  const findings: Finding[] = []
  let sanitizedContent: string | null = null
  const isLogFile = relativePath.startsWith(`logs${path.sep}`)

  for (const pattern of PATTERNS) {
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      const lineRegex = new RegExp(pattern.regex.source, pattern.regex.flags)
      for (const match of line.matchAll(lineRegex)) {
        const rawMatch = match[0]
        if (pattern.filter && !pattern.filter(rawMatch)) {
          continue
        }

        findings.push({
          file: relativePath,
          line: lineIndex + 1,
          match: maskMatch(rawMatch),
          pattern: pattern.name,
          severity: pattern.severity,
        })
      }
    }

    if (isLogFile && pattern.autoRedact) {
      const redactionRegex = new RegExp(pattern.regex.source, pattern.regex.flags)
      if (redactionRegex.test(content)) {
        sanitizedContent = (sanitizedContent ?? content).replace(redactionRegex, '[REDACTED]')
      }
    }
  }

  return { findings, sanitizedContent: sanitizedContent ?? undefined }
}

async function writeReport(findings: Finding[], filesScanned: number) {
  await ensureReportDir()
  const summary = findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.pattern] = (acc[finding.pattern] || 0) + 1
    return acc
  }, {})

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      filesScanned,
      occurrences: findings.length,
    },
    patterns: summary,
    occurrences: findings,
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8')
  return { summary, report }
}

function printSummary(totalFindings: number, filesScanned: number, summary: Record<string, number>) {
  console.log(chalk.blue(`\n🔍 Auditoria LGPD concluída`))
  console.log(chalk.blue(`Arquivos analisados: ${filesScanned}`))

  if (totalFindings === 0) {
    console.log(chalk.green('Nenhum possível dado sensível encontrado.'))
    return
  }

  console.log(chalk.yellow(`Possíveis ocorrências encontradas: ${totalFindings}`))
  Object.entries(summary).forEach(([pattern, count]) => {
    console.log(chalk.yellow(` - ${pattern}: ${count}`))
  })
  console.log(chalk.redBright('Revise o relatório em logs/auditoria-lgpd-report.json'))
}

async function run() {
  const files = await collectFiles(ROOT_DIR)
  const findings: Finding[] = []

  for (const file of files) {
    const { findings: fileFindings, sanitizedContent } = await scanFile(file)
    if (sanitizedContent) {
      await fs.writeFile(file, sanitizedContent, 'utf8')
    }
    findings.push(...fileFindings)
  }

  const { summary } = await writeReport(findings, files.length)
  printSummary(findings.length, files.length, summary)
}

run().catch((error) => {
  console.error(chalk.red('Erro durante a auditoria LGPD:'), error)
  process.exit(1)
})
