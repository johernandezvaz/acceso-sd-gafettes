
import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { DayBreakdown, PersonForReport } from '@/app/actions/reports'

const COMPANY_HEADER = [
  'DEMO TECHNIC S. DE R.L. DE C.V.',
  'AVE LUIS G. URBINA 11527 COMPLEJO INDUSTRIAL CHIHUAHUA',
  'C.P 31109 TEL(614) 442-21-00 FAX. (614) 442-21-09',
]

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, paddingTop: 28, paddingBottom: 36, paddingHorizontal: 36, color: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderBottomWidth: 2, borderBottomColor: '#000000', paddingBottom: 6 },
  logo: { width: 56, height: 38, objectFit: 'contain', marginRight: 14 },
  companyBlock: { flex: 1 },
  companyLineBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', lineHeight: 1.4 },
  companyLine: { fontSize: 7.5, lineHeight: 1.4 },
  titleBlock: { alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 13, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  quincenaLabel: { fontSize: 8, marginTop: 2, color: '#444' },
  employeeBlock: { marginBottom: 14 },
  employeeHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#000000', paddingVertical: 4, paddingHorizontal: 6, marginBottom: 0 },
  employeeName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  employeeType: { fontSize: 7.5, color: '#cccccc', alignSelf: 'flex-end' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#333333', paddingVertical: 2.5, paddingHorizontal: 4 },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  tableRow: { flexDirection: 'row', paddingVertical: 2, paddingHorizontal: 4, borderBottomWidth: 0.3, borderBottomColor: '#cccccc' },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 2, paddingHorizontal: 4, backgroundColor: '#f5f5f5', borderBottomWidth: 0.3, borderBottomColor: '#cccccc' },
  cellDate: { width: '25%', fontSize: 7.5 },
  cellEntry: { width: '25%', fontSize: 7.5, textAlign: 'center' },
  cellExit: { width: '25%', fontSize: 7.5, textAlign: 'center' },
  cellHours: { width: '25%', fontSize: 7.5, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  totalRow: { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 4, backgroundColor: '#222222' },
  totalLabel: { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  totalValue: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  footerNote: { position: 'absolute', bottom: 16, left: 36, right: 36, fontSize: 7, color: '#777', textAlign: 'center' },
})


function GHeaderBlock({ logoBase64 }: { logoBase64?: string }) {
  return (
    <View style={s.header} fixed>
      {logoBase64 ? <Image style={s.logo} src={logoBase64} /> : null}
      <View style={s.companyBlock}>
        <Text style={s.companyLineBold}>{COMPANY_HEADER[0]}</Text>
        {COMPANY_HEADER.slice(1).map((l, i) => <Text key={i} style={s.companyLine}>{l}</Text>)}
      </View>
    </View>
  )
}

const GTableHeaderRow = () => (
  <View style={s.tableHeader}>
    <Text style={[s.tableHeaderCell, s.cellDate]}>Fecha</Text>
    <Text style={[s.tableHeaderCell, s.cellEntry]}>Entrada</Text>
    <Text style={[s.tableHeaderCell, s.cellExit]}>Salida</Text>
    <Text style={[s.tableHeaderCell, s.cellHours]}>Horas</Text>
  </View>
)

function GDayRow({ day, index }: { day: DayBreakdown; index: number }) {
  return (
    <View style={index % 2 === 0 ? s.tableRow : s.tableRowAlt}>
      <Text style={s.cellDate}>{day.dateLabel}</Text>
      <Text style={s.cellEntry}>{day.entryTime ?? '—'}</Text>
      <Text style={s.cellExit}>{day.exitTime ?? '—'}</Text>
      <Text style={s.cellHours}>{day.horasRedondeadas} hrs.</Text>
    </View>
  )
}


export interface PersonReportData {
  person: PersonForReport
  days: DayBreakdown[]
  totalHorasRedondeadas: number
}

export interface PdfGeneralProps {
  titulo: string
  quincenaLabel: string
  persons: PersonReportData[]
  logoBase64?: string
}

export function PdfGeneral({ titulo, quincenaLabel, persons, logoBase64 }: PdfGeneralProps) {
  const footerRender = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
    `Página ${pageNumber} de ${totalPages}`

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <GHeaderBlock logoBase64={logoBase64} />

        <View style={s.titleBlock} fixed>
          <Text style={s.title}>{titulo}</Text>
          <Text style={s.quincenaLabel}>{quincenaLabel}</Text>
        </View>

        {persons.map(pr => (
          <View key={pr.person.id} style={s.employeeBlock} wrap={false}>
            <View style={s.employeeHeader}>
              <Text style={s.employeeName}>{pr.person.fullName}</Text>
              <Text style={s.employeeType}>{pr.person.personTypeName}</Text>
            </View>
            <GTableHeaderRow />
            {pr.days.map((d, i) => <GDayRow key={d.dateKey} day={d} index={i} />)}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TOTAL {pr.person.fullName.split(' ')[0]}</Text>
              <Text style={s.totalValue}>{pr.totalHorasRedondeadas} hrs.</Text>
            </View>
          </View>
        ))}

        <Text style={s.footerNote} render={footerRender} fixed />
      </Page>
    </Document>
  )
}
