'use server'

import { prisma } from '@/lib/db'
import { Movement } from '@prisma/client'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'

export async function registerAccess(
  personId: string,
  movement: 'ENTRY' | 'EXIT'
): Promise<{ success: boolean; error?: string; timestamp?: string }> {
  if (!personId || !movement) {
    return { success: false, error: 'Datos incompletos' }
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, active: true },
  })

  if (!person) {
    return { success: false, error: 'Persona no encontrada' }
  }

  const record = await prisma.accessRecord.create({
    data: {
      personId,
      movement: movement as Movement,
      timestamp: new Date(),
    },
  })

  return {
    success: true,
    timestamp: record.timestamp.toISOString(),
  }
}

export async function createAccessRecordForDate(
  personId: string,
  movement: 'ENTRY' | 'EXIT',
  dateKey: string,
  time: string,
): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await requireAuth()

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return { success: false, error: 'Formato de hora inválido. Use HH:mm (ej. 08:30)' }
  }

  const [hh, mm] = time.split(':').map(Number)
  const [year, month, day] = dateKey.split('-').map(Number)
  const newTimestamp = new Date(year, month - 1, day, hh, mm, 0, 0)

  if (movement === 'EXIT') {
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0)
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999)
    const lastEntry = await prisma.accessRecord.findFirst({
      where: { personId, movement: 'ENTRY', timestamp: { gte: dayStart, lte: dayEnd } },
      orderBy: { timestamp: 'desc' },
    })
    if (lastEntry && newTimestamp <= lastEntry.timestamp) {
      return { success: false, error: 'La hora de salida no puede ser anterior o igual a la hora de entrada' }
    }
  }

  if (movement === 'ENTRY') {
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0)
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999)
    const nextExit = await prisma.accessRecord.findFirst({
      where: { personId, movement: 'EXIT', timestamp: { gte: dayStart, lte: dayEnd } },
      orderBy: { timestamp: 'asc' },
    })
    if (nextExit && newTimestamp >= nextExit.timestamp) {
      return { success: false, error: 'La hora de entrada no puede ser posterior o igual a la hora de salida registrada' }
    }
  }

  const record = await prisma.accessRecord.create({
    data: {
      personId,
      movement: movement as Movement,
      timestamp: newTimestamp,
      editedAt: new Date(),
    },
  })

  await logAction(session.adminId, 'EDIT_ACCESS_RECORD', 'AccessRecord', record.id, {
    action: 'CREATE_MANUAL',
    movement,
    timestamp: newTimestamp.toISOString(),
    personId,
    dateKey,
    editedBy: session.email,
  })

  return { success: true, id: record.id }
}

export async function updateAccessRecordTimestamp(
  recordId: string,
  newTime: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(newTime)) {
    return { success: false, error: 'Formato de hora inválido. Use HH:mm (ej. 08:30)' }
  }

  const record = await prisma.accessRecord.findUnique({ where: { id: recordId } })
  if (!record) {
    return { success: false, error: 'Registro no encontrado' }
  }

  const [hh, mm] = newTime.split(':').map(Number)
  const year = record.timestamp.getFullYear()
  const month = record.timestamp.getMonth()
  const day = record.timestamp.getDate()
  const dayStart = new Date(year, month, day, 0, 0, 0, 0)
  const dayEnd = new Date(year, month, day, 23, 59, 59, 999)
  const newTimestamp = new Date(year, month, day, hh, mm, 0, 0)

  if (record.movement === 'EXIT') {
    const lastEntry = await prisma.accessRecord.findFirst({
      where: {
        personId: record.personId,
        movement: 'ENTRY',
        timestamp: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { timestamp: 'desc' },
    })

    if (lastEntry && newTimestamp <= lastEntry.timestamp) {
      return { success: false, error: 'La hora de salida no puede ser anterior o igual a la hora de entrada' }
    }
  }

  if (record.movement === 'ENTRY') {
    const nextExit = await prisma.accessRecord.findFirst({
      where: {
        personId: record.personId,
        movement: 'EXIT',
        timestamp: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { timestamp: 'asc' },
    })

    if (nextExit && newTimestamp >= nextExit.timestamp) {
      return { success: false, error: 'La hora de entrada no puede ser posterior o igual a la hora de salida registrada' }
    }
  }

  const before = {
    timestamp: record.timestamp.toISOString(),
    movement: record.movement,
  }
  const after = { timestamp: newTimestamp.toISOString() }

  await prisma.accessRecord.update({
    where: { id: recordId },
    data: { timestamp: newTimestamp, editedAt: new Date() },
  })

  await logAction(session.adminId, 'EDIT_ACCESS_RECORD', 'AccessRecord', recordId, {
    before,
    after,
    personId: record.personId,
    editedBy: session.email,
  })

  return { success: true }
}


export interface DailyMovementItem {
  id: string
  movement: 'ENTRY' | 'EXIT'
  time: string
  timestamp: string
  editedAt: string | null
}

export interface DailyAccessRecordRow {
  id: string
  personId: string
  personName: string
  personTypeName: string
  personTypeSlug: string
  dateKey: string
  formattedDate: string
  firstEntryTime: string | null
  lastExitTime: string | null
  totalWorkedMinutes: number
  formattedTotalHours: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'INCONSISTENT'
  movementsCount: number
  movements: DailyMovementItem[]
}

function formatHoursAndMinutes(totalMinutes: number): string {
  const hours = Math.floor(Math.max(0, totalMinutes) / 60)
  const minutes = Math.max(0, totalMinutes) % 60
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return `${hh}h ${mm}m`
}

function getLocalDateString(d: Date): string {

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatLocalTime(d: Date): string {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatLocalDate(d: Date): string {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function getDailyAccessRecords(filters: {
  search?: string
  personTypeSlug?: string
  status?: 'all' | 'COMPLETED' | 'IN_PROGRESS' | 'INCONSISTENT'
  datePreset?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}): Promise<{
  rows: DailyAccessRecordRow[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const {
    search,
    personTypeSlug,
    status = 'all',
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 50,
  } = filters

  const dateFilter =
    dateFrom || dateTo
      ? {
        timestamp: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        },
      }
      : {}

  const rawRecords = await prisma.accessRecord.findMany({
    where: {
      ...dateFilter,
      person: {
        ...(personTypeSlug ? { personType: { slug: personTypeSlug } } : {}),
        ...(search?.trim()
          ? { fullName: { contains: search.trim(), mode: 'insensitive' } }
          : {}),
      },
    },
    include: {
      person: { include: { personType: true } },
    },
    orderBy: { timestamp: 'asc' },
  })

  const groupedMap = new Map<string, {
    person: {
      id: string
      fullName: string
      personTypeName: string
      personTypeSlug: string
    }
    dateKey: string
    dateObj: Date
    records: typeof rawRecords
  }>()

  for (const r of rawRecords) {
    const d = new Date(r.timestamp)
    const dateKey = getLocalDateString(d)
    const groupKey = `${r.personId}_${dateKey}`

    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        person: {
          id: r.person.id,
          fullName: r.person.fullName,
          personTypeName: r.person.personType.name,
          personTypeSlug: r.person.personType.slug,
        },
        dateKey,
        dateObj: d,
        records: [],
      })
    }
    groupedMap.get(groupKey)!.records.push(r)
  }

  const allRows: DailyAccessRecordRow[] = []

  for (const [groupKey, group] of groupedMap.entries()) {
    const sorted = group.records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    let firstEntryTime: string | null = null
    let lastExitTime: string | null = null
    let totalWorkedMs = 0
    let openEntryDate: Date | null = null
    let hasUnmatchedExit = false

    const movements: DailyMovementItem[] = []

    for (const item of sorted) {
      const itemDate = new Date(item.timestamp)
      const timeStr = formatLocalTime(itemDate)

      movements.push({
        id: item.id,
        movement: item.movement,
        time: timeStr,
        timestamp: itemDate.toISOString(),
        editedAt: item.editedAt ? item.editedAt.toISOString() : null,
      })

      if (item.movement === 'ENTRY') {
        if (!firstEntryTime) firstEntryTime = timeStr
        if (!openEntryDate) {
          openEntryDate = itemDate
        }
      } else if (item.movement === 'EXIT') {
        lastExitTime = timeStr
        if (openEntryDate) {
          const diffMs = itemDate.getTime() - openEntryDate.getTime()
          if (diffMs > 0) totalWorkedMs += diffMs
          openEntryDate = null
        } else {
          hasUnmatchedExit = true
        }
      }
    }

    const totalWorkedMinutes = Math.round(totalWorkedMs / 60000)

    let rowStatus: 'COMPLETED' | 'IN_PROGRESS' | 'INCONSISTENT' = 'COMPLETED'
    let formattedTotalHours = '—'

    if (openEntryDate) {
      rowStatus = 'IN_PROGRESS'
      formattedTotalHours = 'En curso'
    } else if (hasUnmatchedExit && totalWorkedMinutes === 0) {
      rowStatus = 'INCONSISTENT'
      formattedTotalHours = '—'
    } else if (hasUnmatchedExit && totalWorkedMinutes > 0) {
      rowStatus = 'INCONSISTENT'
      formattedTotalHours = formatHoursAndMinutes(totalWorkedMinutes)
    } else {
      rowStatus = 'COMPLETED'
      formattedTotalHours = formatHoursAndMinutes(totalWorkedMinutes)
    }

    allRows.push({
      id: groupKey,
      personId: group.person.id,
      personName: group.person.fullName,
      personTypeName: group.person.personTypeName,
      personTypeSlug: group.person.personTypeSlug,
      dateKey: group.dateKey,
      formattedDate: formatLocalDate(group.dateObj),
      firstEntryTime,
      lastExitTime,
      totalWorkedMinutes,
      formattedTotalHours,
      status: rowStatus,
      movementsCount: movements.length,
      movements,
    })
  }

  allRows.sort((a, b) => {
    if (a.dateKey !== b.dateKey) {
      return b.dateKey.localeCompare(a.dateKey)
    }
    return a.personName.localeCompare(b.personName)
  })

  const filteredRows = status === 'all'
    ? allRows
    : allRows.filter((r) => r.status === status)

  const totalCount = filteredRows.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const validPage = Math.max(1, Math.min(page, totalPages))
  const paginatedRows = filteredRows.slice((validPage - 1) * pageSize, validPage * pageSize)

  return {
    rows: paginatedRows,
    totalCount,
    page: validPage,
    pageSize,
    totalPages,
  }
}

export async function getAccessRecords(filters: {
  personTypeSlug?: string
  movement?: 'ENTRY' | 'EXIT'
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
}) {
  const { personTypeSlug, movement, dateFrom, dateTo, search, limit = 200 } = filters

  const dateFilter =
    dateFrom || dateTo
      ? {
        timestamp: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        },
      }
      : {}

  return prisma.accessRecord.findMany({
    where: {
      ...dateFilter,
      ...(movement ? { movement: movement as Movement } : {}),
      person: {
        ...(personTypeSlug ? { personType: { slug: personTypeSlug } } : {}),
        ...(search?.trim()
          ? { fullName: { contains: search.trim(), mode: 'insensitive' } }
          : {}),
      },
    },
    include: {
      person: { include: { personType: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

export async function getDashboardMetrics() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [
    activePersons,
    entradasHoy,
    salidasHoy,
    visitantesHoy,
  ] = await Promise.all([
    prisma.person.count({ where: { active: true } }),
    prisma.accessRecord.count({
      where: { movement: 'ENTRY', timestamp: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.accessRecord.count({
      where: { movement: 'EXIT', timestamp: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.visitor.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
  ])

  const personasConEntradaHoy = await prisma.accessRecord.findMany({
    where: { movement: 'ENTRY', timestamp: { gte: todayStart } },
    select: { personId: true },
    distinct: ['personId'],
  })

  let dentroAhora = 0
  for (const { personId } of personasConEntradaHoy) {
    const lastRecord = await prisma.accessRecord.findFirst({
      where: { personId },
      orderBy: { timestamp: 'desc' },
    })
    if (lastRecord?.movement === 'ENTRY') dentroAhora++
  }

  return { activePersons, entradasHoy, salidasHoy, visitantesHoy, dentroAhora }
}
