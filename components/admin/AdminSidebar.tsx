'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  KeyRound,
  History,
  ClipboardList,
  UserCheck,
  UserCog,
  ScrollText,
  Crown,
} from 'lucide-react'
import { ROUTES, SYSTEM_NAME } from '@/lib/constants'

interface AdminSidebarProps {
  role: 'ADMIN' | 'SUPERADMIN'
  name: string
}

const baseNavItems = [
  { label: 'Dashboard', href: ROUTES.adminDashboard, icon: LayoutDashboard },
  { label: 'Personal', href: ROUTES.adminPersonal, icon: Users },
  { label: 'Transportistas', href: ROUTES.adminTransportistas, icon: Package },
  { label: 'Personas a visitar', href: ROUTES.adminVisitHosts, icon: Building2 },
  { label: 'Llaves', href: ROUTES.adminLlaves, icon: KeyRound, exact: true },
  { label: 'Registro de llaves', href: ROUTES.adminRegistroLlaves, icon: History },
  { label: 'Registros', href: ROUTES.adminRegistros, icon: ClipboardList },
  { label: 'Visitantes', href: ROUTES.adminVisitantes, icon: UserCheck },
]

const superAdminNavItems = [
  { label: 'Usuarios', href: ROUTES.adminUsuarios, icon: UserCog },
  { label: 'Logs', href: ROUTES.adminLogs, icon: ScrollText },
]

export default function AdminSidebar({ role, name }: AdminSidebarProps) {
  const pathname = usePathname()
  const isSuperAdmin = role === 'SUPERADMIN'

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-screen">

      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900 tracking-tight">{SYSTEM_NAME}</span>
          {isSuperAdmin && (
            <Crown size={14} className="text-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-widest">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">

        {baseNavItems.map(({ label, href, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <Icon size={18} className={active ? 'text-blue-700' : 'text-slate-400'} />
              {label}
            </Link>
          )
        })}

        {isSuperAdmin && (
          <>
            <div className="mt-3 mb-1 px-3">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                <Crown size={10} />
                Superadmin
              </p>
            </div>
            {superAdminNavItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${active
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-slate-600 hover:bg-amber-50/60 hover:text-amber-700'}
                  `}
                >
                  <Icon size={18} className={active ? 'text-amber-600' : 'text-slate-400'} />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="px-6 py-4 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-600 truncate">{name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Panel Administrativo</p>
      </div>
    </aside>
  )
}
