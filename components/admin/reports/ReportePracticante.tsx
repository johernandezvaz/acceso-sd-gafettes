'use client'

import { useState, useEffect, useCallback } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown, Calculator, AlertTriangle, User, Calendar } from 'lucide-react'
import {
  getActivePracticantes,
  getAccessRecordsForPeriod,
  logReportAmountOverride,
  type PracticanteOption,
  type DayBreakdown,
} from '@/app/actions/reports'
import { buildDayBreakdown } from '@/lib/reports/breakdown'
import {
  getQuincenaRange,
  getQuincenaLabel,
  getDaysInQuincena,
  getCurrentQuincena,
  type Quincena,
} from '@/lib/reports/quincenal'
import { importeEnLetras } from '@/lib/reports/numberToWords'
import { PdfPracticante } from '@/lib/reports/pdfPracticante'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const inputCls = 'w-full h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors bg-white'
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-widest'

export default function ReportePracticante() {
  const now = getCurrentQuincena()

  const [practicantes, setPracticantes] = useState<PracticanteOption[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [quincena, setQuincena] = useState<Quincena>(now.quincena)

  const [titulo, setTitulo] = useState('SOLICITUD DE TRANSFERENCIA')
  const [beneficiario, setBeneficiario] = useState('')
  const [concepto, setConcepto] = useState('BECA PRACTICAS PROFESIONALES')
  const [solicitadoPor, setSolicitadoPor] = useState('')
  const [autorizadoPor, setAutorizadoPor] = useState('')
  const [tarifa, setTarifa] = useState(45)
  const [tarifaInput, setTarifaInput] = useState('45')

  const [days, setDays] = useState<DayBreakdown[]>([])
  const [totalHoras, setTotalHoras] = useState(0)
  const [importeCalc, setImporteCalc] = useState(0)
  const [importeManualStr, setImporteManualStr] = useState('')
  const [importeManual, setImporteManual] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [logoBase64, setLogoBase64] = useState<string | undefined>()

  useEffect(() => {
    fetch('/safe-demo_logo-blc-Photoroom.png')
      .then(r => r.blob())
      .then(b => {
        const reader = new FileReader()
        reader.onloadend = () => setLogoBase64(reader.result as string)
        reader.readAsDataURL(b)
      })
      .catch(() => { })
  }, [])

  useEffect(() => {
    getActivePracticantes().then(setPracticantes)
  }, [])

  const selectedPracticante = practicantes.find(p => p.id === selectedId)

  const loadData = useCallback(async () => {
    if (!selectedId) return
    setLoadingData(true)
    const { from, to } = getQuincenaRange(year, month, quincena)
    const records = await getAccessRecordsForPeriod(selectedId, from, to)
    const daysInPeriod = getDaysInQuincena(year, month, quincena)
    const breakdown = buildDayBreakdown(records, daysInPeriod)
    const total = breakdown.reduce((s, d) => s + d.horasRedondeadas, 0)
    setDays(breakdown)
    setTotalHoras(total)
    const calc = total * tarifa
    setImporteCalc(calc)
    setImporteManualStr('')
    setImporteManual(false)
    setLoadingData(false)
  }, [selectedId, year, month, quincena, tarifa])

  useEffect(() => { loadData() }, [loadData])

  const importeFinal = importeManual && importeManualStr !== ''
    ? parseFloat(importeManualStr) || 0
    : importeCalc

  const importeLetras = importeEnLetras(importeFinal)

  const handleImporteChange = (v: string) => {
    setImporteManualStr(v)
    setImporteManual(true)
    if (parseFloat(v) !== importeCalc && selectedPracticante) {
      logReportAmountOverride({
        practicanteId: selectedId,
        practicanteName: selectedPracticante.fullName,
        quincenaLabel: getQuincenaLabel(year, month, quincena),
        calculatedAmount: importeCalc,
        manualAmount: parseFloat(v) || 0,
      }).catch(() => { })
    }
  }

  const quincenaLabel = getQuincenaLabel(year, month, quincena)

  const years = Array.from({ length: 5 }, (_, i) => now.year - 2 + i)
  const hasData = selectedId && days.length > 0

  const pdfDoc = hasData ? (
    <PdfPracticante
      titulo={titulo}
      quincenaLabel={quincenaLabel}
      alumno={selectedPracticante?.fullName ?? ''}
      beneficiario={beneficiario}
      concepto={concepto}
      solicitadoPor={solicitadoPor}
      autorizadoPor={autorizadoPor}
      tarifa={tarifa}
      importeTotal={importeFinal}
      importeEnLetras={importeLetras}
      importeManual={importeManual}
      days={days}
      totalHoras={totalHoras}
      logoBase64={logoBase64}
    />
  ) : null

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <User size={16} className="text-sky-500" /> Selección
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Practicante</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputCls}>
              <option value="">— Selecciona un practicante —</option>
              {practicantes.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
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
      </div>

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition-opacity ${!selectedId ? 'opacity-40 pointer-events-none' : ''}`}>
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" /> Datos del Documento
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Título del documento</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls} placeholder="SOLICITUD DE TRANSFERENCIA" />
          </div>
          <div>
            <label className={labelCls}>Beneficiario</label>
            <input type="text" value={beneficiario} onChange={e => setBeneficiario(e.target.value)} className={inputCls} placeholder="Nombre del beneficiario" />
          </div>
          <div>
            <label className={labelCls}>Alumno (automático)</label>
            <input type="text" value={selectedPracticante?.fullName ?? ''} readOnly className={inputCls + ' bg-slate-50 text-slate-500'} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Concepto</label>
            <input type="text" value={concepto} onChange={e => setConcepto(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Solicitado por</label>
            <input type="text" value={solicitadoPor} onChange={e => setSolicitadoPor(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Autorizado por</label>
            <input type="text" value={autorizadoPor} onChange={e => setAutorizadoPor(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition-opacity ${!selectedId ? 'opacity-40 pointer-events-none' : ''}`}>
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Calculator size={16} className="text-emerald-500" /> Cálculo de Pago
        </h2>

        {loadingData ? (
          <div className="py-6 text-center"><span className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className={labelCls}>Tarifa por hora (MXN)</label>
                <input
                  type="number" min={0} step={0.5}
                  value={tarifaInput}
                  onChange={e => { setTarifaInput(e.target.value); setTarifa(parseFloat(e.target.value) || 0) }}
                  className="w-32 h-9 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className={labelCls}>Total horas (calculado)</label>
                <div className="h-9 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 flex items-center">{totalHoras} hrs.</div>
              </div>
              <div>
                <label className={labelCls}>Importe calculado (MXN)</label>
                <div className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 flex items-center">${importeCalc.toFixed(2)}</div>
              </div>
              <div>
                <label className={labelCls}>Importe final (editable)</label>
                <input
                  type="number" min={0} step={0.01}
                  value={importeManualStr !== '' ? importeManualStr : importeCalc.toFixed(2)}
                  onChange={e => handleImporteChange(e.target.value)}
                  className="w-36 h-9 px-3 rounded-xl border border-amber-300 text-sm font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {importeManual && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>El importe fue modificado manualmente. El cambio quedó registrado en los logs de auditoría.</span>
              </div>
            )}

            <p className="text-xs text-slate-500 font-medium italic">{importeLetras}</p>
          </>
        )}
      </div>

      {hasData && !loadingData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-sm font-semibold text-slate-700">Desglose — {quincenaLabel}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="text-left px-4 py-2 text-xs font-semibold">Fecha</th>
                <th className="text-center px-4 py-2 text-xs font-semibold">Entrada</th>
                <th className="text-center px-4 py-2 text-xs font-semibold">Salida</th>
                <th className="text-center px-4 py-2 text-xs font-semibold">Horas redondeadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {days.map((d, i) => (
                <tr key={d.dateKey} className={i % 2 === 0 ? '' : 'bg-slate-50/60'}>
                  <td className="px-4 py-2 text-xs">{d.dateLabel}</td>
                  <td className="px-4 py-2 text-xs font-mono text-center">{d.entryTime ?? '—'}</td>
                  <td className="px-4 py-2 text-xs font-mono text-center">{d.exitTime ?? '—'}</td>
                  <td className="px-4 py-2 text-xs font-bold text-center">{d.horasRedondeadas}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800 text-white">
                <td colSpan={3} className="px-4 py-2 text-xs font-bold">TOTAL</td>
                <td className="px-4 py-2 text-xs font-bold text-center">{totalHoras} hrs.</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {hasData && !loadingData && pdfDoc && (
        <div className="flex justify-end">
          <PDFDownloadLink
            document={pdfDoc}
            fileName={`reporte-${selectedPracticante?.fullName.replace(/\s+/g, '-')}-${quincenaLabel.replace(/\s/g, '-')}.pdf`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors active:scale-95"
          >
            {({ loading }) => loading
              ? 'Generando PDF...'
              : (<><FileDown size={16} /> Descargar PDF</>)}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  )
}
