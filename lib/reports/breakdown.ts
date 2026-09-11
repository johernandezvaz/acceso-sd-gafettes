import type { RawAccessRecord, DayBreakdown } from '@/app/actions/reports'

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function toLocalTime(d: Date): string {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function toLocalDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-')
  return `${d}/${m}/${y}`
}

function redondearHoras(horasDecimal: number): number {
  if (!isFinite(horasDecimal) || horasDecimal < 0) return 0
  return Math.floor(horasDecimal) + (horasDecimal % 1 >= 0.5 ? 1 : 0)
}


export function buildDayBreakdown(
  records: RawAccessRecord[],
  daysInPeriod: string[]
): DayBreakdown[] {

  const byDay = new Map<string, RawAccessRecord[]>()
  for (const r of records) {
    const dk = toLocalDateKey(new Date(r.timestamp))
    if (!byDay.has(dk)) byDay.set(dk, [])
    byDay.get(dk)!.push(r)
  }

  return daysInPeriod.map((dateKey) => {
    const dayRecords = byDay.get(dateKey) ?? []
    const label = toLocalDateLabel(dateKey)

    if (dayRecords.length === 0) {
      return { dateKey, dateLabel: label, entryTime: null, exitTime: null, horasDecimal: 0, horasRedondeadas: 0 }
    }

    let firstEntry: Date | null = null
    let lastExit: Date | null = null
    let totalMs = 0
    let openEntry: Date | null = null

    for (const r of dayRecords) {
      const t = new Date(r.timestamp)
      if (r.movement === 'ENTRY') {
        if (!firstEntry) firstEntry = t
        if (!openEntry) openEntry = t
      } else {
        lastExit = t
        if (openEntry) {
          const diff = t.getTime() - openEntry.getTime()
          if (diff > 0) totalMs += diff
          openEntry = null
        }
      }
    }

    const horasDecimal = totalMs / 3_600_000
    const horasRedondeadas = redondearHoras(horasDecimal)

    return {
      dateKey,
      dateLabel: label,
      entryTime: firstEntry ? toLocalTime(firstEntry) : null,
      exitTime: lastExit ? toLocalTime(lastExit) : null,
      horasDecimal,
      horasRedondeadas,
    }
  })
}
