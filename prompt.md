1. visitorBadge.ts — cut size configurable + tipo de medio correcto
typescript
export interface BrotherPrintOptions {
  dpi?: number;
  mediaWidthMm?: number;
  heightMm?: number; // NUEVO: antes el largo estaba hardcodeado en la constante,
                      // sin esto nunca vas a poder "definir el tamaño del corte" por job
  autoCut?: boolean;
}

export function calculateBrotherDimensions(
  dpi = BROTHER_DEFAULT_DPI,
  heightMm = BADGE_PHYSICAL_DIMENSIONS.heightMm // ahora parametrizable
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

En generateBrotherRasterJob:

typescript
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

  // Validación dura: el cabezal de la QL-810W tiene 720 pines ≈ 62mm.
  // Sin esto, si alguien pasa un mediaWidthMm mal, fallas en silencio en la impresora,
  // no en tu código — mucho más caro de debuggear.
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
  mediaInfo[3] = 0x86;
  mediaInfo[4] = 0x0B; // CAMBIO: 0x0A = etiqueta troquelada (tamaño fijo de fábrica).
                       // 0x0B = cinta continua. Tu badge es un tamaño custom, no un
                       // troquel comprado — con 0x0A la impresora puede rechazar el job
                       // o ignorar tu longitud.
  mediaInfo[5] = mediaWidth;
  mediaInfo[6] = 0; // en medio continuo esto se queda en 0 siempre: el corte lo define
                    // el número de líneas raster que mandas (totalLines), no este campo.
  mediaInfo[7] = totalLines & 0xFF;
  mediaInfo[8] = (totalLines >> 8) & 0xFF;
  mediaInfo[9] = 0x00;
  mediaInfo[10] = 0x00;
  mediaInfo[11] = 0x00;
  mediaInfo[12] = 0x00;
  chunks.push(mediaInfo);

  // ... resto igual (ESC i M, ESC i K, ESC i d, líneas raster, 0x1A)

Con esto, "definir el tamaño del corte" ya es real: generateBrotherRasterJob(data, { heightMm: 90 }) te da un badge de otro largo, sin tocar la constante global. Ojo: el flag 0x0B lo baso en la referencia estándar del protocolo raster de Brother; si al probar con la impresora física el job no corta o se traba, es el primer byte que yo revisaría — no tengo forma de verificarlo sin el dispositivo en mano.

2. Rotación de contenido — no toques generateBrotherRasterJob, rota el bitmap antes

Como confirmaste que el medio sigue alimentándose en portrait, la rotación es un problema de quién genera el customBitmapBuffer (tu renderer de canvas, que no me compartiste), no de esta función. Le agrego un helper puro en el mismo archivo:

typescript
/**
 * Rota 90° en sentido horario un bitmap empaquetado 1bpp (MSB primero).
 * Úsalo así: renderiza tu diseño en un canvas "landscape" de
 * heightDots × widthDots (84.5mm × 53mm), empácalo a 1bpp, y pasa
 * ese buffer aquí para obtener un buffer válido para generateBrotherRasterJob
 * (widthDots × heightDots, portrait), sin cambiar cómo se alimenta el medio.
 */
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

Importante: no sé si tu renderer produce el bitmap en el orden de bits que asumí (MSB-first, fila por fila) — eso depende de cómo empaques el canvas a 1bpp. Si tienes ese archivo, compártelo y te confirmo si rotateBitmap90CW calza directo o necesita ajuste de orientación (CW vs CCW se ve fácil de invertir, solo cambia el mapeo de índices, pero necesitas probarlo una vez contra la impresora real para confirmar que el texto no sale espejeado o al revés — no lo voy a adivinar bien sin verlo).

3. print.ts — bug real de encoding + quitar el diálogo del flujo
typescript
function uint8ArrayToBase64(bytes: Uint8Array): string {
  // FIX: spread de un array grande (~90k+ bytes a 300dpi) en
  // String.fromCharCode(...bytes) revienta el call stack en la mayoría
  // de motores JS. Esto es un bug latente que probablemente no has visto
  // porque a DPI bajo el array es chico.
  const CHUNK_SIZE = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}

export async function sendToBrotherNetworkPrinter(
  data: VisitorBadgeData,
  printerIp: string,
  printerPort = 9100,
  options?: BrotherPrintOptions
): Promise<BrotherPrintResult> {
  try {
    const binaryJob = generateBrotherRasterJob(data, options);
    const base64Data = uint8ArrayToBase64(binaryJob); // antes: btoa(String.fromCharCode(...binaryJob))
    // ... resto igual

Y en tu handler de "guardar visitante" (el componente que no me compartiste), el cambio es simplemente no llamar printViaBrowserDialog:

typescript
async function handleGuardarVisitante(formData: VisitorBadgeData) {
  await saveVisitorToDb(formData); // lo que ya tengas
  const result = await sendToBrotherNetworkPrinter(formData, PRINTER_IP, 9100);
  if (!result.success) {
    // maneja el error explícitamente — sin diálogo de por medio, si la
    // impresora está apagada o la IP cambió, el usuario no se entera
    // a menos que tú se lo muestres en la UI
  }
}

Esto último es un punto que vale la pena que pienses: al quitar el diálogo del navegador pierdes la retroalimentación nativa de "impresora sin papel/offline" que Chrome te daba gratis. Necesitas manejar esos estados de error tú mismo en la UI del kiosco (¿reintento automático? ¿alerta visual para el guardia de seguridad?), porque ahora el fallo es silencioso desde la perspectiva del usuario si no lo expones.