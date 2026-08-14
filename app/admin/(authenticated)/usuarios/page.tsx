'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  listAdminUsers,
  createAdminUser,
  resetTempPassword,
  toggleAdminUserActive,
  type AdminUserRow,
} from '@/app/actions/adminUsers'
import {
  Plus, Crown, User, AlertCircle,
  ShieldCheck, ShieldOff, KeyRound, Copy, Check, Eye, EyeOff, X,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tempPwd, setTempPwd] = useState<{ email: string; name: string; pwd: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setUsers(await listAdminUsers()) } catch { /* superadmin check redirects */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleToggle = async (user: AdminUserRow) => {
    if (user.role === 'SUPERADMIN') return
    await toggleAdminUserActive(user.id)
    await load()
  }

  const handleReset = async (user: AdminUserRow) => {
    const res = await resetTempPassword(user.id)
    if (res.success && res.tempPassword) {
      setTempPwd({ email: user.email, name: user.name, pwd: res.tempPassword })
      await load()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">

            Usuarios administradores
          </h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} usuario{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          Nuevo admin
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Usuario', 'Correo', 'Rol', 'Estado', 'Creado', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    {u.role === 'SUPERADMIN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Crown size={11} /> Superadmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        <User size={11} /> Admin
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                      {u.mustChangePassword && (
                        <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                          <KeyRound size={9} /> Cambio pendiente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    {u.role !== 'SUPERADMIN' && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleReset(u)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Generar nueva contraseña temporal"
                        >
                          <KeyRound size={13} /> Reset pwd
                        </button>
                        <button
                          onClick={() => handleToggle(u)}
                          className={`p-1.5 rounded-lg transition-colors ${u.active
                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          title={u.active ? 'Desactivar' : 'Reactivar'}
                        >
                          {u.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de creación */}
      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={(email, name, pwd) => {
            setShowCreate(false)
            setTempPwd({ email, name, pwd })
            load()
          }}
        />
      )}

      {/* Modal de contraseña temporal */}
      {tempPwd && (
        <TempPasswordModal
          email={tempPwd.email}
          name={tempPwd.name}
          password={tempPwd.pwd}
          onClose={() => setTempPwd(null)}
        />
      )}
    </div>
  )
}

// ─── Modal: Crear admin ─────────────────────────────────────────────────────

function CreateAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (email: string, name: string, pwd: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) { setError('Nombre y correo son obligatorios'); return }
    setSaving(true)
    const res = await createAdminUser({ name: name.trim(), email: email.trim() })
    setSaving(false)
    if (!res.success) { setError(res.error ?? 'Error al crear el usuario'); return }
    onCreated(email.trim(), name.trim(), res.tempPassword!)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Nuevo administrador</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-4">
          <p className="text-sm text-slate-500">
            El sistema generará una contraseña temporal segura. El nuevo admin deberá cambiarla en su primer inicio de sesión.
          </p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre completo *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              placeholder="Juan Pérez"
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="juan.perez@empresa.com"
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 mt-1 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Plus size={16} /> Crear admin</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Contraseña temporal (solo se muestra una vez) ───────────────────

function TempPasswordModal({
  email,
  name,
  password,
  onClose,
}: {
  email: string
  name: string
  password: string
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <KeyRound size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Contraseña temporal generada</h2>
              <p className="text-xs text-amber-700 mt-0.5 font-medium">Esta información se muestra una sola vez</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-0.5">Usuario</p>
            <p className="font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-400">{email}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña temporal</p>
            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl">
              <span className={`flex-1 font-mono text-sm ${visible ? 'text-emerald-400' : 'text-slate-600 select-none'}`}>
                {visible ? password : '•'.repeat(password.length)}
              </span>
              <button
                onClick={() => setVisible((v) => !v)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title={visible ? 'Ocultar' : 'Mostrar'}
              >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
              >
                {copied ? <><Check size={13} /> Copiada</> : <><Copy size={13} /> Copiar</>}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              ⚠️ Entrega esta contraseña al usuario de forma segura. No se almacena en texto plano y no podrás consultarla después de cerrar esta ventana.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-11 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Entendido — cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
