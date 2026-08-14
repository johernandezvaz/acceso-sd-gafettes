'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAccessRecords } from '@/app/actions/access'
import { getPersonTypes, type PersonTypeOption } from '@/app/actions/people'
import { Search, Filter, X } from 'lucide-react'

type AccessRecord = Awaited<ReturnType<typeof getAccessRecords>>[number]

const TYPE_COLORS: Record<string, string> = {
  practicantes: 'bg-sky-100 text-sky-700',
  medico: 'bg-cyan-100 text-cyan-700',
  limpieza: 'bg-indigo-100 text-indigo-700',
  seguridad: 'bg-violet-100 text-violet-700',
}
function getTypeColor(slug: string) {
  return TYPE_COLORS[slug] ?? 'bg-slate-100 text-slate-600'
}

function formatDateTime(date: Date) {
  const d = new Date(date)
  return {
    date: d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  if (preset === 'hoy') return { from: today.toISOString(), to: todayEnd.toISOString() }
  if (preset === 'semana') {
    const w = new Date(today); w.setDate(today.getDate() - today.getDay())
    return { from: w.toISOString(), to: todayEnd.toISOString() }
  }
  if (preset === 'mes') {
    const m = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: m.toISOString(), to: todayEnd.toISOString() }
  }
  return { from: '', to: '' }
}

export default function AdminRegistrosPage() {
  const [records, setRecords] = useState<AccessRecord[]>([])
  const [types, setTypes] = useState<PersonTypeOption[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [movementFilter, setMovementFilter] = useState<'' | 'ENTRY' | 'EXIT'>('')
  const [datePreset, setDatePreset] = useState('hoy')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (search: string) => {
    setLoading(true)
    const range = datePreset !== 'personalizado'
      ? getDateRange(datePreset)
      : { from: dateFrom, to: dateTo }
    const data = await getAccessRecords({
      personTypeSlug: typeFilter || undefined,
      movement: (movementFilter as 'ENTRY' | 'EXIT') || undefined,
      dateFrom: range.from || undefined,
      dateTo: range.to || undefined,
      search: search.trim() || undefined,
      limit: 200,
    })
    setRecords(data)
    setLoading(false)
  }, [typeFilter, movementFilter, datePreset, dateFrom, dateTo])

  useEffect(() => { getPersonTypes().then(setTypes) }, [])
  useEffect(() => { load(searchApplied) }, [load, searchApplied])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchApplied(value), 400)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchApplied('')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registros de acceso</h1>
        <p className="text-sm text-slate-500 mt-1">{records.length} registros encontrados</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap items-end gap-3">

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
              placeholder="Nombre completo o parcial..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200 flex-shrink-0 hidden sm:block" />

        <Filter size={15} className="text-slate-400 flex-shrink-0 hidden sm:block" />

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Fecha</label>
          <div className="flex gap-1 flex-wrap">
            {[
              { v: 'hoy', l: 'Hoy' },
              { v: 'semana', l: 'Semana' },
              { v: 'mes', l: 'Mes' },
              { v: 'personalizado', l: 'Personalizado' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setDatePreset(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${datePreset === v ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
          >
            <option value="">Todos</option>
            {types.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Movimiento</label>
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value as '' | 'ENTRY' | 'EXIT')}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
          >
            <option value="">Todos</option>
            <option value="ENTRY">Entrada</option>
            <option value="EXIT">Salida</option>
          </select>
        </div>
      </div>

      {searchApplied && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-500">Búsqueda activa:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            <Search size={11} />
            &quot;{searchApplied}&quot;
            <button onClick={clearSearch} className="hover:text-blue-900 transition-colors ml-0.5">
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">
              {searchApplied
                ? `Sin resultados para "${searchApplied}"`
                : 'No hay registros con los filtros seleccionados'}
            </p>
            {searchApplied && (
              <button onClick={clearSearch} className="mt-2 text-xs text-blue-600 hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Persona</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Movimiento</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Hora</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((r) => {
                const { date, time } = formatDateTime(r.timestamp)
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{r.person.fullName}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(r.person.personType.slug)}`}>
                        {r.person.personType.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.movement === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {r.movement === 'ENTRY' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700 tabular-nums">{time}</td>
                    <td className="px-6 py-3.5 text-slate-500">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
