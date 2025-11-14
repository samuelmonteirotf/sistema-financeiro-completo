import { NextResponse } from 'next/server'
import { getUserIdOrUnauthorized } from '@/lib/auth-utils'
import { hasFeatureAccess } from '@/lib/limits'
import { forbiddenFeature } from '@/lib/http'

type ExportFormat = 'csv' | 'pdf'

export async function POST(request: Request) {
  const maybeUser = await getUserIdOrUnauthorized()
  if (maybeUser instanceof NextResponse) {
    return maybeUser
  }

  const userId = maybeUser
  const canExport = await hasFeatureAccess(userId, 'export_csv')
  if (!canExport) {
    return forbiddenFeature({
      resource: 'export',
      requiredPlan: 'pro',
      used: 0,
      limit: 0,
      message: 'Exportação disponível no plano Pro ou superior.',
    })
  }

  const { searchParams } = new URL(request.url)
  const formatParam = (searchParams.get('format') || 'csv').toLowerCase() as ExportFormat
  if (!['csv', 'pdf'].includes(formatParam)) {
    return NextResponse.json({ error: 'Formato inválido. Use csv ou pdf.' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)
  const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : null

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Nenhum dado para exportar.' }, { status: 400 })
  }

  const filename = `relatorio-${new Date().toISOString().slice(0, 10)}.${formatParam}`

  if (formatParam === 'csv') {
    const csv = buildCsv(items)
    return new NextResponse(csv, {
      status: 200,
      headers: buildHeaders('text/csv', filename),
    })
  }

  const pdfBuffer = buildPdf(items)
  const pdfArrayBuffer = new ArrayBuffer(pdfBuffer.byteLength)
  new Uint8Array(pdfArrayBuffer).set(pdfBuffer)
  const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' })
  return new NextResponse(pdfBlob, {
    status: 200,
    headers: buildHeaders('application/pdf', filename),
  })
}

function buildHeaders(contentType: string, filename: string) {
  return {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
  }
}

function buildCsv(rows: Record<string, unknown>[]): string {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row ?? {}))))
  if (headers.length === 0) {
    return ''
  }

  const escape = (value: unknown) => {
    if (value === null || value === undefined) return ''
    if (value instanceof Date) return value.toISOString()
    const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
    const needsQuotes = /[",\n]/.test(str)
    const cleaned = str.replace(/"/g, '""')
    return needsQuotes ? `"${cleaned}"` : cleaned
  }

  const headerLine = headers.join(',')
  const lines = rows.map((row) => headers.map((header) => escape(row?.[header as keyof typeof row])).join(','))
  return [headerLine, ...lines].join('\n')
}

function buildPdf(items: Record<string, unknown>[]): Buffer {
  const lines: string[] = ['Relatório de Despesas', '']
  items.forEach((item, index) => {
    lines.push(`Item ${index + 1}`)
    Object.entries(item ?? {}).forEach(([key, value]) => {
      lines.push(`- ${key}: ${formatValue(value)}`)
    })
    lines.push('')
  })

  return createSimplePdf(lines)
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function createSimplePdf(lines: string[]): Buffer {
  const header = '%PDF-1.4\n'
  const textContent = [
    'BT',
    '/F1 12 Tf',
    '72 720 Td',
    ...lines.flatMap((line, index) => {
      if (index === 0) {
        return [`(${escapePdfText(line)}) Tj`]
      }
      return ['0 -16 Td', `(${escapePdfText(line)}) Tj`]
    }),
    'ET',
  ].join('\n')

  const streamLength = Buffer.byteLength(textContent, 'utf-8')

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${streamLength} >> stream\n${textContent}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ]

  const parts: string[] = [header]
  const offsets: number[] = [0]

  let currentOffset = Buffer.byteLength(header, 'utf-8')

  for (const obj of objects) {
    offsets.push(currentOffset)
    const chunk = `${obj}\n`
    parts.push(chunk)
    currentOffset += Buffer.byteLength(chunk, 'utf-8')
  }

  const xrefStart = currentOffset
  const xrefLines = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f ']

  for (let i = 1; i < offsets.length; i++) {
    xrefLines.push(`${offsets[i].toString().padStart(10, '0')} 00000 n `)
  }

  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  parts.push(`${xrefLines.join('\n')}\n`)
  parts.push(trailer)

  return Buffer.from(parts.join(''), 'utf-8')
}
