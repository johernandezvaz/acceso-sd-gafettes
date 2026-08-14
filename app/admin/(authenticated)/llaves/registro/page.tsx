'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  listKeyAssignmentsHistory,
  getKeyFilterOptions,
  type KeyAssignmentHistoryItem,
} from '@/app/actions/keys'
import {
  History,
  Search,
  X,
  Calendar,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function calculateDuration(takenAt: Date | string, returnedAt: Date | string | null | undefined, _tick: number): string {
  const start = new Date(takenAt).getTime()
  const end = returnedAt ? new Date(returnedAt).getTime() : Date.now()
  const diffMinutes = Math.max(0, Math.floor((end - start) / 60000))

  if (diffMinutes < 1) return '< 1 min'
  const h = Math.floor(diffMinutes / 60)
  const m = diffMinutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function getDateRangePreset(preset: string): { from?: string; to?: string } {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (preset === 'hoy') {
    return { from: todayStart.toISOString(), to: todayEnd.toISOString() }
  }

  if (preset === 'ayer') {
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
    return { from: yesterdayStart.toISOString(), to: yesterdayEnd.toISOString() }
  }

  if (preset === 'semana') {
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    return { from: weekStart.toISOString(), to: todayEnd.toISOString() }
  }

  if (preset === 'mes') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    return { from: monthStart.toISOString(), to: todayEnd.toISOString() }
  }

  return {}
}

export default function AdminRegistroLlavesPage() {
  const [items, setItems] = useState<KeyAssignmentHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  const [loading, setLoading] = useState(true)
  const [keyOptions, setKeyOptions] = useState<{ id: string; name: string }[]>([])

  // Filtros
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned'>('all')
  const [datePreset, setDatePreset] = useState<string>('todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [tick, setTick] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cargar lista de llaves para el selector
  useEffect(() => {
    getKeyFilterOptions().then(setKeyOptions)
  }, [])

  // Timer para refrescar duración de llaves en uso
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(timer)
  }, [])

  const loadData = useCallback(async (
    search: string,
    keyId: string,
    status: 'all' | 'active' | 'returned',
    preset: string,
    customFrom: string,
    customTo: string,
    targetPage: number
  ) => {
    setLoading(true)

    let from: string | undefined
    let to: string | undefined

    if (preset !== 'todos' && preset !== 'personalizado') {
      const range = getDateRangePreset(preset)
      from = range.from
      to = range.to
    } else if (preset === 'personalizado') {
      if (customFrom) from = new Date(customFrom).toISOString()
      if (customTo) to = new Date(`${customTo}T23:59:59.999`).toISOString()
    }

    try {
      const res = await listKeyAssignmentsHistory({
        search: search.trim() || undefined,
        keyId: keyId || undefined,
        status: status,
        dateFrom: from,
        dateTo: to,
        page: targetPage,
        pageSize,
      })

      setItems(res.items)
      setTotal(res.total)
      setPage(res.page)
      setTotalPages(res.totalPages)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    loadData(appliedSearch, selectedKeyId, statusFilter, datePreset, dateFrom, dateTo, page)
  }, [loadData, appliedSearch, selectedKeyId, statusFilter, datePreset, dateFrom, dateTo, page])

  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setAppliedSearch(val)
      setPage(1)
    }, 300)
  }

  const clearSearch = () => {
    setSearchInput('')
    setAppliedSearch('')
    setPage(1)
  }

  const handleFilterChange = () => {
    setPage(1)
  }

  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, total)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.adminLlaves}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Volver a Catálogo de llaves"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de llaves</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Historial detallado de préstamos y devoluciones de llaves
          </p>
        </div>

        <Link
          href={ROUTES.adminLlaves}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <KeyRound size={15} />
          Catálogo de llaves
        </Link>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-col gap-3 shadow-sm">
        {/* Buscador principal */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre de persona o nombre de llave..."
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros secundarios */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider">
            <Filter size={12} />
            Filtros:
          </div>

          {/* Filtro por Llave */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Llave:</span>
            <select
              value={selectedKeyId}
              onChange={(e) => {
                setSelectedKeyId(e.target.value)
                handleFilterChange()
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Todas las llaves</option>
              {keyOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Estado:</span>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[
                { k: 'all', l: 'Todos' },
                { k: 'active', l: 'En uso' },
                { k: 'returned', l: 'Devuelta' },
              ].map(({ k, l }) => (
                <button
                  key={k}
                  onClick={() => {
                    setStatusFilter(k as 'all' | 'active' | 'returned')
                    handleFilterChange()
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === k
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Fecha */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Fecha:</span>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[
                { k: 'todos', l: 'Histórico' },
                { k: 'hoy', l: 'Hoy' },
                { k: 'ayer', l: 'Ayer' },
                { k: 'semana', l: 'Esta semana' },
                { k: 'mes', l: 'Este mes' },
                { k: 'personalizado', l: 'Personalizado' },
              ].map(({ k, l }) => (
                <button
                  key={k}
                  onClick={() => {
                    setDatePreset(k)
                    handleFilterChange()
                  }}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                    datePreset === k
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {datePreset === 'personalizado' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  handleFilterChange()
                }}
                className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800"
              />
              <span className="text-slate-400">a</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  handleFilterChange()
                }}
                className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>
          )}
        </div>
      </div>

      {appliedSearch && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-500">Búsqueda activa:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            <Search size={11} />
            &quot;{appliedSearch}&quot;
            <button onClick={clearSearch} className="hover:text-blue-900 transition-colors ml-0.5">
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      {/* Tabla de Historial */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <History size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No se encontraron registros de llaves</p>
            {appliedSearch && (
              <button onClick={clearSearch} className="mt-2 text-xs text-blue-600 hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Persona
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Llave
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Fecha
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Toma
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Devolución
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Duración
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => {
                const inUse = item.returnedAt === null
                const duration = calculateDuration(item.takenAt, item.returnedAt, tick)

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-slate-900">{item.personName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.personType}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1.5">
                        <KeyRound size={14} className="text-slate-400" />
                        {item.keyName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-mono">
                      {formatDate(item.takenAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-mono font-medium">
                      {formatTime(item.takenAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-mono font-medium">
                      {formatTime(item.returnedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono font-semibold text-slate-700">
                      {duration}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {inUse ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          En uso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} />
                          Devuelta
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Paginación Server-Side */}
        {total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            <div>
              Mostrando <span className="font-semibold text-slate-800">{startRecord}</span>–
              <span className="font-semibold text-slate-800">{endRecord}</span> de{' '}
              <span className="font-semibold text-slate-800">{total}</span> registros
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>

              <span className="px-2 font-medium">
                Página <span className="font-bold text-slate-800">{page}</span> de{' '}
                <span className="font-bold text-slate-800">{totalPages}</span>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Siguiente
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}