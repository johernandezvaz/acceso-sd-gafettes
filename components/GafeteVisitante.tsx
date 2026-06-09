import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export interface GafeteVisitanteProps {
  folio: string;
  nombre: string;
  empresa: string;
  visitaA: string;
  motivo: string;
  identificacion: string;
  fechaHora: string;
}

const MOTIVOS: Record<string, string> = {
  practicas: 'Prácticas',
  prueba_sistema: 'Prueba de sistema',
  revision_proyecto: 'Revisión de proyecto',
  servicio: 'Servicio',
  visita_cliente: 'Visita cliente',
  visita_corporativo: 'Visita corporativo',
  visita_proveedor: 'Visita de proveedor',
};

const IDS: Record<string, string> = {
  ine: 'INE',
  pasaporte: 'Pasaporte',
  licencia: 'Licencia de conducir',
  gafete_empresa: 'Gafete de empresa',
};

export default function GafeteVisitante({
  folio,
  nombre,
  empresa,
  visitaA,
  motivo,
  identificacion,
  fechaHora,
}: GafeteVisitanteProps) {
  const fecha = new Date(fechaHora);
  const fechaFormateada =
    fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' · ' +
    fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  const motivoLabel = MOTIVOS[motivo] ?? motivo;
  const idLabel = IDS[identificacion] ?? identificacion;

  const qrData = JSON.stringify({ folio, nombre, empresa, fecha: fechaHora });

  return (
    <div id="gafete-print">

      <div
        className="badge-inner"
        style={{
          width: '212px',
          background: '#fff',
          border: '1.5px solid #d1d5db',
          borderRadius: '8px',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
          color: '#000',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{
          borderTop: '6px solid #000',
          padding: '10px 14px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Image
            src="/safe-demo_logo-blc-Photoroom.png"
            alt="Logo"
            width={48}
            height={24}
            style={{ objectFit: 'contain' }}
          />
          <span style={{
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            border: '1.5px solid #000',
            padding: '3px 8px',
            borderRadius: '3px',
          }}>
            Visitante
          </span>
        </div>

        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.2', textTransform: 'uppercase' }}>
            {nombre}
          </span>
          <span style={{ fontSize: '10px', color: '#4b5563' }}>{empresa}</span>
          <span style={{ fontSize: '10px', fontWeight: '700', marginTop: '3px', letterSpacing: '0.05em' }}>
            FOLIO #{folio}
          </span>
        </div>

        <div style={{ padding: '8px 14px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            { label: 'Visita a', value: visitaA || '—' },
            { label: 'Motivo', value: motivoLabel },
            { label: 'Identificación', value: idLabel },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
              <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                {label}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '600', textAlign: 'right', wordBreak: 'break-word' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 14px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontSize: '9px', color: '#4b5563' }}>{fechaFormateada}</span>
          <QRCodeSVG
            value={qrData}
            size={40}
            level="M"
            style={{ display: 'block', flexShrink: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
