'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  UserPlus,
  LogOut,
  KeyRound,
  Truck,
  GraduationCap,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import SecondaryButton from '@/components/ui/SecondaryButton';
import StaffButton from '@/components/ui/StaffButton';
import StatusBar from '@/components/ui/StatusBar';
import { SYSTEM_NAME, ROUTES } from '@/lib/constants';

export default function HomePage() {
  const [clock, setClock] = useState({ time: '', date: '' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const date = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setClock({ time, date });
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const dateCapitalized =
    clock.date.charAt(0).toUpperCase() + clock.date.slice(1);

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">

      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">

        <div className="flex items-center gap-3">
          <Image
            src="/safe-demo_logo-blc-Photoroom.png"
            alt="Safe logo"
            width={40}
            height={40}
            className="rounded-lg"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-none tracking-tight">
              {SYSTEM_NAME}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Control de Acceso
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold text-slate-900 tabular-nums leading-none tracking-tighter">
            {clock.time || '--:--'}
          </p>
          <p className="text-sm text-slate-500 mt-1 font-medium capitalize">
            {dateCapitalized || '…'}
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-5 px-6 py-5 overflow-hidden">

        {/* Acciones principales de visitantes: 2 columnas */}
        <section className="grid grid-cols-2 gap-4">
          <Link
            href={ROUTES.nuevoVisitante}
            className="
              flex items-center gap-4
              w-full min-h-[88px] px-5 py-4
              bg-blue-700 text-white
              rounded-2xl
              shadow-lg shadow-blue-900/25
              active:scale-[0.98] active:bg-blue-800
              transition-all duration-150
              select-none touch-manipulation
              group
            "
          >
            <span className="
              flex-shrink-0
              w-13 h-13 w-12 h-12 flex items-center justify-center
              bg-white/20 rounded-xl
              text-white text-2xl
            ">
              <UserPlus size={26} />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-lg font-bold leading-tight tracking-tight">
                Registrar nuevo visitante
              </span>
              <span className="block text-xs text-blue-100 mt-0.5 font-normal">
                Captura de datos y gafete
              </span>
            </span>
            <span className="
              flex-shrink-0
              w-8 h-8 flex items-center justify-center
              bg-white/10 rounded-lg
              text-white/80 group-active:text-white
            ">
              <ChevronRight size={18} strokeWidth={2.5} />
            </span>
          </Link>

          <Link
            href={ROUTES.salida}
            className="
              flex items-center gap-4
              w-full min-h-[88px] px-5 py-4
              bg-emerald-700 text-white
              rounded-2xl
              shadow-lg shadow-emerald-900/25
              active:scale-[0.98] active:bg-emerald-800
              transition-all duration-150
              select-none touch-manipulation
              group
            "
          >
            <span className="
              flex-shrink-0
              w-12 h-12 flex items-center justify-center
              bg-white/20 rounded-xl
              text-white text-2xl
            ">
              <LogOut size={26} />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-lg font-bold leading-tight tracking-tight">
                Registrar salida
              </span>
              <span className="block text-xs text-emerald-100 mt-0.5 font-normal">
                Cerrar visita activa
              </span>
            </span>
            <span className="
              flex-shrink-0
              w-8 h-8 flex items-center justify-center
              bg-white/10 rounded-lg
              text-white/80 group-active:text-white
            ">
              <ChevronRight size={18} strokeWidth={2.5} />
            </span>
          </Link>
        </section>

        {/* Acciones rápidas: 3 columnas */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <SecondaryButton
              href={ROUTES.llaves}
              icon={<KeyRound size={22} />}
              label="Llaves"
              description="Control de llaves"
              iconBg="bg-amber-100"
              iconColor="text-amber-700"
            />
            <SecondaryButton
              href={ROUTES.transportistas}
              icon={<Truck size={22} />}
              label="Transportistas"
              description="Registro de transporte"
              iconBg="bg-orange-100"
              iconColor="text-orange-700"
            />
            <SecondaryButton
              href={ROUTES.practicantes}
              icon={<GraduationCap size={22} />}
              label="Practicantes"
              description="Registro de pasantes"
              iconBg="bg-sky-100"
              iconColor="text-sky-700"
            />
          </div>
        </section>

        {/* Personal interno: 3 columnas */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Personal interno
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StaffButton
              href={ROUTES.personalMedico}
              icon={<Stethoscope size={26} />}
              label="Personal médico"
              iconBg="bg-cyan-100"
              iconColor="text-cyan-700"
            />
            <StaffButton
              href={ROUTES.limpieza}
              icon={<Sparkles size={26} />}
              label="Limpieza"
              iconBg="bg-indigo-100"
              iconColor="text-indigo-700"
            />
            <StaffButton
              href={ROUTES.seguridad}
              icon={<ShieldCheck size={26} />}
              label="Seguridad"
              iconBg="bg-violet-100"
              iconColor="text-violet-700"
            />
          </div>
        </section>
      </main>

      <StatusBar />
    </div>
  );
}
