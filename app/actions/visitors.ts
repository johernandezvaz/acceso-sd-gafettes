'use server'

import { prisma } from '@/lib/db'
import { Movement } from '@prisma/client'

export interface VisitHostOption {
  id: string
  name: string
  position?: string | null
}

export async function getVisitHosts(): Promise<VisitHostOption[]> {
  const hosts = await prisma.visitHost.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
  return hosts.map((h) => ({ id: h.id, name: h.name, position: h.position }))
}

function generateFolio(): string {
  return String(Date.now()).slice(-6)
}

export async function createVisitor(data: {
  fullName: string
  company: string
  visitHostId: string
  visitTo: string
  reason: string
  identificationType: string
}): Promise<{ success: boolean; folio?: string; visitorId?: string; error?: string }> {
  const { fullName, company, visitHostId, visitTo, reason, identificationType } = data

  if (!fullName || !company || !visitHostId || !reason || !identificationType) {
    return { success: false, error: 'Datos del visitante incompletos' }
  }

  const folio = generateFolio()

  const visitor = await prisma.visitor.create({
    data: {
      folio,
      fullName,
      company,
      visitTo,
      visitHostId,
      reason,
      identificationType,
    },
  })

  await prisma.visitorAccessRecord.create({
    data: {
      visitorId: visitor.id,
      movement: Movement.ENTRY,
      timestamp: new Date(),
    },
  })

  return { success: true, folio: visitor.folio, visitorId: visitor.id }
}

export async function findVisitorByFolio(folio: string) {
  if (!folio.trim()) return null

  const visitor = await prisma.visitor.findFirst({
    where: { folio: folio.trim() },
    include: {
      accessRecords: { orderBy: { timestamp: 'desc' } },
      visitHost: true,
    },
  })

  if (!visitor) return null

  const lastRecord = visitor.accessRecords[0]
  const alreadyLeft = lastRecord?.movement === 'EXIT'

  return {
    id: visitor.id,
    folio: visitor.folio,
    fullName: visitor.fullName,
    company: visitor.company,
    visitTo: visitor.visitTo,
    alreadyLeft,
  }
}

export async function registerVisitorExit(
  visitorId: string
): Promise<{ success: boolean; error?: string }> {
  const visitor = await prisma.visitor.findFirst({ where: { id: visitorId } })
  if (!visitor) return { success: false, error: 'Visitante no encontrado' }

  await prisma.visitorAccessRecord.create({
    data: {
      visitorId,
      movement: Movement.EXIT,
      timestamp: new Date(),
    },
  })

  return { success: true }
}

export async function listVisitors(filters?: {
  dateFrom?: string
  dateTo?: string
  search?: string
}) {
  const dateFilter =
    filters?.dateFrom || filters?.dateTo
      ? {
        createdAt: {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
          ...(filters.dateTo   ? { lte: new Date(filters.dateTo)   } : {}),
        },
      }
      : {}

  const searchTerm = filters?.search?.trim()
  const searchFilter = searchTerm
    ? {
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' as const } },
          { company:  { contains: searchTerm, mode: 'insensitive' as const } },
          { folio:    { contains: searchTerm, mode: 'insensitive' as const } },
        ],
      }
    : {}

  return prisma.visitor.findMany({
    where: { ...dateFilter, ...searchFilter },
    include: {
      visitHost: true,
      accessRecords: { orderBy: { timestamp: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}
