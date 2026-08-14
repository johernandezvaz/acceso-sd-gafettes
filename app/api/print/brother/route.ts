import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ip, port = 9100, payloadBase64 } = body;

    if (!ip || !payloadBase64) {
      return NextResponse.json(
        { success: false, error: 'Parámetros requeridos: ip, payloadBase64' },
        { status: 400 }
      );
    }

    const binaryBuffer = Buffer.from(payloadBase64, 'base64');

    const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(4000);

      socket.connect(Number(port), ip, () => {
        socket.write(binaryBuffer, () => {
          socket.end();
          resolve({ success: true });
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, error: 'Tiempo de espera agotado al conectar con Brother QL-810W' });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({ success: false, error: err.message });
      });
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Enviado exitosamente a Brother QL-810W' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
