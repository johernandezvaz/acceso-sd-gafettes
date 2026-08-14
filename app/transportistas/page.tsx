'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import SecondaryButton from '@/components/ui/SecondaryButton';
import StaffButton from '@/components/ui/StaffButton';
import StatusBar from '@/components/ui/StatusBar';
import RegistroGeneralModal from '@/components/modals/RegistroGeneralModal';
import { SYSTEM_NAME, ROUTES } from '@/lib/constants';

function useClock() {
  const [clock, setClock] = useState({ time: '', date: '' });
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock({
        time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
        date: now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      });
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

export default function TransportistasPage() {
  const router = useRouter();
  const clock = useClock();
  const dateCapitalized = clock.date.charAt(0).toUpperCase() + clock.date.slice(1);

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      <div className="flex flex-col h-full pointer-events-none select-none" aria-hidden>
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image src="/safe-demo_logo-blc-Photoroom.png" alt="Safe logo" width={40} height={40} className="rounded-lg" />
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{SYSTEM_NAME}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Control de Acceso</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-slate-900 tabular-nums leading-none tracking-tighter">{clock.time || '--:--'}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium capitalize">{dateCapitalized || '…'}</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col gap-5 px-6 py-5 overflow-hidden">
          <section className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 w-full min-h-[88px] px-5 py-4 bg-blue-700 text-white rounded-2xl">
              <span className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl text-white text-2xl">
                <UserPlus size={26} />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-lg font-bold leading-tight">Registrar nuevo visitante</span>
                <span className="block text-xs text-blue-100 mt-0.5">Captura de datos y gafete</span>
              </span>
            </div>
            <div className="flex items-center gap-4 w-full min-h-[88px] px-5 py-4 bg-emerald-700 text-white rounded-2xl">
              <span className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl text-white text-2xl">
                <LogOut size={26} />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-lg font-bold leading-tight">Registrar salida</span>
                <span className="block text-xs text-emerald-100 mt-0.5">Cerrar visita activa</span>
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Acciones rápidas</h2>
            <div className="grid grid-cols-3 gap-3">
              <SecondaryButton href={ROUTES.llaves} icon={<KeyRound size={22} />} label="Llaves" description="Control de llaves" iconBg="bg-amber-100" iconColor="text-amber-700" />
              <SecondaryButton href={ROUTES.transportistas} icon={<Truck size={22} />} label="Transportistas" description="Registro de transporte" iconBg="bg-orange-100" iconColor="text-orange-700" />
              <SecondaryButton href={ROUTES.practicantes} icon={<GraduationCap size={22} />} label="Practicantes" description="Registro de pasantes" iconBg="bg-sky-100" iconColor="text-sky-700" />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Personal interno</h2>
            <div className="grid grid-cols-3 gap-3">
              <StaffButton href={ROUTES.personalMedico} icon={<Stethoscope size={26} />} label="Personal médico" iconBg="bg-cyan-100" iconColor="text-cyan-700" />
              <StaffButton href={ROUTES.limpieza} icon={<Sparkles size={26} />} label="Limpieza" iconBg="bg-indigo-100" iconColor="text-indigo-700" />
              <StaffButton href={ROUTES.seguridad} icon={<ShieldCheck size={26} />} label="Seguridad" iconBg="bg-violet-100" iconColor="text-violet-700" />
            </div>
          </section>
        </main>
        <StatusBar />
      </div>

      <RegistroGeneralModal
        titulo="Transportistas"
        subtitulo="Registro de acceso para personal de transporte y logística"
        personTypeSlug="transportistas"
        labelBoton="Registrar transportista"
        onSuccess={() => router.push(ROUTES.home)}
        onClose={() => router.push(ROUTES.home)}
      />
    </div>
  );
}
