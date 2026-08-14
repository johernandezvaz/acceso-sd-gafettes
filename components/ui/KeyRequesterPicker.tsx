'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, User, Building2, BadgeCheck, ChevronRight, Sparkles } from 'lucide-react'
import { searchKeyRequesters, type KeyRequesterOption } from '@/app/actions/keys'

interface KeyRequesterPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (requester: KeyRequesterOption) => void
}

const CLEANING_OPTION: KeyRequesterOption = {
  fullName: 'Limpieza',
  position: 'Personal de limpieza',
  department: 'Servicios Generales',
  type: 'CLEANING',
}

export default function KeyRequesterPicker({
  open,
  onClose,
  onSelect,
}: KeyRequesterPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KeyRequesterOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const data = await searchKeyRequesters(q)
      setResults(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSearched(false)
      doSearch('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open, doSearch])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 250)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-16 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">¿Quién solicita la llave?</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona una persona autorizada o el servicio de limpieza
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors select-none touch-manipulation"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Buscar por nombre, departamento, puesto o #..."
              className="w-full h-11 pl-10 pr-9 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-gradient-to-r from-amber-50/70 to-orange-50/50 border-b border-amber-100/80">
            <button
              type="button"
              onClick={() => onSelect(CLEANING_OPTION)}
              className="
                w-full p-3 bg-white hover:bg-amber-50/50 border-2 border-amber-300 hover:border-amber-400
                rounded-xl transition-all shadow-sm flex items-center justify-between gap-3 text-left
                active:scale-[0.99] select-none touch-manipulation group
              "
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 transition-colors">
                  <span className="text-xl">🧹</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-base font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      Limpieza
                    </p>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Sparkles size={10} />
                      Servicio
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    Personal del turno de limpieza
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-700 bg-amber-50 group-hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200/80 flex-shrink-0 transition-colors">
                Seleccionar
              </span>
            </button>
          </div>

          <div className="px-5 py-2 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Personas Autorizadas ({results.length})
            </span>
            {loading && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            )}
          </div>

          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : searched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <User size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No se encontraron personas con "{query}"
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Verifica el nombre, puesto o número de empleado en el catálogo de personal autorizado.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((host) => (
                <li key={host.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(host)}
                    className="
                      w-full px-5 py-3.5 text-left hover:bg-blue-50/70 transition-colors
                      flex items-center gap-3.5 group active:bg-blue-100/60
                      select-none touch-manipulation
                    "
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <User
                        size={16}
                        className="text-slate-500 group-hover:text-blue-700 transition-colors"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-900 truncate transition-colors">
                        {host.fullName}
                      </p>
                      <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                        {host.position}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Building2 size={11} className="text-slate-400" />
                          {host.department}
                        </span>
                        {host.employeeNumber && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <BadgeCheck size={11} className="text-slate-400" />
                            #{host.employeeNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-blue-600 flex-shrink-0 transition-colors"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex-shrink-0 flex items-center justify-between text-xs text-slate-500">
          <span>Fuente: Catálogo de Personal Autorizado (VisitHost)</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
