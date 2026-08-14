'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  listPeople,
  getPersonTypes,
  createPerson,
  updatePerson,
  type PersonTypeOption,
} from '@/app/actions/people'
import { Plus, Search, X, Check, AlertCircle, Pencil, Clock, CreditCard } from 'lucide-react'

type Transportista = Awaited<ReturnType<typeof listPeople>>[number]

export default function AdminTransportistasPage() {
  const [transportistas, setTransportistas] = useState<Transportista[]>([])
  const [transportistaTypeId, setTransportistaTypeId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Transportista | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [p, t] = await Promise.all([
      listPeople({ personTypeSlug: 'transportistas' }),
      getPersonTypes(),
    ])
    setTransportistas(p)
    const tType = t.find((type) => type.slug === 'transportistas')
    if (tType) setTransportistaTypeId(tType.id)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = transportistas.filter((p) => {
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.active) ||
      (statusFilter === 'inactive' && !p.active)
    const matchSearch =
      search === '' || p.fullName.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleToggleActive = async (item: Transportista) => {
    await updatePerson(item.id, { active: !item.active })
    await load()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Transportistas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {transportistas.length} transportista{transportistas.length !== 1 ? 's' : ''} registrado{transportistas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 active:bg-orange-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo transportista
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar transportista por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
          />
        </div>

        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {[
            { v: 'all', l: 'Todos' },
            { v: 'active', l: 'Activos' },
            { v: 'inactive', l: 'Inactivos' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v as 'all' | 'active' | 'inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === v ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No se encontraron transportistas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Horario habitual</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Pago</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                        {p.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span>{p.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 text-xs">
                    {p.scheduleEntry && p.scheduleExit ? (
                      <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock size={12} className="text-slate-400" />
                        {p.scheduleEntry} - {p.scheduleExit}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 text-xs">
                    {p.paymentFrequency ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <CreditCard size={12} className="text-slate-400" />
                        {p.paymentFrequency === 'MENSUAL'
                          ? 'Mensual'
                          : p.paymentFrequency === 'SEMANAL'
                          ? 'Semanal'
                          : 'Quincenal'}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditItem(p); setShowModal(true) }}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${p.active
                          ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                          : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                      >
                        {p.active ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <TransportistaModal
          personTypeId={transportistaTypeId}
          person={editItem}
          onClose={() => setShowModal(false)}
          onSaved={async () => { setShowModal(false); await load() }}
        />
      )}
    </div>
  )
}

interface TransportistaModalProps {
  personTypeId: string
  person: Transportista | null
  onClose: () => void
  onSaved: () => void
}

function TransportistaModal({ personTypeId, person, onClose, onSaved }: TransportistaModalProps) {
  const [fullName, setFullName] = useState(person?.fullName ?? '')
  const [scheduleEntry, setScheduleEntry] = useState(person?.scheduleEntry ?? '')
  const [scheduleExit, setScheduleExit] = useState(person?.scheduleExit ?? '')
  const [paymentFrequency, setPaymentFrequency] = useState<'SEMANAL' | 'QUINCENAL' | 'MENSUAL'>(
    (person?.paymentFrequency as 'SEMANAL' | 'QUINCENAL' | 'MENSUAL') ?? 'MENSUAL'
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!fullName.trim()) { setError('El nombre es obligatorio'); return }
    if (!personTypeId) { setError('Error de configuración del tipo transportistas'); return }
    setSaving(true)
    setError(null)
    const payload = {
      fullName: fullName.trim(),
      personTypeId,
      scheduleEntry: scheduleEntry.trim() || null,
      scheduleExit: scheduleExit.trim() || null,
      paymentFrequency,
    }

    const res = person
      ? await updatePerson(person.id, payload)
      : await createPerson(payload)

    setSaving(false)
    if (!res.success) {
      setError(res.error || 'Error al guardar');
      return;
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {person ? 'Editar transportista' : 'Nuevo transportista'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(null) }}
              placeholder="Nombre y apellidos del transportista"
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors text-sm"
            />
          </div>

          {/* Horario */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-orange-600" />
              Horario habitual
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">Hora de entrada</label>
                <input
                  type="time"
                  value={scheduleEntry}
                  onChange={(e) => { setScheduleEntry(e.target.value); setError(null) }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">Hora de salida</label>
                <input
                  type="time"
                  value={scheduleExit}
                  onChange={(e) => { setScheduleExit(e.target.value); setError(null) }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Periodicidad de Pago */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={13} className="text-emerald-600" />
              Periodicidad de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`
                  flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs
                  ${paymentFrequency === 'MENSUAL'
                    ? 'border-orange-600 bg-orange-50/50 text-orange-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/60 font-medium'}
                `}
              >
                <input
                  type="radio"
                  name="paymentFrequency"
                  value="MENSUAL"
                  checked={paymentFrequency === 'MENSUAL'}
                  onChange={() => setPaymentFrequency('MENSUAL')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Mensual</span>
              </label>

              <label
                className={`
                  flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs
                  ${paymentFrequency === 'QUINCENAL'
                    ? 'border-orange-600 bg-orange-50/50 text-orange-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/60 font-medium'}
                `}
              >
                <input
                  type="radio"
                  name="paymentFrequency"
                  value="QUINCENAL"
                  checked={paymentFrequency === 'QUINCENAL'}
                  onChange={() => setPaymentFrequency('QUINCENAL')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Quincenal</span>
              </label>

              <label
                className={`
                  flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs
                  ${paymentFrequency === 'SEMANAL'
                    ? 'border-orange-600 bg-orange-50/50 text-orange-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/60 font-medium'}
                `}
              >
                <input
                  type="radio"
                  name="paymentFrequency"
                  value="SEMANAL"
                  checked={paymentFrequency === 'SEMANAL'}
                  onChange={() => setPaymentFrequency('SEMANAL')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Semanal</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
              <AlertCircle size={14} />
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 mt-1 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 active:bg-orange-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                {person ? 'Guardar cambios' : 'Crear transportista'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
