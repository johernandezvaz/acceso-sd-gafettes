'use client'

import { useState } from 'react'
import { Check, Ban } from 'lucide-react'
import { updateAccessRecordTimestamp, createAccessRecordForDate } from '@/app/actions/access'

export function InlineTime({
  id,
  time,
  editedAt,
  onSaved,
  onError,
}: {
  id: string
  time: string
  editedAt?: string | null
  onSaved: (id: string, newTime: string) => void
  onError: (msg: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(time)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value) return
    setSaving(true)
    const result = await updateAccessRecordTimestamp(id, value)
    setSaving(false)
    if (result.success) {
      onSaved(id, value)
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
        onClick={() => { setValue(time); setEditing(true) }}
        title="Clic para editar hora"
        className="group relative font-mono text-xs font-bold text-slate-800 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
      >
        {time}
        {editedAt && (
          <span
            className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400"
            title="Editado manualmente"
          />
        )}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <input
        type="time"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        autoFocus
        className="h-6 px-1.5 rounded border border-blue-400 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
      />
      <button
        onClick={handleSave}
        disabled={saving || !value}
        className="p-0.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-40 cursor-pointer"
        title="Guardar"
      >
        <Check size={12} />
      </button>
      <button
        onClick={() => setEditing(false)}
        disabled={saving}
        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        title="Cancelar"
      >
        <Ban size={12} />
      </button>
    </span>
  )
}

export function InlineCreate({
  personId,
  dateKey,
  movement,
  onCreated,
  onError,
}: {
  personId: string
  dateKey: string
  movement: 'ENTRY' | 'EXIT'
  onCreated: (dateKey: string, movement: 'ENTRY' | 'EXIT', newTime: string, newId: string) => void
  onError: (msg: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value) return
    setSaving(true)
    const result = await createAccessRecordForDate(personId, movement, dateKey, value)
    setSaving(false)
    if (result.success && result.id) {
      onCreated(dateKey, movement, value, result.id)
      setEditing(false)
      setValue('')
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
    <span className="inline-flex items-center gap-0.5">
      <input
        type="time"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        autoFocus
        className="h-6 px-1.5 rounded border border-blue-400 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
      />
      <button
        onClick={handleSave}
        disabled={saving || !value}
        className="p-0.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-40 cursor-pointer"
        title="Guardar"
      >
        <Check size={12} />
      </button>
      <button
        onClick={() => setEditing(false)}
        disabled={saving}
        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        title="Cancelar"
      >
        <Ban size={12} />
      </button>
    </span>
  )
}
