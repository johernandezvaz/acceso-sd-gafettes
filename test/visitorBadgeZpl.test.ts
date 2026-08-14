import {
  generateVisitorBadgeZpl,
  calculateZplDimensions,
  sanitizeZplText,
  formatBadgeDate,
  type VisitorBadgeData,
} from '../lib/printing/visitorBadgeZpl';

function runTests() {
  console.log('=== INICIANDO PRUEBAS DE GENERADOR ZPL ===\n');

  console.log('[Test 1] Dimensiones físicas y dots:');
  const dims203 = calculateZplDimensions(203);
  console.log('203 DPI:', dims203);
  if (dims203.widthDots !== 675 || dims203.heightDots !== 424) {
    throw new Error(`Dimensiones 203 DPI incorrectas: ${JSON.stringify(dims203)}`);
  }

  const dims300 = calculateZplDimensions(300);
  console.log('300 DPI:', dims300);
  if (dims300.widthDots !== 998 || dims300.heightDots !== 626) {
    throw new Error(`Dimensiones 300 DPI incorrectas: ${JSON.stringify(dims300)}`);
  }
  console.log('✔ Test 1 superado.\n');
  console.log('[Test 2] Sanitización de caracteres ZPL peligrosos:');
  const rawText = 'Empresa ^Con~Signos\\Especiales\r\ny Saltos\n';
  const clean = sanitizeZplText(rawText);
  console.log('Raw:', rawText, '-> Sanitized:', clean);
  if (clean.includes('^') || clean.includes('~') || clean.includes('\\') || clean.includes('\n')) {
    throw new Error('La sanitización no removió los caracteres ZPL peligrosos');
  }
  console.log('✔ Test 2 superado.\n');

  console.log('[Test 3] Formato de fecha DD/MM/YYYY · HH:mm:');
  const dateStr = formatBadgeDate(new Date('2026-08-14T11:32:00'));
  console.log('Fecha formateada:', dateStr);
  if (dateStr !== '14/08/2026 · 11:32') {
    throw new Error(`Formato de fecha inesperado: ${dateStr}`);
  }
  console.log('✔ Test 3 superado.\n');

  console.log('[Test 4] Generación ZPL - Nombre corto:');
  const casoCorto: VisitorBadgeData = {
    folio: '000123',
    nombre: 'Juan Pérez',
    empresa: 'Empresa XYZ',
    visitaA: 'María González',
    motivo: 'servicio',
    identificacion: 'ine',
    fechaHora: '2026-08-14T11:32:00',
  };
  const zplCorto = generateVisitorBadgeZpl(casoCorto, { dpi: 203 });
  if (!zplCorto.startsWith('^XA') || !zplCorto.endsWith('^XZ')) {
    throw new Error('ZPL no contiene estructura válida ^XA ... ^XZ');
  }
  if (!zplCorto.includes('^PW675') || !zplCorto.includes('^LL424')) {
    throw new Error('ZPL no incluye ^PW675 y ^LL424 para 203 DPI');
  }
  if (!zplCorto.includes('JUAN PÉREZ') || !zplCorto.includes('FOLIO #000123')) {
    throw new Error('ZPL no contiene nombre o folio esperado');
  }
  if (!zplCorto.includes('^BQN,2,3,M,7')) {
    throw new Error('ZPL no contiene comando de QR nativo');
  }
  console.log('✔ Test 4 superado.\n');

  // 5. Caso Nombre Largo
  console.log('[Test 5] Generación ZPL - Nombre largo:');
  const casoNombreLargo: VisitorBadgeData = {
    folio: '000124',
    nombre: 'Juan Carlos Hernández Rodríguez',
    empresa: 'Empresa XYZ',
    visitaA: 'María González',
    motivo: 'servicio',
    identificacion: 'ine',
    fechaHora: '2026-08-14T11:32:00',
  };
  const zplNombreLargo = generateVisitorBadgeZpl(casoNombreLargo);
  if (!zplNombreLargo.includes('JUAN CARLOS HERNÁNDEZ RODRÍGUEZ')) {
    throw new Error('ZPL nombre largo falló');
  }
  console.log('✔ Test 5 superado.\n');

  console.log('[Test 6] Generación ZPL - Empresa larga:');
  const casoEmpresaLarga: VisitorBadgeData = {
    folio: '000125',
    nombre: 'Juan Pérez',
    empresa: 'Empresa Mexicana de Servicios Industriales S.A. de C.V.',
    visitaA: 'María González',
    motivo: 'revision_proyecto',
    identificacion: 'pasaporte',
    fechaHora: '2026-08-14T11:32:00',
  };
  const zplEmpresaLarga = generateVisitorBadgeZpl(casoEmpresaLarga);
  if (!zplEmpresaLarga.includes('Empresa Mexicana de Servicios Industriales S.A. de C.V.')) {
    throw new Error('ZPL empresa larga falló');
  }
  console.log('✔ Test 6 superado.\n');

  console.log('[Test 7] Generación ZPL - Anfitrión largo:');
  const casoHostLargo: VisitorBadgeData = {
    folio: '000126',
    nombre: 'Juan Pérez',
    empresa: 'Empresa XYZ',
    visitaA: 'Lic. María Fernanda González Hernández',
    motivo: 'visita_proveedor',
    identificacion: 'gafete_empresa',
    fechaHora: '2026-08-14T11:32:00',
  };
  const zplHostLargo = generateVisitorBadgeZpl(casoHostLargo);
  if (!zplHostLargo.includes('Lic. María Fernanda González Hernández')) {
    throw new Error('ZPL host largo falló');
  }
  console.log('✔ Test 7 superado.\n');

  console.log('[Test 8] Generación ZPL - Caso extremo combinado:');
  const casoExtremo: VisitorBadgeData = {
    folio: '000999',
    nombre: 'Ing. Francisco Javier Domínguez de los Monteros y Peña ^ ~ \\',
    empresa: 'Corporación Transnacional de Infraestructura & Tecnología Industrial S.A.P.I. de C.V.',
    visitaA: 'Dra. María Antonieta de las Nieves Fernández-García',
    motivo: 'visita_corporativo',
    identificacion: 'licencia',
    fechaHora: '2026-12-31T23:59:00',
  };
  const zplExtremo = generateVisitorBadgeZpl(casoExtremo, { dpi: 300 });
  if (!zplExtremo.includes('^PW998') || !zplExtremo.includes('^LL626')) {
    throw new Error('ZPL 300 DPI falló en dimensiones');
  }
  if (zplExtremo.includes('^ ~ \\')) {
    throw new Error('ZPL extremo no sanitizó caracteres');
  }
  console.log('✔ Test 8 superado.\n');

  console.log('====================================================');
  console.log('✔ TODAS LAS PRUEBAS UNITARIAS PASARON EXITOSAMENTE.');
  console.log('====================================================');
}

runTests();
