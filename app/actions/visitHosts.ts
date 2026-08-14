'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'

export interface VisitHostItem {
  id: string
  employeeNumber: string
  fullName: string
  department: string
  position: string
  active: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    visitors: number
  }
}

export async function listAdminVisitHosts(filters?: {
  search?: string
  status?: 'all' | 'active' | 'inactive'
}): Promise<VisitHostItem[]> {
  await requireAuth()

  const statusFilter =
    filters?.status === 'active'
      ? { active: true }
      : filters?.status === 'inactive'
      ? { active: false }
      : {}

  const searchTerm = filters?.search?.trim()
  const searchFilter = searchTerm
    ? {
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' as const } },
          { employeeNumber: { contains: searchTerm, mode: 'insensitive' as const } },
          { department: { contains: searchTerm, mode: 'insensitive' as const } },
          { position: { contains: searchTerm, mode: 'insensitive' as const } },
        ],
      }
    : {}

  return prisma.visitHost.findMany({
    where: {
      ...statusFilter,
      ...searchFilter,
    },
    include: {
      _count: {
        select: { visitors: true },
      },
    },
    orderBy: { fullName: 'asc' },
  })
}

export async function createVisitHost(data: {
  employeeNumber: string
  fullName: string
  department: string
  position: string
}): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const employeeNumber = data.employeeNumber.trim()
  const fullName = data.fullName.trim()
  const department = data.department.trim()
  const position = data.position.trim()

  if (!employeeNumber || !fullName || !department || !position) {
    return { success: false, error: 'Todos los campos son obligatorios' }
  }

  const existing = await prisma.visitHost.findUnique({
    where: { employeeNumber },
  })
  if (existing) {
    return { success: false, error: `Ya existe un anfitrión con el número de empleado #${employeeNumber}` }
  }

  const host = await prisma.visitHost.create({
    data: {
      employeeNumber,
      fullName,
      department,
      position,
      active: true,
    },
  })

  await logAction(session.adminId, 'CREATE_VISIT_HOST', 'VisitHost', host.id, {
    employeeNumber: host.employeeNumber,
    fullName: host.fullName,
    department: host.department,
    position: host.position,
  })

  return { success: true }
}

export async function updateVisitHost(
  id: string,
  data: {
    employeeNumber?: string
    fullName?: string
    department?: string
    position?: string
    active?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const before = await prisma.visitHost.findUnique({ where: { id } })
  if (!before) {
    return { success: false, error: 'Persona a visitar no encontrada' }
  }

  if (data.employeeNumber && data.employeeNumber.trim() !== before.employeeNumber) {
    const existing = await prisma.visitHost.findUnique({
      where: { employeeNumber: data.employeeNumber.trim() },
    })
    if (existing && existing.id !== id) {
      return { success: false, error: `El número de empleado #${data.employeeNumber.trim()} ya está en uso` }
    }
  }

  const updated = await prisma.visitHost.update({
    where: { id },
    data: {
      ...(data.employeeNumber !== undefined ? { employeeNumber: data.employeeNumber.trim() } : {}),
      ...(data.fullName !== undefined ? { fullName: data.fullName.trim() } : {}),
      ...(data.department !== undefined ? { department: data.department.trim() } : {}),
      ...(data.position !== undefined ? { position: data.position.trim() } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  })

  let action: 'UPDATE_VISIT_HOST' | 'ACTIVATE_VISIT_HOST' | 'DEACTIVATE_VISIT_HOST' = 'UPDATE_VISIT_HOST'
  if (data.active === true && !before.active) action = 'ACTIVATE_VISIT_HOST'
  if (data.active === false && before.active) action = 'DEACTIVATE_VISIT_HOST'

  await logAction(session.adminId, action, 'VisitHost', id, {
    before: {
      employeeNumber: before.employeeNumber,
      fullName: before.fullName,
      department: before.department,
      position: before.position,
      active: before.active,
    },
    after: {
      employeeNumber: updated.employeeNumber,
      fullName: updated.fullName,
      department: updated.department,
      position: updated.position,
      active: updated.active,
    },
  })

  return { success: true }
}

export async function toggleVisitHostStatus(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const host = await prisma.visitHost.findUnique({ where: { id } })
  if (!host) {
    return { success: false, error: 'Persona no encontrada' }
  }

  const nextActive = !host.active
  await prisma.visitHost.update({
    where: { id },
    data: { active: nextActive },
  })

  const action = nextActive ? 'ACTIVATE_VISIT_HOST' : 'DEACTIVATE_VISIT_HOST'
  await logAction(session.adminId, action, 'VisitHost', id, {
    employeeNumber: host.employeeNumber,
    fullName: host.fullName,
    active: nextActive,
  })

  return { success: true }
}