const UNIDADES = [
  '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
  'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS',
  'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
]

const DECENAS = [
  '', '', 'VEINTI', 'TREINTA', 'CUARENTA', 'CINCUENTA',
  'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
]

const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
]

function convertirCentenas(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'CIEN'

  const c = Math.floor(n / 100)
  const resto = n % 100

  const parteCentena = CENTENAS[c] ?? ''

  if (resto === 0) return parteCentena

  const parteResto = convertirDecenas(resto)
  return c > 0 ? `${parteCentena} ${parteResto}`.trim() : parteResto
}

function convertirDecenas(n: number): string {
  if (n < 30) {
    return UNIDADES[n] ?? ''
  }
  const decena = Math.floor(n / 10)
  const unidad = n % 10
  if (unidad === 0) return DECENAS[decena] ?? ''
  return `${DECENAS[decena]} Y ${UNIDADES[unidad]}`
}

function convertirMiles(n: number): string {
  if (n === 0) return ''

  const miles = Math.floor(n / 1000)
  const resto = n % 1000

  let parteMiles = ''
  if (miles === 1) {
    parteMiles = 'MIL'
  } else if (miles > 1) {
    parteMiles = `${convertirCentenas(miles)} MIL`
  }

  const parteResto = convertirCentenas(resto)

  return [parteMiles, parteResto].filter(Boolean).join(' ')
}

function convertirMillones(n: number): string {
  const millones = Math.floor(n / 1_000_000)
  const resto = n % 1_000_000

  let parteMillones = ''
  if (millones === 1) {
    parteMillones = 'UN MILLÓN'
  } else if (millones > 1) {
    parteMillones = `${convertirCentenas(millones)} MILLONES`
  }

  const parteResto = convertirMiles(resto)

  return [parteMillones, parteResto].filter(Boolean).join(' ')
}

export function importeEnLetras(amount: number): string {
  if (!isFinite(amount) || amount < 0) {
    return 'SON CERO PESOS 00/100 M.N.'
  }

  const rounded = Math.round(amount * 100) / 100
  const entero = Math.floor(rounded)
  const centavos = Math.round((rounded - entero) * 100)

  const centString = String(centavos).padStart(2, '0')

  if (entero === 0) {
    return `SON CERO PESOS ${centString}/100 M.N.`
  }

  const letras = convertirMillones(entero).trim()

  return `SON ${letras} PESOS ${centString}/100 M.N.`
}
