'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  UserPlus,
  LogOut,
  KeyRound,
  BadgeX,
  GraduationCap,
  Stethoscope,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
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

        <section>
          <PrimaryButton
            href={ROUTES.nuevoVisitante}
            icon={<UserPlus size={28} />}
            label="Registrar nuevo visitante"
            description="Captura datos, foto y gafete del visitante"
          />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton
              href={ROUTES.salida}
              icon={<LogOut size={22} />}
              label="Registrar salida"
              description="Cerrar visita activa"
              iconBg="bg-green-100"
              iconColor="text-green-700"
            />
            <SecondaryButton
              href={ROUTES.llaves}
              icon={<KeyRound size={22} />}
              label="Llaves"
              description="Control de llaves"
              iconBg="bg-amber-100"
              iconColor="text-amber-700"
            />
            <SecondaryButton
              href={ROUTES.sinGafete}
              icon={<BadgeX size={22} />}
              label="Sin gafete"
              description="Acceso sin identificación"
              iconBg="bg-red-100"
              iconColor="text-red-700"
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
