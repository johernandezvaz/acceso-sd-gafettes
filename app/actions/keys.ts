'use server'

import { prisma } from '@/lib/db'
import { requireAuth, getSession } from '@/lib/session'
import { logAction } from '@/lib/audit'
import type { KeyRequesterType } from '@prisma/client'

export type KeyStatusType = 'AVAILABLE' | 'OCCUPIED' | 'INACTIVE'

export interface KeyRequesterOption {
  id?: string
  fullName: string
  position?: string
  department?: string
  employeeNumber?: string
  type: 'PERSON' | 'CLEANING'
}

export interface KioskKeyItem {
  id: string
  name: string
  status: KeyStatusType
  activeAssignment?: {
    id: string
    requesterType: 'PERSON' | 'CLEANING'
    requesterName: string
    requesterDetail?: string
    takenAt: Date
  } | null
}

export async function searchKeyRequesters(query: string): Promise<KeyRequesterOption[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    const hosts = await prisma.visitHost.findMany({
      where: { active: true },
      take: 15,
      orderBy: { fullName: 'asc' },
    })

    return hosts.map((h) => ({
      id: h.id,
      fullName: h.fullName,
      position: h.position,
      department: h.department,
      employeeNumber: h.employeeNumber,
      type: 'PERSON',
    }))
  }

  const hosts = await prisma.visitHost.findMany({
    where: {
      active: true,
      OR: [
        { fullName: { contains: trimmed, mode: 'insensitive' } },
        { employeeNumber: { contains: trimmed, mode: 'insensitive' } },
        { department: { contains: trimmed, mode: 'insensitive' } },
        { position: { contains: trimmed, mode: 'insensitive' } },
      ],
    },
    take: 25,
    orderBy: { fullName: 'asc' },
  })

  return hosts.map((h) => ({
    id: h.id,
    fullName: h.fullName,
    position: h.position,
    department: h.department,
    employeeNumber: h.employeeNumber,
    type: 'PERSON',
  }))
}

export async function getKioskKeys(): Promise<KioskKeyItem[]> {
  const keys = await prisma.key.findMany({
    where: { active: true },
    include: {
      assignments: {
        where: { returnedAt: null },
        include: {
          visitHost: true,
        },
        take: 1,
        orderBy: { takenAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return keys.map((k) => {
    const activeAssignment = k.assignments[0]
    if (!activeAssignment) {
      return {
        id: k.id,
        name: k.name,
        status: k.status,
        activeAssignment: null,
      }
    }

    const isCleaning = activeAssignment.requesterType === 'CLEANING'
    const requesterName = isCleaning
      ? 'Limpieza'
      : activeAssignment.visitHost?.fullName ?? activeAssignment.requesterLabel ?? 'Empleado'
    const requesterDetail = isCleaning
      ? 'Personal de limpieza'
      : activeAssignment.visitHost
        ? `${activeAssignment.visitHost.position} · ${activeAssignment.visitHost.department}`
        : undefined

    return {
      id: k.id,
      name: k.name,
      status: 'OCCUPIED',
      activeAssignment: {
        id: activeAssignment.id,
        requesterType: activeAssignment.requesterType as 'PERSON' | 'CLEANING',
        requesterName,
        requesterDetail,
        takenAt: activeAssignment.takenAt,
      },
    }
  })
}

export async function takeKey(
  keyId: string,
  requester: { type: 'PERSON'; visitHostId: string } | { type: 'CLEANING' }
): Promise<{ success: boolean; error?: string }> {
  const key = await prisma.key.findUnique({
    where: { id: keyId },
    include: {
      assignments: {
        where: { returnedAt: null },
        take: 1,
      },
    },
  })

  if (!key || !key.active) {
    return { success: false, error: 'La llave no está disponible o está inactiva' }
  }

  if (key.assignments.length > 0 || key.status === 'OCCUPIED') {
    return { success: false, error: 'La llave ya se encuentra ocupada' }
  }

  let visitHostId: string | null = null
  let requesterLabel = 'Limpieza'
  let auditPersonDetail = 'Personal de limpieza'

  if (requester.type === 'PERSON') {
    if (!requester.visitHostId) {
      return { success: false, error: 'Debe seleccionar una persona autorizada' }
    }

    const host = await prisma.visitHost.findUnique({
      where: { id: requester.visitHostId },
    })

    if (!host || !host.active) {
      return { success: false, error: 'La persona seleccionada no está autorizada o está inactiva' }
    }

    visitHostId = host.id
    requesterLabel = host.fullName
    auditPersonDetail = `${host.position} · ${host.department}`
  }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.keyAssignment.create({
      data: {
        keyId,
        visitHostId,
        requesterType: requester.type as KeyRequesterType,
        requesterLabel,
        takenAt: now,
      },
    })

    await tx.key.update({
      where: { id: keyId },
      data: { status: 'OCCUPIED' },
    })
  })

  try {
    const session = await getSession()
    if (session?.adminId) {
      await logAction(session.adminId, 'TAKE_KEY', 'Key', keyId, {
        keyName: key.name,
        requesterType: requester.type,
        requesterName: requesterLabel,
        requesterDetail: auditPersonDetail,
        takenAt: now,
      })
    }
  } catch {
    // Kiosk call outside admin session
  }

  return { success: true }
}

/**
 * Devolver una llave en el kiosco
 */
export async function returnKey(
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  const key = await prisma.key.findUnique({
    where: { id: keyId },
    include: {
      assignments: {
        where: { returnedAt: null },
        include: { visitHost: true },
        take: 1,
        orderBy: { takenAt: 'desc' },
      },
    },
  })

  if (!key) {
    return { success: false, error: 'Llave no encontrada' }
  }

  const activeAssignment = key.assignments[0]
  if (!activeAssignment) {
    // Si no había assignment activo, aseguramos status AVAILABLE
    await prisma.key.update({
      where: { id: keyId },
      data: { status: 'AVAILABLE' },
    })
    return { success: true }
  }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.keyAssignment.update({
      where: { id: activeAssignment.id },
      data: { returnedAt: now },
    })

    await tx.key.update({
      where: { id: keyId },
      data: { status: 'AVAILABLE' },
    })
  })

  try {
    const session = await getSession()
    if (session?.adminId) {
      const requesterName =
        activeAssignment.requesterType === 'CLEANING'
          ? 'Limpieza'
          : activeAssignment.visitHost?.fullName ?? activeAssignment.requesterLabel ?? 'Empleado'

      await logAction(session.adminId, 'RETURN_KEY', 'Key', keyId, {
        keyName: key.name,
        requesterType: activeAssignment.requesterType,
        requesterName,
        returnedAt: now,
      })
    }
  } catch {
    // Kiosk call outside admin session
  }

  return { success: true }
}

export interface AdminKeyItem {
  id: string
  name: string
  status: KeyStatusType
  active: boolean
  createdAt: Date
  updatedAt: Date
  activeAssignment?: {
    id: string
    requesterType: 'PERSON' | 'CLEANING'
    personName: string
    personDepartment?: string
    takenAt: Date
  } | null
  _count: {
    assignments: number
  }
}

export async function listAdminKeys(): Promise<AdminKeyItem[]> {
  await requireAuth()

  const keys = await prisma.key.findMany({
    include: {
      assignments: {
        where: { returnedAt: null },
        include: { visitHost: true },
        take: 1,
        orderBy: { takenAt: 'desc' },
      },
      _count: {
        select: { assignments: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return keys.map((k) => {
    const activeAssignment = k.assignments[0]
    const isCleaning = activeAssignment?.requesterType === 'CLEANING'
    const personName = isCleaning
      ? 'Limpieza'
      : activeAssignment?.visitHost?.fullName ?? activeAssignment?.requesterLabel ?? 'Empleado'
    const personDepartment = isCleaning
      ? 'Personal de limpieza'
      : activeAssignment?.visitHost
        ? `${activeAssignment.visitHost.position} · ${activeAssignment.visitHost.department}`
        : undefined

    return {
      id: k.id,
      name: k.name,
      status: !k.active ? 'INACTIVE' : activeAssignment ? 'OCCUPIED' : 'AVAILABLE',
      active: k.active,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      activeAssignment: activeAssignment
        ? {
          id: activeAssignment.id,
          requesterType: activeAssignment.requesterType as 'PERSON' | 'CLEANING',
          personName,
          personDepartment,
          takenAt: activeAssignment.takenAt,
        }
        : null,
      _count: k._count,
    }
  })
}

export async function getKeyMetrics(): Promise<{
  disponibles: number
  enUso: number
  inactivas: number
  total: number
}> {
  await requireAuth()

  const [total, inactivas, enUso] = await Promise.all([
    prisma.key.count(),
    prisma.key.count({ where: { active: false } }),
    prisma.key.count({
      where: {
        active: true,
        assignments: {
          some: { returnedAt: null },
        },
      },
    }),
  ])

  const disponibles = total - inactivas - enUso

  return {
    disponibles: Math.max(0, disponibles),
    enUso,
    inactivas,
    total,
  }
}

export async function createKey(name: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()
  const trimmed = name.trim()

  if (!trimmed) {
    return { success: false, error: 'El nombre de la llave es obligatorio' }
  }

  const existing = await prisma.key.findUnique({ where: { name: trimmed } })
  if (existing) {
    return { success: false, error: `Ya existe una llave con el nombre "${trimmed}"` }
  }

  const key = await prisma.key.create({
    data: {
      name: trimmed,
      status: 'AVAILABLE',
      active: true,
    },
  })

  await logAction(session.adminId, 'CREATE_KEY', 'Key', key.id, {
    name: key.name,
  })

  return { success: true }
}

export async function updateKey(
  id: string,
  data: { name?: string; active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const before = await prisma.key.findUnique({ where: { id } })
  if (!before) {
    return { success: false, error: 'Llave no encontrada' }
  }

  if (data.name && data.name.trim() !== before.name) {
    const existing = await prisma.key.findUnique({ where: { name: data.name.trim() } })
    if (existing && existing.id !== id) {
      return { success: false, error: `Ya existe una llave con el nombre "${data.name.trim()}"` }
    }
  }

  const updated = await prisma.key.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.active !== undefined
        ? {
          active: data.active,
          status: !data.active ? 'INACTIVE' : before.status === 'INACTIVE' ? 'AVAILABLE' : before.status,
        }
        : {}),
    },
  })

  let action: 'UPDATE_KEY' | 'ACTIVATE_KEY' | 'DEACTIVATE_KEY' = 'UPDATE_KEY'
  if (data.active === true && !before.active) action = 'ACTIVATE_KEY'
  if (data.active === false && before.active) action = 'DEACTIVATE_KEY'

  await logAction(session.adminId, action, 'Key', id, {
    before: { name: before.name, active: before.active },
    after: { name: updated.name, active: updated.active },
  })

  return { success: true }
}

export interface KeyAssignmentHistoryItem {
  id: string
  keyId: string
  keyName: string
  requesterType: 'PERSON' | 'CLEANING'
  personId?: string | null
  personName: string
  personType: string
  takenAt: Date
  returnedAt: Date | null
  durationMinutes?: number | null
}

export interface KeyAssignmentHistoryResponse {
  items: KeyAssignmentHistoryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getKeyFilterOptions(): Promise<{ id: string; name: string }[]> {
  await requireAuth()
  return prisma.key.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export async function listKeyAssignmentsHistory(filters?: {
  keyId?: string
  search?: string
  status?: 'active' | 'returned' | 'all'
  requesterType?: 'all' | 'PERSON' | 'CLEANING'
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}): Promise<KeyAssignmentHistoryResponse> {
  await requireAuth()

  const page = Math.max(1, filters?.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, filters?.pageSize ?? 25))
  const skip = (page - 1) * pageSize

  const dateFilter =
    filters?.dateFrom || filters?.dateTo
      ? {
        takenAt: {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
          ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
        },
      }
      : {}

  const statusFilter =
    filters?.status === 'active'
      ? { returnedAt: null }
      : filters?.status === 'returned'
        ? { returnedAt: { not: null } }
        : {}

  const requesterTypeFilter =
    filters?.requesterType && filters.requesterType !== 'all'
      ? { requesterType: filters.requesterType as KeyRequesterType }
      : {}

  const searchTerm = filters?.search?.trim()
  let searchFilter = {}
  if (searchTerm) {
    const isSearchingCleaning = 'limpieza'.includes(searchTerm.toLowerCase())
    searchFilter = {
      OR: [
        { key: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
        { requesterLabel: { contains: searchTerm, mode: 'insensitive' as const } },
        { visitHost: { fullName: { contains: searchTerm, mode: 'insensitive' as const } } },
        { visitHost: { employeeNumber: { contains: searchTerm, mode: 'insensitive' as const } } },
        { visitHost: { department: { contains: searchTerm, mode: 'insensitive' as const } } },
        ...(isSearchingCleaning ? [{ requesterType: 'CLEANING' as KeyRequesterType }] : []),
      ],
    }
  }

  const where = {
    ...(filters?.keyId ? { keyId: filters.keyId } : {}),
    ...dateFilter,
    ...statusFilter,
    ...requesterTypeFilter,
    ...searchFilter,
  }

  const [total, assignments] = await Promise.all([
    prisma.keyAssignment.count({ where }),
    prisma.keyAssignment.findMany({
      where,
      include: {
        key: true,
        visitHost: true,
      },
      orderBy: { takenAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const items: KeyAssignmentHistoryItem[] = assignments.map((a) => {
    let durationMinutes: number | null = null
    if (a.returnedAt) {
      durationMinutes = Math.round((new Date(a.returnedAt).getTime() - new Date(a.takenAt).getTime()) / 60000)
    }

    const isCleaning = a.requesterType === 'CLEANING'
    const personName = isCleaning
      ? 'Limpieza'
      : a.visitHost?.fullName ?? a.requesterLabel ?? 'Empleado'
    const personType = isCleaning
      ? 'Personal de limpieza'
      : a.visitHost
        ? `${a.visitHost.position} · ${a.visitHost.department}`
        : 'Empleado'

    return {
      id: a.id,
      keyId: a.key.id,
      keyName: a.key.name,
      requesterType: a.requesterType as 'PERSON' | 'CLEANING',
      personId: a.visitHostId,
      personName,
      personType,
      takenAt: a.takenAt,
      returnedAt: a.returnedAt,
      durationMinutes,
    }
  })

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  }
}