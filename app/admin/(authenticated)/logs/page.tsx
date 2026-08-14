'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAuditLogs,
  getAdminUsersForFilter,
  type AuditLogRow,
} from '@/app/actions/auditLogs'
import { ScrollText, Search, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ACTION_OPTIONS = [
  'CREATE_PERSON', 'UPDATE_PERSON', 'ACTIVATE_PERSON', 'DEACTIVATE_PERSON',
  'CREATE_ADMIN', 'UPDATE_ADMIN', 'ACTIVATE_ADMIN', 'DEACTIVATE_ADMIN',
  'RESET_TEMP_PASSWORD', 'CHANGE_PASSWORD', 'LOGIN',
]

const ENTITY_OPTIONS = ['Person', 'AdminUser', 'VisitHost']

const ACTION_COLORS: Record<string, string> = {
  CREATE_PERSON: 'bg-emerald-100 text-emerald-700',
  UPDATE_PERSON: 'bg-blue-100 text-blue-700',
  ACTIVATE_PERSON: 'bg-cyan-100 text-cyan-700',
  DEACTIVATE_PERSON: 'bg-slate-100 text-slate-600',
  CREATE_ADMIN: 'bg-violet-100 text-violet-700',
  UPDATE_ADMIN: 'bg-blue-100 text-blue-700',
  ACTIVATE_ADMIN: 'bg-cyan-100 text-cyan-700',
  DEACTIVATE_ADMIN: 'bg-slate-100 text-slate-600',
  LOGIN: 'bg-amber-100 text-amber-700',
}

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface AdminUserFilter { id: string; email: string }

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [admins, setAdmins] = useState<AdminUserFilter[]>([])
  const [loading, setLoading] = useState(true)

  const [adminId, setAdminId] = useState('')
  const [action, setAction] = useState('')
  const [entity, setEntity] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAuditLogs({
        adminUserId: adminId || undefined,
        action: action || undefined,
        entity: entity || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setLogs(data)
    } catch { /* requireSuperAdmin redirects */ }
    setLoading(false)
  }, [adminId, action, entity, dateFrom, dateTo])

  useEffect(() => {
    getAdminUsersForFilter().then(setAdmins).catch(() => { })
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    setAdminId(''); setAction(''); setEntity(''); setDateFrom(''); setDateTo('')
  }

  const hasFilters = adminId || action || entity || dateFrom || dateTo

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ScrollText size={22} className="text-amber-500" />
          Logs de auditoría
        </h1>
        <p className="text-sm text-slate-500 mt-1">{logs.length} registros (máx. 200)</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</label>
          <select
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.email}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas</option>
            {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entidad</label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas</option>
            {ENTITY_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desde</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasta</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 ml-auto">
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={14} /> Limpiar
            </button>
          )}
          <button onClick={load}
            className="flex items-center gap-2 h-9 px-4 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
          >
            <Search size={14} /> Buscar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">Sin registros</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Usuario</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Acción</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Entidad</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 max-w-[180px] truncate">{log.adminUserEmail}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{log.entity}</td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs max-w-[100px] truncate">{log.entityId ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs max-w-[220px]">
                    {log.metadata ? (
                      <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 block truncate" title={JSON.stringify(log.metadata)}>
                        {JSON.stringify(log.metadata)}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
