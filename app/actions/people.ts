'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'
import { PaymentFrequency } from '@prisma/client'

export interface PersonOption {
  id: string
  fullName: string
  personTypeName: string
  personTypeSlug: string
  scheduleEntry?: string | null
  scheduleExit?: string | null
  paymentFrequency?: PaymentFrequency | null
}

export interface PersonTypeOption {
  id: string
  name: string
  slug: string
}

function isValidTime(time?: string | null): boolean {
  if (!time) return true
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time.trim())
}

export async function getActivePeople(personTypeSlug?: string): Promise<PersonOption[]> {
  const people = await prisma.person.findMany({
    where: {
      active: true,
      ...(personTypeSlug ? { personType: { slug: personTypeSlug } } : {}),
    },
    include: { personType: true },
    orderBy: { fullName: 'asc' },
  })
  return people.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    personTypeName: p.personType.name,
    personTypeSlug: p.personType.slug,
    scheduleEntry: p.scheduleEntry,
    scheduleExit: p.scheduleExit,
    paymentFrequency: p.paymentFrequency,
  }))
}

export async function getPersonTypes(): Promise<PersonTypeOption[]> {
  const types = await prisma.personType.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
  return types.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))
}

export async function createPerson(data: {
  fullName: string
  personTypeId: string
  scheduleEntry?: string | null
  scheduleExit?: string | null
  paymentFrequency?: 'SEMANAL' | 'QUINCENAL' | null
}): Promise<{ success: boolean; error?: string; personId?: string }> {
  const session = await requireAuth()

  const fullName = data.fullName.trim()
  if (!fullName || !data.personTypeId) {
    return { success: false, error: 'Nombre y tipo son obligatorios' }
  }

  const sEntry = data.scheduleEntry?.trim() || null
  const sExit = data.scheduleExit?.trim() || null

  if (sEntry && !isValidTime(sEntry)) {
    return { success: false, error: 'La hora de entrada debe tener formato HH:mm (ej. 08:00)' }
  }
  if (sExit && !isValidTime(sExit)) {
    return { success: false, error: 'La hora de salida debe tener formato HH:mm (ej. 17:00)' }
  }

  const person = await prisma.person.create({
    data: {
      fullName,
      personTypeId: data.personTypeId,
      scheduleEntry: sEntry,
      scheduleExit: sExit,
      paymentFrequency: data.paymentFrequency ? (data.paymentFrequency as PaymentFrequency) : 'QUINCENAL',
    },
    include: { personType: true },
  })

  await logAction(session.adminId, 'CREATE_PERSON', 'Person', person.id, {
    fullName: person.fullName,
    personType: person.personType.name,
    scheduleEntry: person.scheduleEntry,
    scheduleExit: person.scheduleExit,
    paymentFrequency: person.paymentFrequency,
  })

  return { success: true, personId: person.id }
}

export async function updatePerson(
  id: string,
  data: {
    fullName?: string
    personTypeId?: string
    scheduleEntry?: string | null
    scheduleExit?: string | null
    paymentFrequency?: 'SEMANAL' | 'QUINCENAL' | null
    active?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const before = await prisma.person.findUnique({ where: { id }, include: { personType: true } })
  if (!before) {
    return { success: false, error: 'Persona no encontrada' }
  }

  const updateData: {
    fullName?: string
    personTypeId?: string
    scheduleEntry?: string | null
    scheduleExit?: string | null
    paymentFrequency?: PaymentFrequency | null
    active?: boolean
  } = {}

  if (data.fullName !== undefined) {
    const trimmed = data.fullName.trim()
    if (!trimmed) return { success: false, error: 'El nombre no puede estar vacío' }
    updateData.fullName = trimmed
  }
  if (data.personTypeId !== undefined) {
    updateData.personTypeId = data.personTypeId
  }
  if (data.scheduleEntry !== undefined) {
    const sEntry = data.scheduleEntry?.trim() || null
    if (sEntry && !isValidTime(sEntry)) {
      return { success: false, error: 'Hora de entrada inválida (use HH:mm)' }
    }
    updateData.scheduleEntry = sEntry
  }
  if (data.scheduleExit !== undefined) {
    const sExit = data.scheduleExit?.trim() || null
    if (sExit && !isValidTime(sExit)) {
      return { success: false, error: 'Hora de salida inválida (use HH:mm)' }
    }
    updateData.scheduleExit = sExit
  }
  if (data.paymentFrequency !== undefined) {
    updateData.paymentFrequency = data.paymentFrequency as PaymentFrequency | null
  }
  if (data.active !== undefined) {
    updateData.active = data.active
  }

  await prisma.person.update({ where: { id }, data: updateData })

  let action: 'UPDATE_PERSON' | 'ACTIVATE_PERSON' | 'DEACTIVATE_PERSON' = 'UPDATE_PERSON'
  if (data.active === true)  action = 'ACTIVATE_PERSON'
  if (data.active === false) action = 'DEACTIVATE_PERSON'

  await logAction(session.adminId, action, 'Person', id, {
    before: {
      fullName: before.fullName,
      active: before.active,
      personType: before.personType.name,
      scheduleEntry: before.scheduleEntry,
      scheduleExit: before.scheduleExit,
      paymentFrequency: before.paymentFrequency,
    },
    after: updateData,
  })

  return { success: true }
}

export async function listPeople(filters?: {
  personTypeSlug?: string
  excludePersonTypeSlug?: string
  active?: boolean
}) {
  return prisma.person.findMany({
    where: {
      ...(filters?.personTypeSlug ? { personType: { slug: filters.personTypeSlug } } : {}),
      ...(filters?.excludePersonTypeSlug ? { personType: { slug: { not: filters.excludePersonTypeSlug } } } : {}),
      ...(filters?.active !== undefined ? { active: filters.active } : {}),
    },
    include: { personType: true },
    orderBy: { fullName: 'asc' },
  })
}

