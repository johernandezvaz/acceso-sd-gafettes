'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  listAdminKeys,
  getKeyMetrics,
  createKey,
  updateKey,
  type AdminKeyItem,
} from '@/app/actions/keys'
import {
  KeyRound,
  Plus,
  Search,
  X,
  Check,
  AlertCircle,
  Pencil,
  Clock,
  History,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminLlavesPage() {
  const [metrics, setMetrics] = useState({ disponibles: 0, enUso: 0, inactivas: 0, total: 0 })
  const [keys, setKeys] = useState<AdminKeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKey, setSearchKey] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingKey, setEditingKey] = useState<AdminKeyItem | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [keysData, metricsData] = await Promise.all([
        listAdminKeys(),
        getKeyMetrics(),
      ])
      setKeys(keysData)
      setMetrics(metricsData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleKeyActive = async (key: AdminKeyItem) => {
    await updateKey(key.id, { active: !key.active })
    await loadData()
  }

  const filteredKeys = keys.filter((k) =>
    searchKey === '' ||
    k.name.toLowerCase().includes(searchKey.toLowerCase()) ||
    (k.activeAssignment && k.activeAssignment.personName.toLowerCase().includes(searchKey.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de llaves</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administración de llaves, disponibilidad y control de estado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.adminRegistroLlaves}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            <History size={16} />
            Ver registro de llaves
            <ChevronRight size={14} className="text-slate-400" />
          </Link>
          <button
            onClick={() => {
              setEditingKey(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 active:bg-blue-900 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Agregar llave
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-emerald-800 tabular-nums">{metrics.disponibles}</p>
          <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Disponibles
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-800 tabular-nums">{metrics.enUso}</p>
          <p className="text-xs font-semibold text-red-700 mt-1 flex items-center gap-1.5">
            <Clock size={13} />
            En uso
          </p>
        </div>
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">
          <p className="text-2xl font-bold text-slate-700 tabular-nums">{metrics.inactivas}</p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Inactivas</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{metrics.total}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Total de llaves</p>
        </div>
      </div>

      {/* Buscador de catálogo */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Buscar por nombre de llave o empleado en posesión..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
        {searchKey && (
          <button
            onClick={() => setSearchKey('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabla de llaves */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="py-16 text-center">
            <KeyRound size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No se encontraron llaves</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Llave
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Estado
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  En posesión de
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Préstamos totales
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredKeys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          k.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : k.status === 'OCCUPIED'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <KeyRound size={16} />
                      </div>
                      <span className="font-bold text-slate-900">{k.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        k.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : k.status === 'OCCUPIED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          k.status === 'AVAILABLE'
                            ? 'bg-emerald-500'
                            : k.status === 'OCCUPIED'
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-slate-400'
                        }`}
                      />
                      {k.status === 'AVAILABLE'
                        ? 'Disponible'
                        : k.status === 'OCCUPIED'
                        ? 'En uso'
                        : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">
                    {k.activeAssignment ? (
                      <div>
                        <p className="font-semibold text-slate-900">{k.activeAssignment.personName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {k.activeAssignment.personDepartment} · Tomada {formatDateTime(k.activeAssignment.takenAt)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-xs font-semibold text-slate-600">
                    {k._count.assignments}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingKey(k)
                          setShowModal(true)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar nombre"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleKeyActive(k)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          k.active
                            ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                            : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        {k.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear / Editar Llave */}
      {showModal && (
        <KeyModal
          keyItem={editingKey}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false)
            await loadData()
          }}
        />
      )}
    </div>
  )
}

interface KeyModalProps {
  keyItem: AdminKeyItem | null
  onClose: () => void
  onSaved: () => void
}

function KeyModal({ keyItem, onClose, onSaved }: KeyModalProps) {
  const [name, setName] = useState(keyItem?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre de la llave es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    if (keyItem) {
      const res = await updateKey(keyItem.id, { name: name.trim() })
      if (!res.success) {
        setError(res.error ?? 'Error al actualizar')
        setSaving(false)
        return
      }
    } else {
      const res = await createKey(name.trim())
      if (!res.success) {
        setError(res.error ?? 'Error al crear la llave')
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
          <h2 className="text-lg font-bold text-slate-900">
            {keyItem ? 'Editar llave' : 'Agregar nueva llave'}
          </h2>
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
              Nombre de la llave / sala <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="Ej. Sala Mezquite, Enfermería..."
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
              autoFocus
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 mt-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                {keyItem ? 'Guardar cambios' : 'Crear llave'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}