'use server'

import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/session'
import { logAction } from '@/lib/audit'

export interface AdminUserRow {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SUPERADMIN'
  mustChangePassword: boolean
  active: boolean
  createdAt: Date
}

function generateTempPassword(): string {
  return randomBytes(16).toString('base64url')
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  await requireSuperAdmin()
  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
  })
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as 'ADMIN' | 'SUPERADMIN',
    mustChangePassword: u.mustChangePassword,
    active: u.active,
    createdAt: u.createdAt,
  }))
}

export async function createAdminUser(data: {
  name: string
  email: string
}): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
  const session = await requireSuperAdmin()

  const name = data.name.trim()
  const email = data.email.trim().toLowerCase()

  if (!name || !email) {
    return { success: false, error: 'Nombre y correo son obligatorios' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'El correo no tiene un formato válido' }
  }

  const existing = await prisma.adminUser.findFirst({ where: { email } })
  if (existing) {
    return { success: false, error: 'Ya existe un usuario con ese correo' }
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  const newUser = await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      mustChangePassword: true,
    },
  })
  await logAction(session.adminId, 'CREATE_ADMIN', 'AdminUser', newUser.id, {
    name,
    email,
    createdBy: session.email,
  })

  return { success: true, tempPassword }
}

export async function resetTempPassword(
  id: string
): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
  const session = await requireSuperAdmin()

  const user = await prisma.adminUser.findUnique({ where: { id } })
  if (!user) return { success: false, error: 'Usuario no encontrado' }
  if (user.role === 'SUPERADMIN') {
    return { success: false, error: 'No se puede restablecer la contraseña de un Superadmin' }
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  await prisma.adminUser.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true },
  })

  await logAction(session.adminId, 'RESET_TEMP_PASSWORD', 'AdminUser', id, {
    email: user.email,
    resetBy: session.email,
  })

  return { success: true, tempPassword }
}

export async function toggleAdminUserActive(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requireSuperAdmin()

  const user = await prisma.adminUser.findUnique({ where: { id } })
  if (!user) return { success: false, error: 'Usuario no encontrado' }
  if (user.role === 'SUPERADMIN') {
    return { success: false, error: 'No se puede desactivar un Superadmin' }
  }

  const newActive = !user.active
  await prisma.adminUser.update({ where: { id }, data: { active: newActive } })

  const action = newActive ? 'ACTIVATE_ADMIN' : 'DEACTIVATE_ADMIN'
  await logAction(session.adminId, action, 'AdminUser', id, {
    email: user.email,
    name: user.name,
  })

  return { success: true }
}
