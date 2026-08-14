'use client'

import { useActionState } from 'react'
import { changePasswordAction, logoutAction, type ChangePasswordState } from '@/app/actions/auth'
import { Lock, ShieldAlert, LogOut } from 'lucide-react'
import { useTransition } from 'react'

const initial: ChangePasswordState = {}

export default function ChangePasswordPage() {
  const [state, action, pending] = useActionState(changePasswordAction, initial)
  const [loggingOut, startLogout] = useTransition()

  const handleLogout = () => {
    startLogout(async () => { await logoutAction() })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/25">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cambio de contraseña</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            Por seguridad, debes cambiar tu contraseña antes de continuar. Este paso es obligatorio.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <form action={action} className="flex flex-col gap-5">

            <div>
              <label htmlFor="current" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Contraseña actual
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="current"
                  name="current"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Contraseña temporal"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="new" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="new"
                  name="new"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Repite la nueva contraseña"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                />
              </div>
            </div>

            {state?.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full h-12 mt-1 bg-blue-700 text-white font-semibold text-sm rounded-xl hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Establecer nueva contraseña'
              )}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <LogOut size={12} />
            {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
          </button>
        </div>

      </div>
    </div>
  )
}
