'use client'

import { useState, useEffect, useCallback } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown, Users } from 'lucide-react'
import {
  getPersonsForGeneralReport,
  getAccessRecordsForPeriodMultiple,
  type PersonForReport,
} from '@/app/actions/reports'
import { buildDayBreakdown } from '@/lib/reports/breakdown'
import {
  getQuincenaRange,
  getQuincenaLabel,
  getDaysInQuincena,
  getCurrentQuincena,
  type Quincena,
} from '@/lib/reports/quincenal'
import { getPersonTypes, type PersonTypeOption } from '@/app/actions/people'
import { PdfGeneral, type PersonReportData } from '@/lib/reports/pdfGeneral'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const inputCls = 'w-full h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors bg-white'
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest'

export default function ReporteGeneral() {
  const now = getCurrentQuincena()

  const [personTypes, setPersonTypes] = useState<PersonTypeOption[]>([])
  const [persons, setPersons] = useState<PersonForReport[]>([])
  const [typeFilter, setTypeFilter] = useState('')
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [quincena, setQuincena] = useState<Quincena>(now.quincena)
  const [titulo, setTitulo] = useState('SOLICITUD DE TRANSFERENCIA')

  const [reportData, setReportData] = useState<PersonReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [logoBase64, setLogoBase64] = useState<string | undefined>()

  useEffect(() => {
    fetch('/safe-demo_logo-blc-Photoroom.png')
      .then(r => r.blob())
      .then(b => { const reader = new FileReader(); reader.onloadend = () => setLogoBase64(reader.result as string); reader.readAsDataURL(b) })
      .catch(() => { })
  }, [])

  useEffect(() => { getPersonTypes().then(setPersonTypes) }, [])

  useEffect(() => {
    getPersonsForGeneralReport(typeFilter || undefined).then(setPersons)
  }, [typeFilter])

  const years = Array.from({ length: 5 }, (_, i) => now.year - 2 + i)
  const quincenaLabel = getQuincenaLabel(year, month, quincena)

  const generateReport = useCallback(async () => {
    if (persons.length === 0) return
    setLoading(true)
    const { from, to } = getQuincenaRange(year, month, quincena)
    const daysInPeriod = getDaysInQuincena(year, month, quincena)
    const allRecords = await getAccessRecordsForPeriodMultiple(persons.map(p => p.id), from, to)

    const data: PersonReportData[] = persons.map(person => {
      const personRecords = allRecords.filter(r => r.personId === person.id)
      const days = buildDayBreakdown(personRecords, daysInPeriod)
      const totalHorasRedondeadas = days.reduce((s, d) => s + d.horasRedondeadas, 0)
      return { person, days, totalHorasRedondeadas }
    })

    setReportData(data)
    setLoading(false)
  }, [persons, year, month, quincena])

  const pdfDoc = reportData.length > 0 ? (
    <PdfGeneral
      titulo={titulo}
      quincenaLabel={quincenaLabel}
      persons={reportData}
      logoBase64={logoBase64}
    />
  ) : null

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Users size={16} className="text-indigo-500" /> Configuración del Reporte
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Título del documento</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls} placeholder="SOLICITUD DE TRANSFERENCIA" />
          </div>
          <div>
            <label className={labelCls}>Tipo de personal</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={inputCls}>
              <option value="">Todos (excl. Practicantes)</option>
              {personTypes
                .filter(t => t.slug !== 'practicantes')
                .map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Mes</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={inputCls}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Año</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className={inputCls}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Quincena</label>
              <select value={quincena} onChange={e => setQuincena(Number(e.target.value) as Quincena)} className={inputCls}>
                <option value={1}>1ª</option>
                <option value={2}>2ª</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">{persons.length} persona{persons.length !== 1 ? 's' : ''} incluida{persons.length !== 1 ? 's' : ''} · {quincenaLabel}</p>
          <button
            onClick={generateReport}
            disabled={persons.length === 0 || loading}
            className="px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Calculando...' : 'Calcular Reporte'}
          </button>
        </div>
      </div>

      {reportData.length > 0 && (
        <div className="space-y-4">
          {reportData.map(pr => (
            <div key={pr.person.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{pr.person.fullName}</p>
                  <p className="text-xs text-slate-400">{pr.person.personTypeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-sm font-bold text-white">{pr.totalHorasRedondeadas} hrs.</p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Fecha</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500">Entrada</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500">Salida</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500">Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pr.days.map((d, i) => (
                    <tr key={d.dateKey} className={i % 2 === 0 ? '' : 'bg-slate-50/60'}>
                      <td className="px-4 py-1.5 text-xs">{d.dateLabel}</td>
                      <td className="px-4 py-1.5 text-xs font-mono text-center">{d.entryTime ?? '—'}</td>
                      <td className="px-4 py-1.5 text-xs font-mono text-center">{d.exitTime ?? '—'}</td>
                      <td className="px-4 py-1.5 text-xs font-bold text-center">{d.horasRedondeadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="flex justify-end">
            {pdfDoc && (
              <PDFDownloadLink
                document={pdfDoc}
                fileName={`reporte-general-${quincenaLabel.replace(/\s/g, '-')}.pdf`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors active:scale-95"
              >
                {({ loading: l }) => l ? 'Generando PDF...' : (<><FileDown size={16} /> Descargar PDF</>)}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      )}

      {reportData.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center text-slate-400 text-sm shadow-sm">
          Configura los filtros y presiona <strong>Calcular Reporte</strong> para ver el desglose.
        </div>
      )}
    </div>
  )
}
