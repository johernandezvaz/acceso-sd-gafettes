'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getDailyAccessRecords,
  updateAccessRecordTimestamp,
  createAccessRecordForDate,
  type DailyAccessRecordRow,
  type DailyMovementItem,
} from '@/app/actions/access'
import { getPersonTypes, type PersonTypeOption } from '@/app/actions/people'
import {
  Search, X, Calendar, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Timer, Check, Ban,
} from 'lucide-react'

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

  if (preset === 'hoy') return { from: today.toISOString(), to: todayEnd.toISOString() }

  if (preset === 'semana') {
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(now); monday.setDate(diff); monday.setHours(0, 0, 0, 0)
    return { from: monday.toISOString(), to: todayEnd.toISOString() }
  }

  if (preset === 'quincenal') {
    const year = now.getFullYear(); const month = now.getMonth(); const day = now.getDate()
    if (day <= 15) {
      return { from: new Date(year, month, 1, 0, 0, 0, 0).toISOString(), to: new Date(year, month, 15, 23, 59, 59, 999).toISOString() }
    } else {
      const lastDay = new Date(year, month + 1, 0).getDate()
      return { from: new Date(year, month, 16, 0, 0, 0, 0).toISOString(), to: new Date(year, month, lastDay, 23, 59, 59, 999).toISOString() }
    }
  }

  if (preset === 'mes') {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return { from: mStart.toISOString(), to: new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59, 999).toISOString() }
  }

  return { from: '', to: '' }
}

function isToday(dateKey: string): boolean {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return dateKey === `${y}-${m}-${d}`
}

function InlineTime({
  mov,
  onSaved,
  onError,
}: {
  mov: DailyMovementItem
  onSaved: (id: string, newTime: string) => void
  onError: (msg: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(mov.time)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const result = await updateAccessRecordTimestamp(mov.id, value)
    setSaving(false)
    if (result.success) {
      onSaved(mov.id, value)
      setEditing(false)
    } else {
      onError(result.error ?? 'Error al guardar')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(mov.time); setEditing(true) }}
        title="Clic para editar"
        className="group relative font-mono text-xs font-bold text-slate-800 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
      >
        {mov.time}
        {mov.editedAt && (
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400" title="Editado manualmente" />
        )}
      </button>
    )
  }

  return (
    <span className="flex items-center gap-0.5">
      <input
        type="time"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        autoFocus
        className="h-6 px-1.5 rounded border border-blue-400 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
      />
      <button onClick={handleSave} disabled={saving} className="p-0.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-40" title="Guardar">
        <Check size={12} />
      </button>
      <button onClick={() => setEditing(false)} disabled={saving} className="p-0.5 text-slate-400 hover:text-slate-600" title="Cancelar">
        <Ban size={12} />
      </button>
    </span>
  )
}

function InlineCreate({
  personId,
  dateKey,
  movement,
  onCreated,
  onError,
}: {
  personId: string
  dateKey: string
  movement: 'ENTRY' | 'EXIT'
  onCreated: (newTime: string, newId: string) => void
  onError: (msg: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const result = await createAccessRecordForDate(personId, movement, dateKey, value)
    setSaving(false)
    if (result.success && result.id) {
      onCreated(value, result.id)
      setEditing(false)
    } else {
      onError(result.error ?? 'Error al crear registro')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title={`Agregar ${movement === 'ENTRY' ? 'entrada' : 'salida'}`}
        className="font-mono text-xs text-slate-300 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
      >
        —
      </button>
    )
  }

  return (
    <span className="flex items-center gap-0.5">
      <input
        type="time"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        autoFocus
        className="h-6 px-1.5 rounded border border-blue-400 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
      />
      <button onClick={handleSave} disabled={saving || !value} className="p-0.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-40" title="Guardar">
        <Check size={12} />
      </button>
      <button onClick={() => setEditing(false)} disabled={saving} className="p-0.5 text-slate-400 hover:text-slate-600" title="Cancelar">
        <Ban size={12} />
      </button>
    </span>
  )
}

export default function AdminRegistrosPage() {
  const [rows, setRows] = useState<DailyAccessRecordRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [types, setTypes] = useState<PersonTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'IN_PROGRESS' | 'INCONSISTENT'>('all')
  const [datePreset, setDatePreset] = useState('hoy')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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

  useEffect(() => { getPersonTypes().then(setTypes) }, [])
  useEffect(() => { load(searchApplied, page) }, [load, searchApplied, page])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); setSearchApplied(value) }, 350)
  }

  const handlePresetChange = (preset: string) => { setDatePreset(preset); setPage(1) }

  const handleTimeSaved = (rowId: string, movId: string, newTime: string) => {
    setEditError(null)
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row
      const updatedMovs = row.movements.map(m =>
        m.id === movId ? { ...m, time: newTime, editedAt: new Date().toISOString() } : m
      )

      const firstEntry = updatedMovs.find(m => m.movement === 'ENTRY')
      const lastExit = [...updatedMovs].filter(m => m.movement === 'EXIT').pop()
      return {
        ...row,
        movements: updatedMovs,
        firstEntryTime: firstEntry?.time ?? row.firstEntryTime,
        lastExitTime: lastExit?.time ?? row.lastExitTime,
      }
    }))
  }

  const handleMovCreated = (
    rowId: string,
    movement: 'ENTRY' | 'EXIT',
    newTime: string,
    newId: string,
  ) => {
    setEditError(null)
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row
      const newMov: DailyMovementItem = {
        id: newId,
        movement,
        time: newTime,
        timestamp: new Date().toISOString(),
        editedAt: new Date().toISOString(),
      }
      const updatedMovs = [...row.movements, newMov].sort((a, b) => a.time.localeCompare(b.time))
      const firstEntry = updatedMovs.find(m => m.movement === 'ENTRY')
      const lastExit = [...updatedMovs].filter(m => m.movement === 'EXIT').pop()
      return {
        ...row,
        movements: updatedMovs,
        firstEntryTime: firstEntry?.time ?? row.firstEntryTime,
        lastExitTime: lastExit?.time ?? row.lastExitTime,
      }
    }))
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
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Buscar persona</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text" value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Nombre completo..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearchApplied(''); setPage(1) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200 flex-shrink-0 hidden lg:block" />

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" /> Fecha
          </label>
          <div className="flex gap-1 flex-wrap">
            {[{ v: 'hoy', l: 'Hoy' }, { v: 'semana', l: 'Esta Semana' }, { v: 'quincenal', l: 'Esta Quincena' }, { v: 'mes', l: 'Este Mes' }, { v: 'personalizado', l: 'Personalizado' }].map(({ v, l }) => (
              <button key={v} onClick={() => handlePresetChange(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${datePreset === v ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {datePreset === 'personalizado' && (
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div className="w-px h-8 bg-slate-200 flex-shrink-0 hidden lg:block" />

        <div className="min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Tipo</label>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="">Todos los tipos</option>
            {types.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest">Estado</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }} className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
            <option value="all">Todos</option>
            <option value="COMPLETED">Completo</option>
            <option value="IN_PROGRESS">En curso</option>
            <option value="INCONSISTENT">Inconsistente</option>
          </select>
        </div>
      </div>

      {editError && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 mb-3">
          <AlertCircle size={13} className="flex-shrink-0" />
          {editError}
          <button onClick={() => setEditError(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X size={12} /></button>
        </div>
      )}

      <p className="text-xs text-slate-400 mb-2 px-1">
        💡 Haz clic en una hora (o en <span className="font-mono">—</span>) para editarla.
        Solo se pueden modificar registros de días anteriores a hoy.
      </p>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(row => {
                const editable = !isToday(row.dateKey)

                const entryMov = row.movements.find(m => m.movement === 'ENTRY')
                const exitMov = [...row.movements].reverse().find(m => m.movement === 'EXIT')

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{row.personName}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(row.personTypeSlug)}`}>
                        {row.personTypeName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{row.formattedDate}</td>

                    <td className="px-5 py-3.5">
                      {editable ? (
                        entryMov ? (
                          <InlineTime
                            mov={entryMov}
                            onSaved={(id, t) => handleTimeSaved(row.id, id, t)}
                            onError={setEditError}
                          />
                        ) : (
                          <InlineCreate
                            personId={row.personId}
                            dateKey={row.dateKey}
                            movement="ENTRY"
                            onCreated={(t, id) => handleMovCreated(row.id, 'ENTRY', t, id)}
                            onError={setEditError}
                          />
                        )
                      ) : (
                        <span className="font-mono text-xs text-slate-800">{row.firstEntryTime || '—'}</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {editable ? (
                        exitMov ? (
                          <InlineTime
                            mov={exitMov}
                            onSaved={(id, t) => handleTimeSaved(row.id, id, t)}
                            onError={setEditError}
                          />
                        ) : (
                          <InlineCreate
                            personId={row.personId}
                            dateKey={row.dateKey}
                            movement="EXIT"
                            onCreated={(t, id) => handleMovCreated(row.id, 'EXIT', t, id)}
                            onError={setEditError}
                          />
                        )
                      ) : (
                        <span className="font-mono text-xs text-slate-800">{row.lastExitTime || '—'}</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-700">{row.formattedTotalHours}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : row.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                        {row.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : row.status === 'IN_PROGRESS' ? <Timer size={12} /> : <AlertCircle size={12} />}
                        {row.status === 'COMPLETED' ? 'Completo' : row.status === 'IN_PROGRESS' ? 'En curso' : 'Inconsistente'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-50 flex items-center gap-1"><ChevronLeft size={12} />Anterior</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg disabled:opacity-50 flex items-center gap-1">Siguiente<ChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
