import {
  generateBrotherRasterJob,
  calculateBrotherDimensions,
  formatBadgeDate,
  BADGE_PHYSICAL_DIMENSIONS,
  type VisitorBadgeData,
} from '../lib/printing/brother/visitorBadge';

function runBrotherTests() {
  console.log('=== INICIANDO PRUEBAS DE GAFETE BROTHER QL-810W ===\n');

  console.log('[Test 1] Dimensiones físicas y resolución:');
  console.log('Dimensiones físicas:', BADGE_PHYSICAL_DIMENSIONS);
  if (BADGE_PHYSICAL_DIMENSIONS.widthMm !== 53.0 || BADGE_PHYSICAL_DIMENSIONS.heightMm !== 50.0) {
    throw new Error('Dimensiones físicas incorrectas. Deben ser 53mm ancho x 50mm alto.');
  }
  if (BADGE_PHYSICAL_DIMENSIONS.orientation !== 'portrait') {
    throw new Error('La orientación debe ser portrait (vertical).');
  }

  const dims = calculateBrotherDimensions(300);
  console.log('Dimensiones a 300 DPI:', dims);
  if (dims.widthDots !== 626 || dims.heightDots !== 591) {
    throw new Error(`Dots calculados incorrectos: width=${dims.widthDots}, height=${dims.heightDots}`);
  }
  console.log('✔ Test 1 superado.\n');

  console.log('[Test 2] Formato de fecha y hora:');
  const d = formatBadgeDate('2026-08-14T11:32:00');
  console.log('Fecha formateada:', d);
  if (d.fecha !== '14/08/2026' || d.hora !== '11:32' || d.full !== '14/08/2026 · 11:32') {
    throw new Error(`Formato de fecha inválido: ${JSON.stringify(d)}`);
  }
  console.log('✔ Test 2 superado.\n');

  console.log('[Test 3] Generación de flujo binario Brother QL Raster:');
  const caso: VisitorBadgeData = {
    folio: '000123',
    nombre: 'Juan Pérez',
    empresa: 'Empresa XYZ',
    visitaA: 'María González',
    motivo: 'servicio',
    identificacion: 'ine',
    fechaHora: '2026-08-14T11:32:00',
  };

  const job = generateBrotherRasterJob(caso, { dpi: 300, mediaWidthMm: 62, autoCut: true });
  console.log('Tamaño total del trabajo binario:', job.length, 'bytes');

  for (let i = 0; i < 200; i++) {
    if (job[i] !== 0x00) {
      throw new Error(`Byte ${i} no es nulo en el header de invalidación`);
    }
  }

  if (job[200] !== 0x1B || job[201] !== 0x40) {
    throw new Error('Comando ESC @ no encontrado');
  }

  if (job[202] !== 0x1B || job[203] !== 0x69 || job[204] !== 0x61 || job[205] !== 0x01) {
    throw new Error('Comando ESC i a 1 (switch to raster mode) no encontrado');
  }
  if (job[job.length - 1] !== 0x1A) {
    throw new Error('Comando 0x1A (Print / Form feed) al final del stream no encontrado');
  }

  console.log('✔ Test 3 superado.\n');

  console.log('[Test 4] Casos con textos largos y caracteres especiales:');
  const casoLargo: VisitorBadgeData = {
    folio: '000999',
    nombre: 'Juan Carlos Hernández Rodríguez de San Martín',
    empresa: 'Empresa Mexicana de Servicios Industriales y Tecnología S.A. de C.V.',
    visitaA: 'Lic. María Fernanda González Hernández',
    motivo: 'revision_proyecto',
    identificacion: 'gafete_empresa',
    fechaHora: '2026-12-31T23:59:00',
  };

  const jobLargo = generateBrotherRasterJob(casoLargo, { dpi: 300 });
  if (jobLargo.length !== job.length) {
    throw new Error('El tamaño del stream raster debe ser consistente con las 998 líneas.');
  }
  console.log('✔ Test 4 superado.\n');

  console.log('====================================================');
  console.log('✔ TODAS LAS PRUEBAS DE BROTHER QL-810W PASARON.');
  console.log('====================================================');
}

runBrotherTests();
