export interface ZebraPrintResult {
  success: boolean;
  method: 'browser-print' | 'download' | 'clipboard' | 'manual';
  message: string;
  error?: string;
}


export function downloadZplFile(zpl: string, filename = 'gafete-visitante.zpl'): void {
  const blob = new Blob([zpl], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyZplToClipboard(zpl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(zpl);
    return true;
  } catch (err) {
    console.error('Error al copiar ZPL al portapapeles:', err);
    return false;
  }
}

export async function sendToZebraBrowserPrint(zpl: string): Promise<ZebraPrintResult> {
  try {
    const defaultPrinterRes = await fetch('http://127.0.0.1:9100/default?type=printer', {
      method: 'GET',
    });

    if (!defaultPrinterRes.ok) {
      throw new Error('No se detectó impresora Zebra predeterminada en Zebra Browser Print');
    }

    const printerData = await defaultPrinterRes.json();
    if (!printerData || !printerData.uid) {
      throw new Error('Respuesta inválida de Zebra Browser Print');
    }

    const writeRes = await fetch('http://127.0.0.1:9100/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        device: {
          uid: printerData.uid,
        },
        data: zpl,
      }),
    });

    if (!writeRes.ok) {
      throw new Error(`Error enviando datos a la impresora: HTTP ${writeRes.status}`);
    }

    return {
      success: true,
      method: 'browser-print',
      message: `Enviado exitosamente a la impresora Zebra (${printerData.name ?? 'Default'})`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      method: 'browser-print',
      message: 'Zebra Browser Print no disponible o error de comunicación',
      error: msg,
    };
  }
}
