import { getDashboardMetrics } from '@/app/actions/access'
import { listPeople } from '@/app/actions/people'
import { listVisitors } from '@/app/actions/visitors'
import StatsCard from '@/components/admin/StatsCard'
import {
  Users,
  LogIn,
  LogOut,
  UserCheck,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { getAccessRecords } from '@/app/actions/access'

export const dynamic = 'force-dynamic'

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default async function AdminDashboardPage() {
  const [metrics, recentRecords] = await Promise.all([
    getDashboardMetrics(),
    getAccessRecords({
      dateFrom: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      limit: 8,
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          label="Personal activo"
          value={metrics.activePersons}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
        />
        <StatsCard
          label="Entradas hoy"
          value={metrics.entradasHoy}
          icon={LogIn}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatsCard
          label="Salidas hoy"
          value={metrics.salidasHoy}
          icon={LogOut}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        />
        <StatsCard
          label="Dentro ahora"
          value={metrics.dentroAhora}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />
        <StatsCard
          label="Visitantes hoy"
          value={metrics.visitantesHoy}
          icon={UserCheck}
          iconBg="bg-violet-50"
          iconColor="text-violet-700"
        />
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Actividad de hoy</h2>
          <Link
            href={ROUTES.adminRegistros}
            className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
          >
            Ver todo <ArrowRight size={12} />
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Sin actividad registrada hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                    ${record.movement === 'ENTRY'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'}
                  `}>
                    {record.movement === 'ENTRY' ? 'Entrada' : 'Salida'}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{record.person.fullName}</span>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${record.person.personType.slug === 'practicantes' ? 'bg-sky-100 text-sky-700' :
                      record.person.personType.slug === 'medico' ? 'bg-cyan-100 text-cyan-700' :
                      record.person.personType.slug === 'limpieza' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-violet-100 text-violet-700'}
                  `}>
                    {record.person.personType.name}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {formatTime(record.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
