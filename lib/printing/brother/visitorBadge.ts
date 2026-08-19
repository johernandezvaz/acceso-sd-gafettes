export interface VisitorBadgeData {
  folio: string;
  nombre: string;
  empresa: string;
  visitaA: string;
  motivo: string;
  identificacion: string;
  fechaHora: string | Date;
}

export interface BrotherPrintOptions {
  dpi?: number;
  mediaWidthMm?: number;
  heightMm?: number;
  autoCut?: boolean;
}

export const BADGE_PHYSICAL_DIMENSIONS = {
  widthMm: 53.0,
  heightMm: 50.0,
  orientation: 'portrait',
} as const;

export const BROTHER_DEFAULT_DPI = 300;

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

export function calculateBrotherDimensions(
  dpi: number = BROTHER_DEFAULT_DPI,
  heightMm: number = BADGE_PHYSICAL_DIMENSIONS.heightMm
) {
  const widthDots = Math.round((BADGE_PHYSICAL_DIMENSIONS.widthMm / 25.4) * dpi);
  const heightDots = Math.round((heightMm / 25.4) * dpi);

  return {
    widthMm: BADGE_PHYSICAL_DIMENSIONS.widthMm,
    heightMm,
    dpi,
    widthDots,
    heightDots,
  };
}

export function formatBadgeDate(fechaHora: string | Date) {
  const fecha = typeof fechaHora === 'string' ? new Date(fechaHora) : fechaHora;
  if (isNaN(fecha.getTime())) {
    return {
      fecha: 'Fecha no disp.',
      hora: '--:--',
      full: 'Fecha no disponible',
    };
  }

  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');

  const fechaStr = `${day}/${month}/${year}`;
  const horaStr = `${hours}:${minutes}`;

  return {
    fecha: fechaStr,
    hora: horaStr,
    full: `${fechaStr} · ${horaStr}`,
  };
}


export function generateBrotherRasterJob(
  data: VisitorBadgeData,
  options: BrotherPrintOptions = {},
  customBitmapBuffer?: Uint8Array
): Uint8Array {
  const dims = calculateBrotherDimensions(
    options.dpi ?? BROTHER_DEFAULT_DPI,
    options.heightMm ?? BADGE_PHYSICAL_DIMENSIONS.heightMm
  );
  const mediaWidth = options.mediaWidthMm ?? 62;
  const autoCut = options.autoCut ?? true;

  if (mediaWidth > 62) {
    throw new Error(
      `mediaWidthMm=${mediaWidth} excede el máximo físico de la QL-810W (62mm).`
    );
  }

  const PIN_COUNT = 720;
  const BYTES_PER_LINE = PIN_COUNT / 8;
  const totalLines = dims.heightDots;
  const leftOffsetDots = Math.max(0, Math.floor((PIN_COUNT - dims.widthDots) / 2));


  const chunks: Uint8Array[] = [];

  chunks.push(new Uint8Array(200));
  chunks.push(new Uint8Array([0x1B, 0x40]));
  chunks.push(new Uint8Array([0x1B, 0x69, 0x61, 0x01]));

  const mediaInfo = new Uint8Array(13);
  mediaInfo[0] = 0x1B;
  mediaInfo[1] = 0x69;
  mediaInfo[2] = 0x7A;
  mediaInfo[3] = 0x8E;
  mediaInfo[4] = 0x0A;
  mediaInfo[5] = mediaWidth;
  mediaInfo[6] = 0;
  mediaInfo[7] = totalLines & 0xFF;
  mediaInfo[8] = (totalLines >> 8) & 0xFF;
  mediaInfo[9] = 0x00;
  mediaInfo[10] = 0x00;
  mediaInfo[11] = 0x00;
  mediaInfo[12] = 0x00;
  chunks.push(mediaInfo);

  const cutFlag = autoCut ? 0x40 : 0x00;
  chunks.push(new Uint8Array([0x1B, 0x69, 0x4D, cutFlag]));

  chunks.push(new Uint8Array([0x1B, 0x69, 0x4B, 0x08]));
  chunks.push(new Uint8Array([0x1B, 0x69, 0x64, 0x23, 0x00]));
  chunks.push(new Uint8Array([0x4D, 0x00]));

  const bytesPerBadgeRow = Math.ceil(dims.widthDots / 8);

  for (let line = 0; line < totalLines; line++) {
    const lineBuffer = new Uint8Array(3 + BYTES_PER_LINE);
    lineBuffer[0] = 0x67;
    lineBuffer[1] = 0x00;
    lineBuffer[2] = BYTES_PER_LINE;

    const rasterData = lineBuffer.subarray(3);

    if (customBitmapBuffer) {
      const srcOffset = line * bytesPerBadgeRow;
      for (let dx = 0; dx < dims.widthDots; dx++) {
        const srcByteIdx = srcOffset + Math.floor(dx / 8);
        const srcBitIdx = 7 - (dx % 8);
        const isPixelBlack = (customBitmapBuffer[srcByteIdx] & (1 << srcBitIdx)) !== 0;

        if (isPixelBlack) {

          const targetDot = leftOffsetDots + (dims.widthDots - 1 - dx);
          if (targetDot < PIN_COUNT) {
            const dstByteIdx = Math.floor(targetDot / 8);
            const dstBitIdx = 7 - (targetDot % 8);
            rasterData[dstByteIdx] |= (1 << dstBitIdx);
          }
        }
      }
    }

    chunks.push(lineBuffer);
  }

  chunks.push(new Uint8Array([0x1A]));

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

export function rotateBitmap90CW(
  srcBuffer: Uint8Array,
  srcWidthDots: number,
  srcHeightDots: number
): { buffer: Uint8Array; widthDots: number; heightDots: number } {
  const srcRowBytes = Math.ceil(srcWidthDots / 8);
  const dstWidthDots = srcHeightDots;
  const dstHeightDots = srcWidthDots;
  const dstRowBytes = Math.ceil(dstWidthDots / 8);
  const dstBuffer = new Uint8Array(dstRowBytes * dstHeightDots);

  const getPixel = (x: number, y: number) =>
    (srcBuffer[y * srcRowBytes + (x >> 3)] & (1 << (7 - (x % 8)))) !== 0;

  const setPixel = (x: number, y: number) => {
    dstBuffer[y * dstRowBytes + (x >> 3)] |= 1 << (7 - (x % 8));
  };

  for (let sy = 0; sy < srcHeightDots; sy++) {
    for (let sx = 0; sx < srcWidthDots; sx++) {
      if (getPixel(sx, sy)) {
        setPixel(srcHeightDots - 1 - sy, sx);
      }
    }
  }

  return { buffer: dstBuffer, widthDots: dstWidthDots, heightDots: dstHeightDots };
}

