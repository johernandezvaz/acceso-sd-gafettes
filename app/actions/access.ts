'use server'

import { prisma } from '@/lib/db'
import { Movement } from '@prisma/client'
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
          ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
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
