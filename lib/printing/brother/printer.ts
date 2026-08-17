import { generateBrotherRasterJob, type VisitorBadgeData, type BrotherPrintOptions } from './visitorBadge';

export interface BrotherPrintResult {
  success: boolean;
  method: 'browser-dialog' | 'network-tcp' | 'download-prn';
  message: string;
  error?: string;
}

export function downloadBrotherPrnFile(
  data: VisitorBadgeData,
  filename?: string,
  options?: BrotherPrintOptions
): void {
  const binaryJob = generateBrotherRasterJob(data, options);
  const name = filename || `gafete-brother-${data.folio || 'visitante'}.prn`;

  const blob = new Blob([binaryJob as Uint8Array<ArrayBuffer>], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printViaBrowserDialog(): Promise<BrotherPrintResult> {
  return new Promise((resolve) => {
    try {
      window.print();
      resolve({
        success: true,
        method: 'browser-dialog',
        message: 'Diálogo de impresión enviado a la impresora Brother QL-810W',
      });
    } catch (err) {
      resolve({
        success: false,
        method: 'browser-dialog',
        message: 'Error al abrir el diálogo de impresión',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
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
    const base64Data = uint8ArrayToBase64(binaryJob);

    const response = await fetch('/api/print/brother', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: printerIp,
        port: printerPort,
        payloadBase64: base64Data,
      }),
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.success) {
      throw new Error(resJson.error || 'Fallo en la comunicación con la Brother QL-810W');
    }

    return {
      success: true,
      method: 'network-tcp',
      message: `Gafete enviado exitosamente a la Brother QL-810W (${printerIp}:${printerPort})`,
    };
  } catch (error) {
    return {
      success: false,
      method: 'network-tcp',
      message: 'No se pudo conectar directamente con la Brother QL-810W vía Wi-Fi',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
