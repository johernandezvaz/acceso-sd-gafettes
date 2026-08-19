import {
  calculateBrotherDimensions,
  formatBadgeDate,
  MOTIVOS_MAP,
  IDENTIFICACIONES_MAP,
  type VisitorBadgeData,
  type BrotherPrintOptions,
} from './visitorBadge';

export function imageDataTo1bpp(
  imageData: ImageData,
  widthDots: number,
  heightDots: number,
  threshold = 128
): { buffer: Uint8Array; blackPixelCount: number } {
  const bytesPerRow = Math.ceil(widthDots / 8);
  const buffer = new Uint8Array(bytesPerRow * heightDots);
  const data = imageData.data;
  let blackPixelCount = 0;

  for (let y = 0; y < heightDots; y++) {
    const rowOffset = y * bytesPerRow;
    for (let x = 0; x < widthDots; x++) {
      const idx = (y * widthDots + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      const isBlack = a >= 128 && (0.299 * r + 0.587 * g + 0.114 * b) < threshold;

      if (isBlack) {
        const byteIdx = rowOffset + Math.floor(x / 8);
        const bitIdx = 7 - (x % 8);
        buffer[byteIdx] |= (1 << bitIdx);
        blackPixelCount++;
      }
    }
  }

  return { buffer, blackPixelCount };
}


function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
): number {
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n];
      currentY += lineHeight;
      linesCount++;
      if (linesCount >= maxLines - 1) {

        let truncated = line;
        while (n + 1 < words.length) {
          n++;
          truncated += ' ' + words[n];
        }
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + (truncated !== line ? '...' : ''), x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

export async function renderVisitorBadgeTo1bpp(
  data: VisitorBadgeData,
  options: BrotherPrintOptions = {}
): Promise<{ buffer: Uint8Array; widthDots: number; heightDots: number; blackPixelCount: number }> {
  const dims = calculateBrotherDimensions(options.dpi, options.heightMm);
  const { widthDots, heightDots } = dims;

  if (typeof document === 'undefined') {
    throw new Error('renderVisitorBadgeTo1bpp debe ejecutarse en el navegador con soporte para Canvas.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = widthDots;
  canvas.height = heightDots;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D del Canvas');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, widthDots, heightDots);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(2, 2, widthDots - 4, heightDots - 4);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, widthDots, 10);

  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = '/safe-demo_logo-blc-Photoroom.png';
    });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.drawImage(logoImg, 20, 16, 130, 44);
    } else {
      ctx.fillStyle = '#000000';
      ctx.font = '900 24px system-ui, sans-serif';
      ctx.fillText('SAFE DEMO', 20, 48);
    }
  } catch {
    ctx.fillStyle = '#000000';
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.fillText('SAFE DEMO', 20, 48);
  }

  // Badge VISITANTE
  const badgeWidth = 145;
  const badgeHeight = 36;
  const badgeX = widthDots - badgeWidth - 20;
  const badgeY = 20;
  ctx.fillStyle = '#000000';
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VISITANTE', badgeX + badgeWidth / 2, badgeY + 24);
  ctx.textAlign = 'left';

  // Separador header
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 68, widthDots, 3);

  // 5. Sección Principal: QR (izquierda) + Nombre / Empresa / Folio (derecha)
  const qrBoxSize = 190;
  const qrX = 20;
  const qrY = 82;

  // Borde caja QR
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(qrX, qrY, qrBoxSize, qrBoxSize);

  // Extraer el QR renderizado en el DOM o rasterizarlo
  try {
    const qrSvg = document.querySelector('#gafete-print svg');
    if (qrSvg) {
      const xml = new XMLSerializer().serializeToString(qrSvg);
      const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve();
        qrImg.src = svgUrl;
      });
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, qrX + 4, qrY + 4, qrBoxSize - 8, qrBoxSize - 8);
      }
    }
  } catch (err) {
    console.warn('[BadgeRasterizer] No se pudo extraer QR del DOM:', err);
  }

  // Datos principales (derecha)
  const rightX = qrX + qrBoxSize + 18;
  const rightWidth = widthDots - rightX - 20;

  // Nombre
  ctx.fillStyle = '#000000';
  ctx.font = '900 26px system-ui, sans-serif';
  const nameEndY = wrapText(ctx, (data.nombre || 'VISITANTE').toUpperCase(), rightX, qrY + 26, rightWidth, 30, 2);

  // Empresa
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillStyle = '#000000';
  wrapText(ctx, data.empresa || '', rightX, Math.max(nameEndY + 4, qrY + 84), rightWidth, 24, 1);

  // Línea sobre FOLIO
  const folioLineY = qrY + 118;
  ctx.fillStyle = '#000000';
  ctx.fillRect(rightX, folioLineY, rightWidth, 2);

  // Folio
  ctx.font = '900 14px system-ui, sans-serif';
  ctx.fillText('FOLIO', rightX, folioLineY + 20);
  ctx.font = '900 26px system-ui, sans-serif';
  ctx.fillText(`#${data.folio || '000000'}`, rightX, folioLineY + 50);

  // Separador sección central
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 285, widthDots, 3);

  // 6. Sección VISITA A (Banner fondo negro con texto blanco)
  const visitaY = 288;
  const visitaHeight = 88;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, visitaY, widthDots, visitaHeight);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 14px system-ui, sans-serif';
  ctx.fillText('VISITA A', 20, visitaY + 24);

  ctx.font = 'bold 22px system-ui, sans-serif';
  wrapText(ctx, data.visitaA || '—', 20, visitaY + 54, widthDots - 40, 26, 1);

  // Separador
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, visitaY + visitaHeight, widthDots, 3);

  // 7. Sección MOTIVO e IDENTIFICACIÓN (2 columnas)
  const infoY = visitaY + visitaHeight + 3;
  const colWidth = (widthDots - 40) / 2;

  const motivoLabel = MOTIVOS_MAP[data.motivo] ?? data.motivo ?? '—';
  const idLabel = IDENTIFICACIONES_MAP[data.identificacion] ?? data.identificacion ?? '—';

  // Columna 1: MOTIVO
  ctx.fillStyle = '#000000';
  ctx.font = '900 14px system-ui, sans-serif';
  ctx.fillText('MOTIVO', 20, infoY + 24);
  ctx.font = 'bold 19px system-ui, sans-serif';
  wrapText(ctx, motivoLabel, 20, infoY + 50, colWidth - 10, 22, 1);

  // Divisor de columna
  ctx.fillRect(20 + colWidth + 5, infoY, 2, 85);

  // Columna 2: IDENTIFICACIÓN
  const col2X = 20 + colWidth + 15;
  ctx.fillStyle = '#000000';
  ctx.font = '900 14px system-ui, sans-serif';
  ctx.fillText('IDENTIFICACIÓN', col2X, infoY + 24);
  ctx.font = 'bold 19px system-ui, sans-serif';
  wrapText(ctx, idLabel, col2X, infoY + 50, colWidth - 10, 22, 1);

  // Separador
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, infoY + 85, widthDots, 3);

  // 8. Footer: Fecha (izq) y Hora (der)
  const dateInfo = formatBadgeDate(data.fechaHora);
  const footerY = infoY + 88;

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(dateInfo.fecha, 20, footerY + 36);

  ctx.font = '900 22px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(dateInfo.hora, widthDots - 20, footerY + 36);
  ctx.textAlign = 'left';

  // Barra negra inferior
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, heightDots - 10, widthDots, 10);

  // 9. Extraer ImageData y convertir a 1bpp
  const imageData = ctx.getImageData(0, 0, widthDots, heightDots);
  const { buffer, blackPixelCount } = imageDataTo1bpp(imageData, widthDots, heightDots);

  console.log(
    `[BadgeRasterizer] Gafete rasterizado: ${widthDots}x${heightDots} px, ${buffer.length} bytes, ${blackPixelCount} píxeles negros activos.`
  );

  return { buffer, widthDots, heightDots, blackPixelCount };
}
