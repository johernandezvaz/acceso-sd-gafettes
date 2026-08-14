import 'server-only'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export type AdminRole = 'ADMIN' | 'SUPERADMIN'

export interface SessionData {
  adminId: string
  name: string
  email: string
  role: AdminRole
  mustChangePassword: boolean
  isLoggedIn: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'coda_admin_session',
  cookieOptions: {
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()
  if (!session.isLoggedIn) redirect(ROUTES.adminLogin)
  if (session.mustChangePassword) redirect(ROUTES.adminChangePassword)
  return session
}

export async function requireLoggedIn(): Promise<SessionData> {
  const session = await getSession()
  if (!session.isLoggedIn) redirect(ROUTES.adminLogin)
  return session
}

export async function requireSuperAdmin(): Promise<SessionData> {
  const session = await getSession()
  if (!session.isLoggedIn) redirect(ROUTES.adminLogin)
  if (session.mustChangePassword) redirect(ROUTES.adminChangePassword)
  if (session.role !== 'SUPERADMIN') redirect(ROUTES.adminDashboard)
  return session
}

export async function createAdminSession(
  adminId: string,
  name: string,
  email: string,
  role: AdminRole,
  mustChangePassword: boolean
) {
  const session = await getSession()
  session.adminId = adminId
  session.name = name
  session.email = email
  session.role = role
  session.mustChangePassword = mustChangePassword
  session.isLoggedIn = true
  await session.save()
}

export async function destroyAdminSession() {
  const session = await getSession()
  session.destroy()
}
