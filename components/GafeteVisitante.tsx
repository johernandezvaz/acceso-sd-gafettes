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

  const W = 256;
  const H = 242;

  return (
    <div id="gafete-print" className={className}>
      <div
        className="badge-inner"
        style={{
          width: `${W}px`,
          height: `${H}px`,
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #000000',
          borderRadius: '4px',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#000000',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >

        <div style={{ height: '4px', backgroundColor: '#000000', flexShrink: 0 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 10px 5px',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <div style={{ position: 'relative', width: '60px', height: '24px' }}>
            <Image
              src="/safe-demo_logo-blc-Photoroom.png"
              alt="Safe Demo Logo"
              fill
              sizes="60px"
              style={{ objectFit: 'contain', filter: 'grayscale(100%) contrast(200%)' }}
              priority
            />
          </div>

          <div
            style={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontSize: '8px',
              fontWeight: '900',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '3px 7px',
              borderRadius: '2px',
              lineHeight: 1,
            }}
          >
            VISITANTE
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', flexShrink: 0 }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            padding: '8px 10px',
            backgroundColor: '#FFFFFF',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              border: '1px solid #000000',
              borderRadius: '2px',
              padding: '2px',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <QRCodeSVG
              value={qrData}
              size={72}
              level="M"
              fgColor="#000000"
              bgColor="#FFFFFF"
              style={{ display: 'block' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              flex: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: '900',
                lineHeight: '1.15',
                textTransform: 'uppercase',
                color: '#000000',
                wordBreak: 'break-word',
              }}
            >
              {nombre}
            </span>

            <span
              style={{
                fontSize: '9.5px',
                fontWeight: '600',
                color: '#000000',
                wordBreak: 'break-word',
                lineHeight: '1.2',
              }}
            >
              {empresa}
            </span>

            <div
              style={{
                marginTop: '5px',
                paddingTop: '4px',
                borderTop: '1px solid #000000',
              }}
            >
              <span
                style={{
                  fontSize: '7px',
                  fontWeight: '900',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#000000',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                FOLIO
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '900',
                  letterSpacing: '0.08em',
                  color: '#000000',
                  lineHeight: '1.3',
                }}
              >
                #{folio}
              </span>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', flexShrink: 0 }} />

        <div
          style={{
            padding: '5px 10px',
            backgroundColor: '#000000',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '7px',
              fontWeight: '900',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              lineHeight: 1,
              display: 'block',
            }}
          >
            VISITA A
          </span>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: '700',
              color: '#FFFFFF',
              lineHeight: '1.25',
              display: 'block',
              marginTop: '1px',
              wordBreak: 'break-word',
            }}
          >
            {visitaA || '—'}
          </span>
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', flexShrink: 0 }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          {[
            { label: 'MOTIVO', value: motivoLabel },
            { label: 'IDENTIFICACIÓN', value: idLabel },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: '5px 10px',
                borderRight: i === 0 ? '1px solid #000000' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
              }}
            >
              <span
                style={{
                  fontSize: '7px',
                  fontWeight: '900',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#000000',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: '8.5px',
                  fontWeight: '700',
                  color: '#000000',
                  lineHeight: '1.25',
                  wordBreak: 'break-word',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: '#000000', flexShrink: 0 }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '5px 10px',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontWeight: '700',
              color: '#000000',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            {dateInfo.fecha}
          </span>
          <span
            style={{
              fontSize: '9px',
              fontWeight: '900',
              color: '#000000',
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}
          >
            {dateInfo.hora}
          </span>
        </div>

        <div style={{ height: '4px', backgroundColor: '#000000', flexShrink: 0, marginTop: 'auto' }} />

      </div>
    </div>
  );
}
