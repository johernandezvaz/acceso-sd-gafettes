'use client';

import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import {
  MOTIVOS_MAP,
  IDENTIFICACIONES_MAP,
  formatBadgeDate,
  type VisitorBadgeData,
} from '@/lib/printing/brother/visitorBadge';

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
  const dateInfo = formatBadgeDate(fechaHora);
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

      <div
        className="badge-inner"
        style={{
          width: '256px',
          height: '408px',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #000000',
          borderRadius: '4px',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >

        <div style={{ height: '4px', backgroundColor: '#000000', width: '100%', flexShrink: 0 }} />

        <div
          style={{
            padding: '6px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <div style={{ position: 'relative', width: '56px', height: '26px' }}>
            <Image
              src="/safe-demo_logo-blc-Photoroom.png"
              alt="Safe Demo Logo"
              fill
              sizes="56px"
              style={{ objectFit: 'contain', filter: 'grayscale(100%) contrast(200%)' }}
              priority
            />
          </div>

          <div
            style={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontSize: '9.5px',
              fontWeight: '900',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 7px',
              borderRadius: '2px',
              lineHeight: 1,
            }}
          >
            VISITANTE
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', width: '100%', flexShrink: 0 }} />

        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: '900',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              color: '#000000',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {nombre}
          </span>
          <span
            style={{
              fontSize: '10px',
              color: '#000000',
              fontWeight: '600',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {empresa}
          </span>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: '900',
              letterSpacing: '0.05em',
              color: '#000000',
              marginTop: '2px',
            }}
          >
            FOLIO #{folio}
          </span>
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', width: '100%', flexShrink: 0 }} />

        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {[
            { label: 'VISITA A', value: visitaA || '—' },
            { label: 'MOTIVO', value: motivoLabel },
            { label: 'IDENTIFICACIÓN', value: idLabel },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span
                style={{
                  color: '#000000',
                  fontSize: '8px',
                  fontWeight: '900',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#000000',
                  wordBreak: 'break-word',
                  lineHeight: '1.2',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', width: '100%', flexShrink: 0 }} />

        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '9.5px',
                color: '#000000',
                fontWeight: '800',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
              }}
            >
              {dateInfo.fecha}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#000000',
                fontWeight: '900',
                letterSpacing: '0.03em',
                lineHeight: 1.2,
              }}
            >
              {dateInfo.hora}
            </span>
          </div>

          <div
            style={{
              padding: '2px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #000000',
              borderRadius: '2px',
              flexShrink: 0,
            }}
          >
            <QRCodeSVG
              value={qrData}
              size={48}
              level="M"
              fgColor="#000000"
              bgColor="#FFFFFF"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
