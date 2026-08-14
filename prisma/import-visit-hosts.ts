/**
 * prisma/import-visit-hosts.ts
 *
 * Importa admins_entrada.csv hacia la tabla visit_hosts de PostgreSQL.
 * Hace upsert usando num_empleado (employee_number) como clave unica.
 *
 * Uso:
 *   npm run db:import-visit-hosts
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const CSV_PATH = path.resolve(process.cwd(), 'admins_entrada.csv')

const REQUIRED_HEADERS = [
  'num_empleado',
  'nombre_empleado',
  'departamento',
  'puesto',
]

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function cleanRow(values: string[]): string[] {
  return values.map((v) => v.trim())
}

function isEmptyRow(values: string[]): boolean {
  return values.every((v) => v === '')
}

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

async function main() {
  console.log('================================================')
  console.log('  Importacion de VisitHost desde CSV')
  console.log('================================================')
  console.log(`  Archivo: ${CSV_PATH}`)
  console.log('')

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Error: Archivo no encontrado: ${CSV_PATH}`)
    process.exit(1)
  }

  const rawContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const lines = rawContent.split(/\r?\n/)

  if (lines.length < 2) {
    console.error('Error: El archivo CSV esta vacio o no tiene datos')
    process.exit(1)
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim())
  console.log('  Encabezados detectados:', headers.join(', '))

  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
  if (missingHeaders.length > 0) {
    console.error(`Error: Faltan encabezados requeridos: ${missingHeaders.join(', ')}`)
    process.exit(1)
  }

  const colIndex = {
    num_empleado:    headers.indexOf('num_empleado'),
    nombre_empleado: headers.indexOf('nombre_empleado'),
    departamento:    headers.indexOf('departamento'),
    puesto:          headers.indexOf('puesto'),
  }

  interface CsvRow {
    lineNumber: number
    employeeNumber: string
    fullName: string
    department: string
    position: string
  }

  const rows: CsvRow[] = []
  const parseErrors: string[] = []
  let emptySkipped = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) { emptySkipped++; continue }
    const values = cleanRow(parseCsvLine(line))
    if (isEmptyRow(values)) { emptySkipped++; continue }

    const employeeNumber = values[colIndex.num_empleado] ?? ''
    const fullName       = values[colIndex.nombre_empleado] ?? ''
    const department     = values[colIndex.departamento] ?? ''
    const position       = values[colIndex.puesto] ?? ''

    if (!employeeNumber) {
      parseErrors.push(`  Linea ${i + 1}: num_empleado vacio - fila omitida`)
      continue
    }
    if (!fullName) {
      parseErrors.push(`  Linea ${i + 1}: nombre_empleado vacio (num_empleado=${employeeNumber}) - fila omitida`)
      continue
    }
    rows.push({ lineNumber: i + 1, employeeNumber, fullName, department, position })
  }

  const seen = new Map<string, number>()
  const duplicates: string[] = []
  for (const row of rows) {
    if (seen.has(row.employeeNumber)) {
      duplicates.push(`  num_empleado=${row.employeeNumber} aparece en lineas ${seen.get(row.employeeNumber)} y ${row.lineNumber}`)
    } else {
      seen.set(row.employeeNumber, row.lineNumber)
    }
  }

  console.log(`\n  Filas de datos encontradas: ${rows.length}`)
  console.log(`  Filas vacias omitidas:      ${emptySkipped}`)

  if (parseErrors.length > 0) {
    console.log(`\n  Filas con errores de validacion (${parseErrors.length}):`)
    parseErrors.forEach((e) => console.log(e))
  }

  if (duplicates.length > 0) {
    console.log(`\n  Duplicados de num_empleado en CSV (${duplicates.length}):`)
    duplicates.forEach((d) => console.log(d))
    console.log('  Se conservara la primera aparicion de cada num_empleado.')
  }

  const uniqueRows = rows.filter((row, index, arr) =>
    arr.findIndex((r) => r.employeeNumber === row.employeeNumber) === index
  )

  console.log(`\n  Registros a importar (tras deduplicacion): ${uniqueRows.length}`)
  console.log('')

  const prisma = createPrisma()
  let created = 0
  let updated = 0
  const importErrors: string[] = []

  try {
    for (const row of uniqueRows) {
      try {
        const existing = await prisma.visitHost.findUnique({
          where: { employeeNumber: row.employeeNumber },
        })
        await prisma.visitHost.upsert({
          where:  { employeeNumber: row.employeeNumber },
          update: { fullName: row.fullName, department: row.department, position: row.position, active: true },
          create: { employeeNumber: row.employeeNumber, fullName: row.fullName, department: row.department, position: row.position, active: true },
        })
        if (existing) { updated++ } else { created++ }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        importErrors.push(`  num_empleado=${row.employeeNumber} (${row.fullName}): ${msg}`)
      }
    }
  } finally {
    await prisma.$disconnect()
  }

  console.log('================================================')
  console.log('  Resultado de la importacion:')
  console.log(`    Creados:      ${created}`)
  console.log(`    Actualizados: ${updated}`)
  console.log(`    Errores:      ${importErrors.length}`)
  if (importErrors.length > 0) {
    console.log('\n  Errores de importacion:')
    importErrors.forEach((e) => console.log(e))
  }
  console.log('================================================')

  if (importErrors.length > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})