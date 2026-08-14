'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'
import type { PersonOption } from '@/app/actions/people'

interface PersonComboboxProps {
  people: PersonOption[]
  value: string | null
  onChange: (person: PersonOption | null) => void
  placeholder?: string
  disabled?: boolean
}

export default function PersonCombobox({
  people,
  value,
  onChange,
  placeholder = 'Seleccionar persona',
  disabled = false,
}: PersonComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = people.find((p) => p.id === value) ?? null

  const filtered = people.filter((p) =>
    search === '' || p.fullName.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const TYPE_COLORS: Record<string, string> = {
    practicantes: 'text-sky-600',
    medico: 'text-cyan-600',
    limpieza: 'text-indigo-600',
    seguridad: 'text-violet-600',
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); setSearch('') }}
        className={`
          w-full h-14 px-4 pr-10 text-base rounded-xl border-2 bg-white
          flex items-center justify-between text-left
          transition-colors select-none touch-manipulation
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}
          ${!selected ? 'text-slate-400' : 'text-slate-900'}
        `}
      >
        <span className="truncate">
          {selected ? selected.fullName : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Búsqueda */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar persona..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                No se encontraron personas
              </div>
            ) : (
              filtered.map((person) => {
                const isSelected = person.id === value
                const typeColor = TYPE_COLORS[person.personTypeSlug] ?? 'text-slate-500'
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => {
                      onChange(person)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`
                      w-full px-4 py-3 flex items-center justify-between text-left
                      transition-colors touch-manipulation select-none
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50 active:bg-slate-100'}
                    `}
                  >
                    <div>
                      <p className={`text-base font-medium ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                        {person.fullName}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${typeColor}`}>
                        {person.personTypeName}
                      </p>
                    </div>
                    {isSelected && <Check size={16} className="text-blue-700 flex-shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
