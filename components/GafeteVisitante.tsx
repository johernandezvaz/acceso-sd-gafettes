'use client';

import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import {
  MOTIVOS_MAP,
  IDENTIFICACIONES_MAP,
  formatBadgeDate,
  type VisitorBadgeData,
} from '@/lib/printing/visitorBadgeZpl';

export interface GafeteVisitanteProps extends VisitorBadgeData {
  className?: string;
}

export default function GafeteVisitante({
  folio,
  nombre,
  empresa,
  visitaA,
  motivo,
  identificacion,
  fechaHora,
  className = '',
}: GafeteVisitanteProps) {
  const fechaTexto = formatBadgeDate(fechaHora);
  const motivoLabel = MOTIVOS_MAP[motivo] ?? motivo;
  const idLabel = IDENTIFICACIONES_MAP[identificacion] ?? identificacion;

  const fechaIso = typeof fechaHora === 'string' ? fechaHora : fechaHora.toISOString();
  const qrData = JSON.stringify({
    folio,
    nombre: nombre.trim().toUpperCase(),
    empresa: empresa.trim(),
    fecha: fechaIso,
  });

  return (
    <div id="gafete-print" className={className}>
      {/* 
        Contenedor del gafete ajustado a la proporción física 84.5 mm x 53 mm (ratio ~1.594)
        Ancho preview: 380px, Alto: 238px (~1.594)
      */}
      <div
        className="badge-inner"
        style={{
          width: '380px',
          height: '238px',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        {/* Barra superior oscura idéntica a ZPL */}
        <div style={{ height: '5px', background: '#000000', width: '100%' }} />

        {/* HEADER: Logo y Etiqueta 'VISITANTE' */}
        <div
          style={{
            padding: '8px 16px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', width: '70px', height: '32px' }}>
            <Image
              src="/safe-demo_logo-blc-Photoroom.png"
              alt="Safe Demo Logo"
              fill
              sizes="70px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: '1.5px solid #000000',
              padding: '3px 10px',
              borderRadius: '4px',
              lineHeight: 1,
            }}
          >
            Visitante
          </span>
        </div>

        <div
          style={{
            padding: '6px 16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: '800',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              color: '#000000',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {nombre}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#475569',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {empresa}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.05em',
              color: '#0f172a',
              marginTop: '1px',
            }}
          >
            FOLIO #{folio}
          </span>
        </div>

        <div
          style={{
            padding: '5px 16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {[
            { label: 'Visita a:', value: visitaA || '—' },
            { label: 'Motivo:', value: motivoLabel },
            { label: 'Identificación:', value: idLabel },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  color: '#64748b',
                  fontSize: '9.5px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                  width: '90px',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'left',
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '6px 16px 8px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa',
          }}
        >
          <span
            style={{
              fontSize: '10.5px',
              color: '#475569',
              fontWeight: '600',
              letterSpacing: '0.02em',
            }}
          >
            {fechaTexto}
          </span>
          <QRCodeSVG
            value={qrData}
            size={44}
            level="M"
            style={{ display: 'block', flexShrink: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
