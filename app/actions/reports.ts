'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'


export interface PracticanteOption {
  id: string
  fullName: string
}

export interface PersonForReport {
  id: string
  fullName: string
  personTypeName: string
  personTypeSlug: string
}

export interface RawAccessRecord {
  id: string
  personId: string
  movement: 'ENTRY' | 'EXIT'
  timestamp: string
  editedAt: string | null
}

export interface DayBreakdown {
  dateKey: string
  dateLabel: string
  entryTime: string | null
  entryId?: string | null
  entryEditedAt?: string | null
  exitTime: string | null
  exitId?: string | null
  exitEditedAt?: string | null
  horasDecimal: number
  horasRedondeadas: number
}

export interface PersonReport {
  person: PersonForReport
  days: DayBreakdown[]
  totalHorasRedondeadas: number
}




export async function getActivePracticantes(): Promise<PracticanteOption[]> {
  await requireAuth()
  const people = await prisma.person.findMany({
    where: { active: true, personType: { slug: 'practicantes' } },
    include: { personType: true },
    orderBy: { fullName: 'asc' },
  })
  return people.map((p) => ({ id: p.id, fullName: p.fullName }))
}


export async function getPersonsForGeneralReport(
  personTypeSlug?: string
): Promise<PersonForReport[]> {
  await requireAuth()
  const people = await prisma.person.findMany({
    where: {
      active: true,
      ...(personTypeSlug
        ? { personType: { slug: personTypeSlug } }
        : { personType: { slug: { not: 'practicantes' } } }),
    },
    include: { personType: true },
    orderBy: { fullName: 'asc' },
  })
  return people.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    personTypeName: p.personType.name,
    personTypeSlug: p.personType.slug,
  }))
}


export async function getAccessRecordsForPeriod(
  personId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<RawAccessRecord[]> {
  await requireAuth()
  const records = await prisma.accessRecord.findMany({
    where: {
      personId,
      timestamp: { gte: dateFrom, lte: dateTo },
    },
    orderBy: { timestamp: 'asc' },
  })
  return records.map((r) => ({
    id: r.id,
    personId: r.personId,
    movement: r.movement,
    timestamp: r.timestamp.toISOString(),
    editedAt: r.editedAt ? r.editedAt.toISOString() : null,
  }))
}

export async function getAccessRecordsForPeriodMultiple(
  personIds: string[],
  dateFrom: Date,
  dateTo: Date
): Promise<RawAccessRecord[]> {
  await requireAuth()
  if (personIds.length === 0) return []
  const records = await prisma.accessRecord.findMany({
    where: {
      personId: { in: personIds },
      timestamp: { gte: dateFrom, lte: dateTo },
    },
    orderBy: { timestamp: 'asc' },
  })
  return records.map((r) => ({
    id: r.id,
    personId: r.personId,
    movement: r.movement,
    timestamp: r.timestamp.toISOString(),
    editedAt: r.editedAt ? r.editedAt.toISOString() : null,
  }))
}

export async function logReportAmountOverride(data: {
  practicanteId: string
  practicanteName: string
  quincenaLabel: string
  calculatedAmount: number
  manualAmount: number
}): Promise<void> {
  const session = await requireAuth()
  await logAction(session.adminId, 'EDIT_REPORT_AMOUNT', 'Report', undefined, {
    practicanteId: data.practicanteId,
    practicanteName: data.practicanteName,
    quincenaLabel: data.quincenaLabel,
    calculatedAmount: data.calculatedAmount,
    manualAmount: data.manualAmount,
    editedBy: session.email,
  })
}
