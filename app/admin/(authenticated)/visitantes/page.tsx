'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { listVisitors } from '@/app/actions/visitors'
import { Search, Filter, X } from 'lucide-react'

type Visitor = Awaited<ReturnType<typeof listVisitors>>[number]

const REASON_LABELS: Record<string, string> = {
  practicas: 'Prácticas',
  prueba_sistema: 'Prueba de sistema',
  revision_proyecto: 'Revisión de proyecto',
  servicio: 'Servicio',
  visita_cliente: 'Visita cliente',
  visita_corporativo: 'Visita corporativo',
  visita_proveedor: 'Visita de proveedor',
}

const ID_LABELS: Record<string, string> = {
  ine: 'INE',
  pasaporte: 'Pasaporte',
  licencia: 'Licencia de conducir',
  gafete_empresa: 'Gafete empresa',
}

function formatTime(date: Date | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function getDateRange(preset: string) {
  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  if (preset === 'hoy') return { from: today.toISOString(), to: todayEnd.toISOString() }
  if (preset === 'semana') { const w = new Date(today); w.setDate(today.getDate() - today.getDay()); return { from: w.toISOString(), to: todayEnd.toISOString() } }
  if (preset === 'mes') return { from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(), to: todayEnd.toISOString() }
  return { from: '', to: '' }
}

export default function AdminVisitantesPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [datePreset, setPreset] = useState('hoy')
  const [dateFrom, setFrom] = useState('')
  const [dateTo, setTo] = useState('')
  const [detail, setDetail] = useState<Visitor | null>(null)

  // Buscador
  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (search: string) => {
    setLoading(true)
    const range = datePreset !== 'personalizado' ? getDateRange(datePreset) : { from: dateFrom, to: dateTo }
    const data = await listVisitors({
      dateFrom: range.from || undefined,
      dateTo: range.to || undefined,
      search: search.trim() || undefined,
    })
    setVisitors(data)
    setLoading(false)
  }, [datePreset, dateFrom, dateTo])

  useEffect(() => { load(searchApplied) }, [load, searchApplied])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchApplied(value), 400)
  }

  const clearSearch = () => { setSearchInput(''); setSearchApplied('') }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitantes</h1>
        <p className="text-sm text-slate-500 mt-1">{visitors.length} visitante{visitors.length !== 1 ? 's' : ''} encontrado{visitors.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap items-end gap-3">

        {/* Buscador */}
        <div className="flex-1 min-w-[260px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">
            Buscar visitante
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nombre, empresa o folio..."
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
          <p className="text-[10px] text-slate-400 mt-1">Busca por nombre completo, empresa o folio</p>
        </div>

        <div className="w-px h-8 bg-slate-200 flex-shrink-0 hidden sm:block" />
        <Filter size={15} className="text-slate-400 flex-shrink-0 hidden sm:block" />

        {/* Fecha */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Fecha</label>
          <div className="flex gap-1 flex-wrap">
            {[
              { v: 'hoy', l: 'Hoy' },
              { v: 'semana', l: 'Semana' },
              { v: 'mes', l: 'Mes' },
              { v: 'personalizado', l: 'Personalizado' },
            ].map(({ v, l }) => (
              <button key={v} onClick={() => setPreset(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${datePreset === v ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>{l}</button>
            ))}
          </div>
        </div>

        {datePreset === 'personalizado' && (
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
              <input type="date" value={dateFrom} onChange={(e) => setFrom(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={(e) => setTo(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">
              {searchApplied
                ? `Sin resultados para "${searchApplied}"`
                : 'No hay visitantes en el período seleccionado'}
            </p>
            {searchApplied && (
              <button onClick={clearSearch} className="mt-2 text-xs text-blue-600 hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Folio</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Visitante</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Visita a</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Entrada</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Salida</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visitors.map((v) => {
                const entry = v.accessRecords.find((r) => r.movement === 'ENTRY')
                const exit = v.accessRecords.find((r) => r.movement === 'EXIT')
                const inside = entry && !exit
                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDetail(v)}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">{v.folio}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{v.fullName}</td>
                    <td className="px-5 py-3.5 text-slate-600">{v.company}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[140px] truncate">{v.visitTo}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-slate-700">{formatTime(entry?.timestamp)}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-slate-700">{formatTime(exit?.timestamp)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(v.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {inside && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Dentro
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {detail && <VisitorDetailModal visitor={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function VisitorDetailModal({ visitor, onClose }: { visitor: Visitor; onClose: () => void }) {
  const entry = visitor.accessRecords.find((r) => r.movement === 'ENTRY')
  const exit = visitor.accessRecords.find((r) => r.movement === 'EXIT')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detalle del visitante</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Folio #{visitor.folio}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          {([
            ['Nombre completo', visitor.fullName],
            ['Empresa', visitor.company],
            ['Visita a', visitor.visitTo],
            ['Motivo', REASON_LABELS[visitor.reason] ?? visitor.reason],
            ['Identificación', ID_LABELS[visitor.identificationType] ?? visitor.identificationType],
            ['Entrada', entry ? new Date(entry.timestamp).toLocaleString('es-MX') : '—'],
            ['Salida', exit ? new Date(exit.timestamp).toLocaleString('es-MX') : '—'],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest w-32 flex-shrink-0">{label}</span>
              <span className="text-sm text-slate-900 font-medium text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
