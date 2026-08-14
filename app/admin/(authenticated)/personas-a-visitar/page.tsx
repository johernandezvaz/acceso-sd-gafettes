'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  listAdminVisitHosts,
  createVisitHost,
  updateVisitHost,
  toggleVisitHostStatus,
  type VisitHostItem,
} from '@/app/actions/visitHosts'
import {
  Plus,
  Search,
  X,
  Check,
  AlertCircle,
  Pencil,
  Building2,
  BadgeCheck,
  UserCheck,
  UserX,
} from 'lucide-react'

export default function AdminPersonasAVisitarPage() {
  const [hosts, setHosts] = useState<VisitHostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState<'active' | 'inactive' | 'all'>('active')
  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingHost, setEditingHost] = useState<VisitHostItem | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (search: string, status: 'active' | 'inactive' | 'all') => {
    setLoading(true)
    try {
      const data = await listAdminVisitHosts({
        search: search.trim() || undefined,
        status: status,
      })
      setHosts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(searchApplied, statusTab)
  }, [load, searchApplied, statusTab])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchApplied(value), 300)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchApplied('')
  }

  const handleToggleStatus = async (host: VisitHostItem) => {
    const res = await toggleVisitHostStatus(host.id)
    if (res.success) {
      await load(searchApplied, statusTab)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personas a visitar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Catálogo de anfitriones disponibles para recibir visitas en el kiosco
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHost(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 active:bg-blue-900 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* Filtros: Status Tabs + Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl">
          {[
            { key: 'active', label: 'Activos', icon: UserCheck },
            { key: 'inactive', label: 'Inactivos', icon: UserX },
            { key: 'all', label: 'Todos', icon: Building2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setStatusTab(key as 'active' | 'inactive' | 'all')}
              className={`
                flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${statusTab === key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex-1 min-w-[280px] max-w-md relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre, no. empleado, departamento, puesto..."
            className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : hosts.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">
              {searchApplied
                ? `Sin resultados para "${searchApplied}"`
                : statusTab === 'active'
                  ? 'No hay personas activas'
                  : statusTab === 'inactive'
                    ? 'No hay personas inactivas'
                    : 'No hay personas registradas'}
            </p>
            {searchApplied && (
              <button onClick={clearSearch} className="mt-2 text-xs text-blue-600 hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  No. Emp.
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Nombre completo
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Departamento
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Puesto
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Estado
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hosts.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck size={12} className="text-slate-400" />
                      #{h.employeeNumber}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {h.fullName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" />
                      {h.department}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {h.position}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${h.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${h.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {h.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingHost(h)
                          setShowModal(true)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar persona"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(h)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${h.active
                            ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                            : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                      >
                        {h.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Creación / Edición */}
      {showModal && (
        <VisitHostModal
          host={editingHost}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false)
            await load(searchApplied, statusTab)
          }}
        />
      )}
    </div>
  )
}

interface VisitHostModalProps {
  host: VisitHostItem | null
  onClose: () => void
  onSaved: () => void
}

function VisitHostModal({ host, onClose, onSaved }: VisitHostModalProps) {
  const [employeeNumber, setEmployeeNumber] = useState(host?.employeeNumber ?? '')
  const [fullName, setFullName] = useState(host?.fullName ?? '')
  const [department, setDepartment] = useState(host?.department ?? '')
  const [position, setPosition] = useState(host?.position ?? '')
  const [active, setActive] = useState(host?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!employeeNumber.trim()) {
      setError('El número de empleado es obligatorio')
      return
    }
    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio')
      return
    }
    if (!department.trim()) {
      setError('El departamento es obligatorio')
      return
    }
    if (!position.trim()) {
      setError('El puesto es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    if (host) {
      const res = await updateVisitHost(host.id, {
        employeeNumber: employeeNumber.trim(),
        fullName: fullName.trim(),
        department: department.trim(),
        position: position.trim(),
        active,
      })
      if (!res.success) {
        setError(res.error ?? 'Error al actualizar')
        setSaving(false)
        return
      }
    } else {
      const res = await createVisitHost({
        employeeNumber: employeeNumber.trim(),
        fullName: fullName.trim(),
        department: department.trim(),
        position: position.trim(),
      })
      if (!res.success) {
        setError(res.error ?? 'Error al registrar')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {host ? 'Editar persona a visitar' : 'Agregar persona a visitar'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {host ? `ID: #${host.employeeNumber}` : 'Nuevo anfitrión en el catálogo'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Número de empleado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => {
                setEmployeeNumber(e.target.value)
                setError(null)
              }}
              placeholder="Ej. 1001"
              className="w-full h-10 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setError(null)
              }}
              placeholder="Nombre y apellidos"
              className="w-full h-10 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Departamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value)
                setError(null)
              }}
              placeholder="Ej. RECURSOS HUMANOS, MOLDEO, LEAN..."
              className="w-full h-10 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Puesto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value)
                setError(null)
              }}
              placeholder="Ej. SUPERVISOR DE CALIDAD..."
              className="w-full h-10 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>

          {host && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Estado en el Kiosco</p>
                <p className="text-[11px] text-slate-400">Si está inactivo, no aparecerá en el popup de visitas</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${active
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 mt-1 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                {host ? 'Guardar cambios' : 'Registrar persona'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}