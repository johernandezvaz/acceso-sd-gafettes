export type Quincena = 1 | 2

export interface QuincenaRange {
  from: Date
  to: Date
}

export function getQuincenaRange(year: number, month: number, quincena: Quincena): QuincenaRange {
  if (quincena === 1) {
    const from = new Date(year, month, 1, 0, 0, 0, 0)
    const to = new Date(year, month, 15, 23, 59, 59, 999)
    return { from, to }
  } else {
    const from = new Date(year, month, 16, 0, 0, 0, 0)

    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = new Date(year, month, lastDay, 23, 59, 59, 999)
    return { from, to }
  }
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]


export function getQuincenaLabel(year: number, month: number, quincena: Quincena): string {
  const mesNombre = MESES[month] ?? 'Mes desconocido'
  const ordinal = quincena === 1 ? '1ª' : '2ª'
  return `${ordinal} Quincena — ${mesNombre} ${year}`
}

export function getCurrentQuincena(): { year: number; month: number; quincena: Quincena } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const quincena: Quincena = now.getDate() <= 15 ? 1 : 2
  return { year, month, quincena }
}


export function getDaysInQuincena(year: number, month: number, quincena: Quincena): string[] {
  const { from, to } = getQuincenaRange(year, month, quincena)
  const days: string[] = []
  const cursor = new Date(from)
  while (cursor <= to) {
    const yyyy = cursor.getFullYear()
    const mm = String(cursor.getMonth() + 1).padStart(2, '0')
    const dd = String(cursor.getDate()).padStart(2, '0')
    days.push(`${yyyy}-${mm}-${dd}`)
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}
