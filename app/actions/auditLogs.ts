'use server'

import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/session'

export interface AuditLogRow {
  id: string
  adminUserEmail: string
  action: string
  entity: string
  entityId: string | null
  metadata: unknown
  createdAt: Date
}

export async function getAuditLogs(filters?: {
  adminUserId?: string
  action?: string
  entity?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}): Promise<AuditLogRow[]> {
  await requireSuperAdmin()

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(filters?.adminUserId ? { adminUserId: filters.adminUserId } : {}),
      ...(filters?.action ? { action: filters.action } : {}),
      ...(filters?.entity ? { entity: filters.entity } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo   ? { lte: new Date(filters.dateTo)   } : {}),
            },
          }
        : {}),
    },
    include: { adminUser: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit ?? 200,
  })

  return logs.map((l) => ({
    id: l.id,
    adminUserEmail: l.adminUser.email,
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    metadata: l.metadata,
    createdAt: l.createdAt,
  }))
}

export async function getAdminUsersForFilter() {
  await requireSuperAdmin()
  return prisma.adminUser.findMany({
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  })
}
