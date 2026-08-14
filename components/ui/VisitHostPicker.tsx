'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, User, Building2, BadgeCheck, ChevronRight } from 'lucide-react'
import { searchVisitHosts, type VisitHostOption } from '@/app/actions/visitors'

interface VisitHostPickerProps {
  value: VisitHostOption | null
  onChange: (host: VisitHostOption) => void
  error?: boolean
}

export default function VisitHostPicker({ value, onChange, error }: VisitHostPickerProps) {
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<VisitHostOption[]>([])
  const [loading, setLoading]     = useState(false)
  const [searched, setSearched]   = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSearched(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await searchVisitHosts(q)
      setResults(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleSelect = (host: VisitHostOption) => {
    onChange(host)
    setOpen(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setOpen(false)
  }

  // ── Trigger button ────────────────────────────────────────────────────────
  const triggerClass = [
    'w-full min-h-[52px] px-4 py-3 text-base rounded-xl border-2 bg-white',
    'focus:outline-none focus:ring-2 transition-colors text-left flex items-center justify-between gap-2',
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500',
  ].join(' ')

  return (
    <>
      {/* ── Trigger ── */}
      <button
        type="button"
        id="visitHostId"
        onClick={() => setOpen(true)}
        className={triggerClass}
      >
        {value ? (
          <span className="flex-1 min-w-0">
            <span className="block text-slate-900 font-medium truncate">{value.fullName}</span>
            <span className="block text-xs text-slate-500 truncate">{value.position} · {value.department}</span>
          </span>
        ) : (
          <span className="text-slate-400">Seleccionar persona...</span>
        )}
        <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-900/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-base font-bold text-slate-900">A quien visita</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Buscar por nombre, departamento, puesto..."
                  className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                />
                {query && (
                  <button
                    onClick={() => handleQueryChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Limpiar busqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                Nombre, numero de empleado, departamento o puesto
              </p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <span className="inline-block w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : !query.trim() ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Search size={28} className="text-slate-200" />
                  <p className="text-sm text-slate-400">Escribe para buscar</p>
                </div>
              ) : searched && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <User size={28} className="text-slate-200" />
                  <p className="text-sm text-slate-400 font-medium">Sin resultados para <strong>"{query}"</strong></p>
                  <p className="text-xs text-slate-400">Intenta buscar por nombre, departamento o puesto</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {results.map((host) => (
                    <li key={host.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(host)}
                        className="w-full px-5 py-3.5 text-left hover:bg-blue-50 transition-colors flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                          <User size={14} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{host.fullName}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{host.position}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                              <Building2 size={9} />
                              {host.department}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                              <BadgeCheck size={9} />
                              #{host.employeeNumber}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0 mt-1.5 transition-colors" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer hint */}
            {searched && results.length > 0 && (
              <div className="px-5 py-2.5 border-t border-slate-100 flex-shrink-0">
                <p className="text-[10px] text-slate-400 text-center">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} · Selecciona para confirmar
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}