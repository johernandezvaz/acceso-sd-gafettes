'use client'

import { useState } from 'react'
import { FileBarChart2, GraduationCap, Users } from 'lucide-react'
import dynamic from 'next/dynamic'

const ReportePracticante = dynamic(
  () => import('@/components/admin/reports/ReportePracticante'),
  { ssr: false, loading: () => <div className="py-12 text-center text-slate-400 text-sm">Cargando módulo...</div> }
)
const ReporteGeneral = dynamic(
  () => import('@/components/admin/reports/ReporteGeneral'),
  { ssr: false, loading: () => <div className="py-12 text-center text-slate-400 text-sm">Cargando módulo...</div> }
)

type Tab = 'practicantes' | 'general'

export default function AdminReportesPage() {
  const [tab, setTab] = useState<Tab>('practicantes')

  return (
    <div className="max-w-6xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileBarChart2 size={24} className="text-blue-700" />
          Reportes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Genera reportes de pago y asistencia por periodo quincenal
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab('practicantes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'practicantes'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <GraduationCap size={16} />
          Practicantes
        </button>
        <button
          onClick={() => setTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'general'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Users size={16} />
          Reporte General
        </button>
      </div>

      {tab === 'practicantes' ? <ReportePracticante /> : <ReporteGeneral />}
    </div>
  )
}
