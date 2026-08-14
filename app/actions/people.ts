'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'

export interface PersonOption {
  id: string
  fullName: string
  personTypeName: string
  personTypeSlug: string
}

export interface PersonTypeOption {
  id: string
  name: string
  slug: string
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
}): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  if (!data.fullName.trim() || !data.personTypeId) {
    return { success: false, error: 'Datos incompletos' }
  }

  const person = await prisma.person.create({
    data: { fullName: data.fullName.trim(), personTypeId: data.personTypeId },
    include: { personType: true },
  })

  await logAction(session.adminId, 'CREATE_PERSON', 'Person', person.id, {
    fullName: person.fullName,
    personType: person.personType.name,
  })

  return { success: true }
}

export async function updatePerson(
  id: string,
  data: { fullName?: string; personTypeId?: string; active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  const before = await prisma.person.findUnique({ where: { id }, include: { personType: true } })

  await prisma.person.update({ where: { id }, data })

  // Determinar qué tipo de acción fue
  let action: 'UPDATE_PERSON' | 'ACTIVATE_PERSON' | 'DEACTIVATE_PERSON' = 'UPDATE_PERSON'
  if (data.active === true)  action = 'ACTIVATE_PERSON'
  if (data.active === false) action = 'DEACTIVATE_PERSON'

  await logAction(session.adminId, action, 'Person', id, {
    before: { fullName: before?.fullName, active: before?.active, personType: before?.personType.name },
    after: data,
  })

  return { success: true }
}

export async function listPeople(filters?: { personTypeSlug?: string; active?: boolean }) {
  return prisma.person.findMany({
    where: {
      ...(filters?.personTypeSlug ? { personType: { slug: filters.personTypeSlug } } : {}),
      ...(filters?.active !== undefined ? { active: filters.active } : {}),
    },
    include: { personType: true },
    orderBy: { fullName: 'asc' },
  })
}
