'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getDailyAccessRecords, type DailyAccessRecordRow } from '@/app/actions/access'
import { getPersonTypes, type PersonTypeOption } from '@/app/actions/people'
import { Search, Filter, X, Clock, Calendar, ChevronLeft, ChevronRight, ListOrdered, AlertCircle, CheckCircle2, Timer } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  practicantes: 'bg-sky-100 text-sky-700',
  medico: 'bg-cyan-100 text-cyan-700',
  limpieza: 'bg-indigo-100 text-indigo-700',
  seguridad: 'bg-violet-100 text-violet-700',
  transportistas: 'bg-orange-100 text-orange-700',
}

function getTypeColor(slug: string) {
  return TYPE_COLORS[slug] ?? 'bg-slate-100 text-slate-600'
}

function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  if (preset === 'hoy') {
    return { from: today.toISOString(), to: todayEnd.toISOString() }
  }

  if (preset === 'semana') {
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(now)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    return { from: monday.toISOString(), to: todayEnd.toISOString() }
  }

  if (preset === 'quincenal') {
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    if (day <= 15) {
      const start = new Date(year, month, 1, 0, 0, 0, 0)
      const end = new Date(year, month, 15, 23, 59, 59, 999)
      return { from: start.toISOString(), to: end.toISOString() }
    } else {
      const start = new Date(year, month, 16, 0, 0, 0, 0)
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
      const end = new Date(year, month, lastDayOfMonth, 23, 59, 59, 999)
      return { from: start.toISOString(), to: end.toISOString() }
    }
  }

  if (preset === 'mes') {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const mEnd = new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59, 999)
    return { from: mStart.toISOString(), to: mEnd.toISOString() }
  }

  return { from: '', to: '' }
}

export default function AdminRegistrosPage() {
  const [rows, setRows] = useState<DailyAccessRecordRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [types, setTypes] = useState<PersonTypeOption[]>([])
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'IN_PROGRESS' | 'INCONSISTENT'>('all')
  const [datePreset, setDatePreset] = useState('hoy')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedDetails, setSelectedDetails] = useState<DailyAccessRecordRow | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (search: string, curPage: number) => {
    setLoading(true)
    const range = datePreset !== 'personalizado'
      ? getDateRange(datePreset)
      : {
        from: dateFrom ? new Date(dateFrom + 'T00:00:00').toISOString() : '',
        to: dateTo ? new Date(dateTo + 'T23:59:59.999').toISOString() : '',
      }

    const data = await getDailyAccessRecords({
      search: search.trim() || undefined,
      personTypeSlug: typeFilter || undefined,
      status: statusFilter,
      dateFrom: range.from || undefined,
      dateTo: range.to || undefined,
      page: curPage,
      pageSize: 50,
    })

    setRows(data.rows)
    setTotalCount(data.totalCount)
    setTotalPages(data.totalPages)
    setPage(data.page)
    setLoading(false)
  }, [typeFilter, statusFilter, datePreset, dateFrom, dateTo])

  useEffect(() => {
    getPersonTypes().then(setTypes)
  }, [])

  useEffect(() => {
    load(searchApplied, page)
  }, [load, searchApplied, page])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setSearchApplied(value)
    }, 350)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchApplied('')
    setPage(1)
  }

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registros de acceso</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalCount} registro{totalCount !== 1 ? 's' : ''} diario{totalCount !== 1 ? 's' : ''} (1 fila por persona y día)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap items-end gap-3 shadow-sm">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">
            Buscar persona
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nombre completo..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchInput && (
              <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200 flex-shrink-0 hidden lg:block" />

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" />
            Fecha
          </label>
          <div className="flex gap-1 flex-wrap">
            {[
              { v: 'hoy', l: 'Hoy' },
              { v: 'semana', l: 'Semana' },
              { v: 'quincenal', l: 'Quincenal' },
              { v: 'mes', l: 'Mes' },
              { v: 'personalizado', l: 'Personalizado' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => handlePresetChange(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${datePreset === v ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {datePreset === 'personalizado' && (
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div className="w-px h-8 bg-slate-200 flex-shrink-0 hidden lg:block" />

        <div className="min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Tipo</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="">Todos los tipos</option>
            {types.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Estado</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'COMPLETED' | 'IN_PROGRESS' | 'INCONSISTENT'); setPage(1) }} className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="all">Todos</option>
            <option value="COMPLETED">Completo</option>
            <option value="IN_PROGRESS">En curso</option>
            <option value="INCONSISTENT">Inconsistente</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center"><span className="inline-block w-7 h-7 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No se encontraron registros</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Persona</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Entrada</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Salida</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{row.personName}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(row.personTypeSlug)}`}>{row.personTypeName}</span></td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">{row.formattedDate}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{row.firstEntryTime || '—'}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{row.lastExitTime || '—'}</td>
                  <td className="px-5 py-3.5 font-mono text-xs font-bold">{row.formattedTotalHours}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : row.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                      {row.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : row.status === 'IN_PROGRESS' ? <Timer size={12} /> : <AlertCircle size={12} />}
                      {row.status === 'COMPLETED' ? 'Completo' : row.status === 'IN_PROGRESS' ? 'En curso' : 'Inconsistente'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <button onClick={() => setSelectedDetails(row)} className="text-slate-400 hover:text-slate-600 p-1"><ListOrdered size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-50">Anterior</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-lg font-bold mb-4">{selectedDetails.personName}</h2>
            <div className="space-y-2 mb-6">
              {selectedDetails.movements.map((m, i) => (
                <div key={m.id} className="flex justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <span>{i + 1}. {m.movement === 'ENTRY' ? 'Entrada' : 'Salida'}</span>
                  <span className="font-mono font-bold">{m.time}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedDetails(null)} className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
