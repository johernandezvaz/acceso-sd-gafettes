import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet, Font,
} from '@react-pdf/renderer'
import type { DayBreakdown } from '@/app/actions/reports'

Font.register({ family: 'Helvetica', fonts: [] })

const COMPANY_HEADER = [
  'DEMO TECHNIC S. DE R.L. DE C.V.',
  'AVE LUIS G. URBINA 11527 COMPLEJO INDUSTRIAL CHIHUAHUA',
  'C.P 31109 TEL(614) 442-21-00 FAX. (614) 442-21-09',
]

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, paddingTop: 28, paddingBottom: 36, paddingHorizontal: 36, color: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottomWidth: 2, borderBottomColor: '#000000', paddingBottom: 8 },
  logo: { width: 60, height: 40, objectFit: 'contain', marginRight: 16 },
  companyBlock: { flex: 1 },
  companyLine: { fontSize: 8, lineHeight: 1.4 },
  companyLineBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', lineHeight: 1.4 },
  titleBlock: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 13, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  quincenaLabel: { fontSize: 8, marginTop: 2, color: '#444444' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 120, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  value: { flex: 1, fontSize: 8, borderBottomWidth: 0.5, borderBottomColor: '#999', paddingBottom: 1 },
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#000000', paddingVertical: 3, paddingHorizontal: 4 },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  tableRow: { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 4, borderBottomWidth: 0.3, borderBottomColor: '#cccccc' },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 4, backgroundColor: '#f5f5f5', borderBottomWidth: 0.3, borderBottomColor: '#cccccc' },
  cellDate: { width: '20%', fontSize: 7.5 },
  cellEntry: { width: '20%', fontSize: 7.5, textAlign: 'center' },
  cellExit: { width: '20%', fontSize: 7.5, textAlign: 'center' },
  cellHours: { width: '20%', fontSize: 7.5, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  cellNota: { width: '20%', fontSize: 7, color: '#777', textAlign: 'right' },
  totalRow: { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4, backgroundColor: '#000000' },
  totalLabel: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  totalValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  importeBlock: { borderWidth: 1, borderColor: '#000', padding: 8, marginBottom: 12 },
  importeRow: { flexDirection: 'row', marginBottom: 3 },
  importeLabel: { width: 120, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  importeValue: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  importeLetras: { fontSize: 7.5, fontFamily: 'Helvetica-Oblique', marginTop: 2, color: '#333' },
  signaturesBlock: { flexDirection: 'row', marginTop: 32, gap: 24 },
  signatureBox: { flex: 1, alignItems: 'center' },
  signatureLine: { borderTopWidth: 1, borderTopColor: '#000', width: '100%', marginBottom: 3 },
  signatureLabel: { fontSize: 7.5, textAlign: 'center', color: '#444' },
  signatureName: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  footerNote: { position: 'absolute', bottom: 16, left: 36, right: 36, fontSize: 7, color: '#777', textAlign: 'center' },
})


const PdfTableHeaderRow = () => (
  <View style={s.tableHeader}>
    <Text style={[s.tableHeaderCell, s.cellDate]}>Fecha</Text>
    <Text style={[s.tableHeaderCell, s.cellEntry]}>Entrada</Text>
    <Text style={[s.tableHeaderCell, s.cellExit]}>Salida</Text>
    <Text style={[s.tableHeaderCell, s.cellHours]}>Hrs.</Text>
    <Text style={[s.tableHeaderCell, s.cellNota]}>Nota</Text>
  </View>
)

function PdfDayRow({ day, index }: { day: DayBreakdown; index: number }) {
  return (
    <View style={index % 2 === 0 ? s.tableRow : s.tableRowAlt}>
      <Text style={s.cellDate}>{day.dateLabel}</Text>
      <Text style={s.cellEntry}>{day.entryTime ?? '—'}</Text>
      <Text style={s.cellExit}>{day.exitTime ?? '—'}</Text>
      <Text style={s.cellHours}>{day.horasRedondeadas}</Text>
      <Text style={s.cellNota}>{day.horasRedondeadas === 0 ? 'Sin registro' : ''}</Text>
    </View>
  )
}

function PdfHeaderBlock({ logoBase64 }: { logoBase64?: string }) {
  return (
    <View style={s.header}>
      {logoBase64 ? <Image style={s.logo} src={logoBase64} /> : null}
      <View style={s.companyBlock}>
        <Text style={s.companyLineBold}>{COMPANY_HEADER[0]}</Text>
        {COMPANY_HEADER.slice(1).map((l, i) => <Text key={i} style={s.companyLine}>{l}</Text>)}
      </View>
    </View>
  )
}

function PdfSignatures({
  solicitadoPor, autorizadoPor1, autorizadoPor2,
}: {
  solicitadoPor: string
  autorizadoPor1: string
  autorizadoPor2: string
}) {
  const boxes: [string, string][] = [
    ['Solicitado por', solicitadoPor],
    ['Autorizado por\n(Gerente General)', autorizadoPor1],
    ['Autorizado por\n(Gerente de Finanzas)', autorizadoPor2],
  ]
  return (
    <View style={s.signaturesBlock}>
      {boxes.map(([lbl, nombre]) => (
        <View key={lbl} style={s.signatureBox}>
          <View style={s.signatureLine} />
          <Text style={s.signatureName}>{nombre}</Text>
          <Text style={s.signatureLabel}>{lbl}</Text>
        </View>
      ))}
    </View>
  )
}


export interface PdfPracticanteProps {
  titulo: string
  quincenaLabel: string
  alumno: string
  beneficiario: string
  concepto: string
  solicitadoPor: string
  autorizadoPor1: string
  autorizadoPor2: string
  tarifa: number
  importeTotal: number
  importeEnLetras: string
  importeManual: boolean
  days: DayBreakdown[]
  totalHoras: number
  logoBase64?: string
}

export function PdfPracticante(props: PdfPracticanteProps) {
  const {
    titulo, quincenaLabel, alumno, beneficiario, concepto,
    solicitadoPor, autorizadoPor1, autorizadoPor2, tarifa,
    importeTotal, importeEnLetras, importeManual,
    days, totalHoras, logoBase64,
  } = props

  const MAX_ROWS_PAGE1 = 15
  const MAX_ROWS_REST = 26
  const page1Days = days.slice(0, MAX_ROWS_PAGE1)
  const extraDays = days.slice(MAX_ROWS_PAGE1)
  const extraPages: DayBreakdown[][] = []
  for (let i = 0; i < extraDays.length; i += MAX_ROWS_REST) {
    extraPages.push(extraDays.slice(i, i + MAX_ROWS_REST))
  }

  const footerRender = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
    `Página ${pageNumber} de ${totalPages}`

  return (
    <Document>

      <Page size="LETTER" style={s.page}>
        <PdfHeaderBlock logoBase64={logoBase64} />

        <View style={s.titleBlock}>
          <Text style={s.title}>{titulo}</Text>
          <Text style={s.quincenaLabel}>{quincenaLabel}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Datos del Documento</Text>
          {[['Alumno / Practicante', alumno], ['Beneficiario', beneficiario], ['Concepto', concepto]].map(([lbl, val]) => (
            <View key={lbl} style={s.row}>
              <Text style={s.label}>{lbl}:</Text>
              <Text style={s.value}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={s.importeBlock}>
          <View style={s.importeRow}><Text style={s.importeLabel}>Tarifa por hora:</Text><Text style={s.importeValue}>${tarifa.toFixed(2)} MXN</Text></View>
          <View style={s.importeRow}><Text style={s.importeLabel}>Total de horas:</Text><Text style={s.importeValue}>{totalHoras} hrs.</Text></View>
          <View style={s.importeRow}><Text style={s.importeLabel}>Importe total:</Text><Text style={s.importeValue}>${importeTotal.toFixed(2)} MXN {importeManual ? '(ajustado)' : ''}</Text></View>
          <Text style={s.importeLetras}>{importeEnLetras}</Text>
        </View>

        <View style={s.section}><Text style={s.sectionTitle}>Desglose de Horas del Periodo</Text></View>
        <View style={s.table}>
          <PdfTableHeaderRow />
          {page1Days.map((d, i) => <PdfDayRow key={d.dateKey} day={d} index={i} />)}
          {extraPages.length === 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TOTAL</Text>
              <Text style={s.totalValue}>{totalHoras} hrs.</Text>
            </View>
          )}
        </View>

        {extraPages.length === 0 && <PdfSignatures solicitadoPor={solicitadoPor} autorizadoPor1={autorizadoPor1} autorizadoPor2={autorizadoPor2} />}
        <Text style={s.footerNote} render={footerRender} fixed />
      </Page>

      {extraPages.map((chunk, pi) => (
        <Page key={pi} size="LETTER" style={s.page}>
          <PdfHeaderBlock logoBase64={logoBase64} />
          <View style={s.titleBlock}>
            <Text style={s.title}>{titulo}</Text>
            <Text style={s.quincenaLabel}>{quincenaLabel} — Desglose (cont.)</Text>
          </View>
          <View style={s.table}>
            <PdfTableHeaderRow />
            {chunk.map((d, i) => <PdfDayRow key={d.dateKey} day={d} index={i} />)}
            {pi === extraPages.length - 1 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>TOTAL</Text>
                <Text style={s.totalValue}>{totalHoras} hrs.</Text>
              </View>
            )}
          </View>
          {pi === extraPages.length - 1 && <PdfSignatures solicitadoPor={solicitadoPor} autorizadoPor1={autorizadoPor1} autorizadoPor2={autorizadoPor2} />}
          <Text style={s.footerNote} render={footerRender} fixed />
        </Page>
      ))}
    </Document>
  )
}
