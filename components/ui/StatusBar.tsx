'use client';

import { useEffect, useState } from 'react';
import { COMPANY_NAME, SYSTEM_VERSION } from '@/lib/constants';

export default function StatusBar() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const format = () => {
      const now = new Date();
      return now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    };

    setTime(format());
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="
      flex items-center justify-between
      px-6 py-3
      bg-slate-800 text-slate-300
      text-sm font-medium
    ">

      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="
            animate-ping absolute inline-flex h-full w-full
            rounded-full bg-emerald-400 opacity-75
          " />
          <span className="
            relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500
          " />
        </span>
        <span className="text-slate-200 font-semibold">{COMPANY_NAME}</span>
      </div>

      <span className="text-slate-400 text-xs tracking-widest uppercase">
        Sistema de Control de Acceso
      </span>
      <div className="flex items-center gap-3">
        <span className="
          font-mono text-xs bg-slate-700 text-slate-300
          px-2 py-0.5 rounded
        ">
          {time}
        </span>
        <span className="
          text-xs bg-blue-900/60 text-blue-300 border border-blue-700/50
          px-2 py-0.5 rounded
        ">
          {SYSTEM_VERSION}
        </span>
      </div>
    </footer>
  );
}
