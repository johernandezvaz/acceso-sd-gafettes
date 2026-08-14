'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createAdminSession, destroyAdminSession, requireLoggedIn } from '@/lib/session'
import { ROUTES } from '@/lib/constants'
import type { AdminRole } from '@/lib/session'
import { logAction } from '@/lib/audit'

export interface LoginState {
  error?: string
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email    = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Ingresa tu correo y contraseña' }
  }

  const admin = await prisma.adminUser.findFirst({
    where: { email, active: true },
  })

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: 'Credenciales incorrectas' }
  }

  await createAdminSession(
    admin.id,
    admin.name,
    admin.email,
    admin.role as AdminRole,
    admin.mustChangePassword
  )

  if (admin.mustChangePassword) {
    redirect(ROUTES.adminChangePassword)
  }

  redirect(ROUTES.adminDashboard)
}

export interface ChangePasswordState {
  error?: string
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session     = await requireLoggedIn()
  const current     = formData.get('current') as string
  const newPwd      = formData.get('new') as string
  const confirm     = formData.get('confirm') as string

  if (!current || !newPwd || !confirm) {
    return { error: 'Todos los campos son obligatorios' }
  }
  if (newPwd.length < 8) {
    return { error: 'La nueva contraseña debe tener al menos 8 caracteres' }
  }
  if (newPwd !== confirm) {
    return { error: 'La nueva contraseña y la confirmación no coinciden' }
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } })
  if (!admin) return { error: 'Usuario no encontrado' }

  const currentOk = await bcrypt.compare(current, admin.passwordHash)
  if (!currentOk) return { error: 'La contraseña actual es incorrecta' }

  if (await bcrypt.compare(newPwd, admin.passwordHash)) {
    return { error: 'La nueva contraseña debe ser diferente a la actual' }
  }

  const passwordHash = await bcrypt.hash(newPwd, 12)
  await prisma.adminUser.update({
    where: { id: admin.id },
    data:  { passwordHash, mustChangePassword: false },
  })

  // Actualizar la sesión para reflejar mustChangePassword = false
  await createAdminSession(
    admin.id,
    admin.name,
    admin.email,
    admin.role as AdminRole,
    false
  )

  await logAction(admin.id, 'CHANGE_PASSWORD', 'AdminUser', admin.id, { email: admin.email })

  redirect(ROUTES.adminDashboard)
}

export async function logoutAction() {
  await destroyAdminSession()
  redirect(ROUTES.adminLogin)
}
