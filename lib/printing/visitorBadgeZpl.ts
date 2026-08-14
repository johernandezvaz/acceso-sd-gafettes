import logoData from './logoData.json';

export interface VisitorBadgeData {
  folio: string;
  nombre: string;
  empresa: string;
  visitaA: string;
  motivo: string;
  identificacion: string;
  fechaHora: string | Date;
}

export interface ZplOptions {
  dpi?: number;
  darkness?: number;
  printSpeed?: number;
}

export const BADGE_PHYSICAL_DIMENSIONS = {
  widthMm: 84.5,
  heightMm: 53.0,
} as const;

export const MOTIVOS_MAP: Record<string, string> = {
  practicas: 'Prácticas',
  prueba_sistema: 'Prueba de sistema',
  revision_proyecto: 'Revisión de proyecto',
  servicio: 'Servicio',
  visita_cliente: 'Visita cliente',
  visita_corporativo: 'Visita corporativo',
  visita_proveedor: 'Visita de proveedor',
};

export const IDENTIFICACIONES_MAP: Record<string, string> = {
  ine: 'INE',
  pasaporte: 'Pasaporte',
  licencia: 'Licencia de conducir',
  gafete_empresa: 'Gafete de empresa',
};

export function calculateZplDimensions(dpi = 203) {
  const widthDots = Math.round((BADGE_PHYSICAL_DIMENSIONS.widthMm / 25.4) * dpi);
  const heightDots = Math.round((BADGE_PHYSICAL_DIMENSIONS.heightMm / 25.4) * dpi);
  const dpmm = Math.round(dpi / 25.4);

  return {
    widthMm: BADGE_PHYSICAL_DIMENSIONS.widthMm,
    heightMm: BADGE_PHYSICAL_DIMENSIONS.heightMm,
    dpi,
    dpmm,
    widthDots,
    heightDots,
  };
}


export function sanitizeZplText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/[\^~\\]/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

export function formatBadgeDate(fechaHora: string | Date): string {
  const fecha = typeof fechaHora === 'string' ? new Date(fechaHora) : fechaHora;
  if (isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} · ${hours}:${minutes}`;
}

export function generateVisitorBadgeZpl(
  data: VisitorBadgeData,
  options: ZplOptions = {}
): string {
  const dpi = options.dpi ?? 203;
  const dims = calculateZplDimensions(dpi);

  const nombreSanitizado = sanitizeZplText(data.nombre).toUpperCase();
  const empresaSanitizada = sanitizeZplText(data.empresa);
  const folioSanitizado = sanitizeZplText(data.folio);
  const visitaASanitizado = sanitizeZplText(data.visitaA || '—');
  const motivoLabel = MOTIVOS_MAP[data.motivo] ?? sanitizeZplText(data.motivo);
  const idLabel = IDENTIFICACIONES_MAP[data.identificacion] ?? sanitizeZplText(data.identificacion);
  const fechaTexto = formatBadgeDate(data.fechaHora);

  const fechaIso = typeof data.fechaHora === 'string' ? data.fechaHora : data.fechaHora.toISOString();
  const qrPayload = JSON.stringify({
    folio: folioSanitizado,
    nombre: nombreSanitizado,
    empresa: empresaSanitizada,
    fecha: fechaIso,
  });

  const s = dpi / 203;
  const scale = (val: number) => Math.round(val * s);

  const logo = dpi >= 300 ? logoData.logo300 : logoData.logo203;

  const commands: string[] = [
    '^XA',
    `^PW${dims.widthDots}`,
    `^LL${dims.heightDots}`,
    '^LS0',
    '^CI28',
  ];

  if (options.darkness !== undefined) {
    commands.push(`~SD${Math.min(30, Math.max(0, options.darkness))}`);
  }
  if (options.printSpeed !== undefined) {
    commands.push(`^PR${Math.min(6, Math.max(2, options.printSpeed))}`);
  }

  const frameX = scale(16);
  const frameY = scale(14);
  const frameW = scale(643);
  const frameH = scale(396);
  commands.push(`^FO${frameX},${frameY}^GB${frameW},${frameH},${scale(2)},B,2^FS`);
  commands.push(`^FO${frameX},${frameY}^GB${frameW},${scale(8)},${scale(8)}^FS`);

  const logoX = scale(32);
  const logoY = scale(32);
  commands.push(`^FO${logoX},${logoY}^GFA,${logo.totalBytes},${logo.totalBytes},${logo.bytesPerRow},${logo.hex}^FS`);

  const badgeX = scale(470);
  const badgeY = scale(40);
  const badgeW = scale(170);
  const badgeH = scale(44);
  commands.push(`^FO${badgeX},${badgeY}^GB${badgeW},${badgeH},${scale(2)},B,1^FS`);
  commands.push(`^FO${badgeX},${scale(52)}^FB${badgeW},1,0,C^A0N,${scale(22)},${scale(22)}^FDVISITANTE^FS`);

  commands.push(`^FO${frameX},${scale(106)}^GB${frameW},${scale(1)},${scale(1)}^FS`);

  const textLeft = scale(32);
  const mainContentW = scale(610);
  commands.push(`^FO${textLeft},${scale(118)}^FB${mainContentW},1,0,L^A0N,${scale(28)},${scale(28)}^FD${nombreSanitizado}^FS`);
  commands.push(`^FO${textLeft},${scale(150)}^FB${mainContentW},1,0,L^A0N,${scale(19)},${scale(19)}^FD${empresaSanitizada}^FS`);
  commands.push(`^FO${textLeft},${scale(174)}^FB${mainContentW},1,0,L^A0N,${scale(20)},${scale(20)}^FDFOLIO #${folioSanitizado}^FS`);

  commands.push(`^FO${frameX},${scale(202)}^GB${frameW},${scale(1)},${scale(1)}^FS`);

  const valueColX = scale(180);
  const valueColW = scale(460);
  commands.push(`^FO${textLeft},${scale(212)}^A0N,${scale(16)},${scale(16)}^FDVISITA A:^FS`);
  commands.push(`^FO${valueColX},${scale(212)}^FB${valueColW},1,0,L^A0N,${scale(17)},${scale(17)}^FD${visitaASanitizado}^FS`);

  commands.push(`^FO${textLeft},${scale(238)}^A0N,${scale(16)},${scale(16)}^FDMOTIVO:^FS`);
  commands.push(`^FO${valueColX},${scale(238)}^FB${valueColW},1,0,L^A0N,${scale(17)},${scale(17)}^FD${motivoLabel}^FS`);

  commands.push(`^FO${textLeft},${scale(264)}^A0N,${scale(16)},${scale(16)}^FDIDENTIFICACIÓN:^FS`);
  commands.push(`^FO${valueColX},${scale(264)}^FB${valueColW},1,0,L^A0N,${scale(17)},${scale(17)}^FD${idLabel}^FS`);

  commands.push(`^FO${frameX},${scale(290)}^GB${frameW},${scale(1)},${scale(1)}^FS`);

  commands.push(`^FO${textLeft},${scale(340)}^A0N,${scale(20)},${scale(20)}^FD${fechaTexto}^FS`);

  const qrMag = dpi >= 300 ? 4 : 3;
  const qrX = scale(530);
  const qrY = scale(298);
  commands.push(`^FO${qrX},${qrY}^BQN,2,${qrMag},M,7^FDMA,${qrPayload}^FS`);

  commands.push('^XZ');

  return commands.join('\n');
}
