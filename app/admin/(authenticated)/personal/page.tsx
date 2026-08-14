'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  listPeople,
  getPersonTypes,
  createPerson,
  updatePerson,
  type PersonTypeOption,
} from '@/app/actions/people'
import { Plus, Search, ChevronDown, X, Check, AlertCircle, Pencil } from 'lucide-react'

type Person = Awaited<ReturnType<typeof listPeople>>[number]

const TYPE_COLORS: Record<string, string> = {
  practicantes: 'bg-sky-100 text-sky-700',
  medico: 'bg-cyan-100 text-cyan-700',
  limpieza: 'bg-indigo-100 text-indigo-700',
  seguridad: 'bg-violet-100 text-violet-700',
}

function getTypeColor(slug: string) {
  return TYPE_COLORS[slug] ?? 'bg-slate-100 text-slate-600'
}

export default function AdminPersonalPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [types, setTypes] = useState<PersonTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('todos')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editPerson, setEditPerson] = useState<Person | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [p, t] = await Promise.all([
      listPeople(),
      getPersonTypes(),
    ])
    setPeople(p)
    setTypes(t)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const tabs = [
    { slug: 'todos', label: 'Todos' },
    ...types.map((t) => ({ slug: t.slug, label: t.name })),
  ]

  const filtered = people.filter((p) => {
    const matchTab = activeTab === 'todos' || p.personType.slug === activeTab
    const matchSearch = search === '' || p.fullName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const handleToggleActive = async (person: Person) => {
    await updatePerson(person.id, { active: !person.active })
    await load()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal</h1>
          <p className="text-sm text-slate-500 mt-1">{people.length} personas registradas</p>
        </div>
        <button
          onClick={() => { setEditPerson(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 active:bg-blue-900 transition-colors"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-white border border-slate-200 rounded-xl p-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => setActiveTab(tab.slug)}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.slug
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No hay personas que coincidan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{p.fullName}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(p.personType.slug)}`}>
                      {p.personType.name}
                    </span>
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
                        onClick={() => { setEditPerson(p); setShowModal(true) }}
                        className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
        <PersonModal
          types={types}
          person={editPerson}
          onClose={() => setShowModal(false)}
          onSaved={async () => { setShowModal(false); await load() }}
        />
      )}
    </div>
  )
}

interface PersonModalProps {
  types: PersonTypeOption[]
  person: Person | null
  onClose: () => void
  onSaved: () => void
}

function PersonModal({ types, person, onClose, onSaved }: PersonModalProps) {
  const [fullName, setFullName] = useState(person?.fullName ?? '')
  const [personTypeId, setTypeId] = useState(person?.personTypeId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!fullName.trim()) { setError('El nombre es obligatorio'); return }
    if (!personTypeId) { setError('Selecciona el tipo de personal'); return }
    setSaving(true)
    if (person) {
      await updatePerson(person.id, { fullName: fullName.trim(), personTypeId })
    } else {
      await createPerson({ fullName: fullName.trim(), personTypeId })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {person ? 'Editar persona' : 'Agregar persona'}
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
              placeholder="Nombre y apellidos"
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tipo de personal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={personTypeId}
                onChange={(e) => { setTypeId(e.target.value); setError(null) }}
                className="w-full h-11 pl-4 pr-10 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm appearance-none"
              >
                <option value="">Seleccionar tipo...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
            className="w-full h-11 mt-1 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                {person ? 'Guardar cambios' : 'Agregar persona'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
