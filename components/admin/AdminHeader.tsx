'use client'

import { logoutAction } from '@/app/actions/auth'
import { LogOut, Crown, User } from 'lucide-react'
import { useTransition } from 'react'

interface AdminHeaderProps {
  name: string
  email: string
  role: 'ADMIN' | 'SUPERADMIN'
}

export default function AdminHeader({ name, email, role }: AdminHeaderProps) {
  const [pending, startTransition] = useTransition()
  const isSuperAdmin = role === 'SUPERADMIN'

  const handleLogout = () => {
    startTransition(async () => { await logoutAction() })
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 text-sm">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSuperAdmin ? 'bg-amber-100' : 'bg-slate-100'
          }`}>
            {isSuperAdmin
              ? <Crown size={14} className="text-amber-600" />
              : <User size={14} className="text-slate-500" />
            }
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-slate-900 text-sm">{name}</span>
            <span className="text-[11px] text-slate-400">{email}</span>
          </div>
          <span className={`
            text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-1
            ${isSuperAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}
          `}>
            {isSuperAdmin ? 'Superadmin' : 'Admin'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          disabled={pending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut size={14} />
          {pending ? 'Saliendo...' : 'Cerrar sesión'}
        </button>
      </div>
    </header>
  )
}
