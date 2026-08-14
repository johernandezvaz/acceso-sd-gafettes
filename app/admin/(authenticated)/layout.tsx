import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { ROUTES } from '@/lib/constants'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect(ROUTES.adminLogin)
  }

  if (session.mustChangePassword) {
    redirect(ROUTES.adminChangePassword)
  }

  const role = session.role ?? 'ADMIN'
  const name = session.name ?? session.email

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar role={role} name={name} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader name={name} email={session.email} role={role} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
