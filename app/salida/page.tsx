'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  X,
  CheckCircle2,
  Building2,
  Hash,
  Clock,
  Users,
  ClipboardList,
  AlertCircle,
  UserCheck,
  LogOut,
} from 'lucide-react';
import StatusBar from '@/components/ui/StatusBar';
import {
  UserPlus,
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
import { SYSTEM_NAME, ROUTES } from '@/lib/constants';
import { findVisitorByFolio, registerVisitorExit } from '@/app/actions/visitors';

type VisitorFound = NonNullable<Awaited<ReturnType<typeof findVisitorByFolio>>>;
type ModalState = 'buscar' | 'confirmar' | 'exito';

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

export default function SalidaPage() {
  const router = useRouter();
  const clock = useClock();
  const dateCapitalized = clock.date.charAt(0).toUpperCase() + clock.date.slice(1);

  const [modalState, setModalState] = useState<ModalState>('buscar');
  const [folio, setFolio] = useState('');
  const [folioError, setFolioError] = useState<string | null>(null);
  const [visitaEncontrada, setVisitaEncontrada] = useState<VisitorFound | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [exitTime, setExitTime] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (modalState === 'exito') {
      const t = setTimeout(() => setShowSuccess(true), 50);
      return () => clearTimeout(t);
    } else {
      setShowSuccess(false);
    }
  }, [modalState]);

  useEffect(() => {
    if (modalState === 'exito') {
      const t = setTimeout(() => router.push(ROUTES.home), 2500);
      return () => clearTimeout(t);
    }
  }, [modalState, router]);

  const handleBuscar = async () => {
    if (!folio.trim()) return;
    setSearching(true);
    setFolioError(null);

    const result = await findVisitorByFolio(folio.trim());

    setSearching(false);

    if (!result) {
      setFolioError('Folio no encontrado');
      return;
    }
    if (result.alreadyLeft) {
      setFolioError('Este visitante ya registró su salida');
      return;
    }

    setVisitaEncontrada(result);
    setModalState('confirmar');
  };

  const handleConfirmar = async () => {
    if (!visitaEncontrada) return;
    setConfirming(true);

    const result = await registerVisitorExit(visitaEncontrada.id);

    setConfirming(false);

    if (!result.success) {
      setFolioError(result.error ?? 'Error al registrar salida');
      setModalState('buscar');
      return;
    }

    const now = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    setExitTime(now);
    setModalState('exito');
  };

  const handleCancelarConfirmar = () => {
    setVisitaEncontrada(null);
    setModalState('buscar');
  };

  const handleClose = () => router.push(ROUTES.home);

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
          <section>
            <PrimaryButton href={ROUTES.nuevoVisitante} icon={<UserPlus size={28} />} label="Registrar nuevo visitante" description="Captura datos, foto y gafete del visitante" />
          </section>
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <SecondaryButton href={ROUTES.salida} icon={<LogOut size={22} />} label="Registrar salida" description="Cerrar visita activa" iconBg="bg-green-100" iconColor="text-green-700" />
              <SecondaryButton href={ROUTES.llaves} icon={<KeyRound size={22} />} label="Llaves" description="Control de llaves" iconBg="bg-amber-100" iconColor="text-amber-700" />
              <SecondaryButton href={ROUTES.sinGafete} icon={<BadgeX size={22} />} label="Sin gafete" description="Acceso sin identificación" iconBg="bg-red-100" iconColor="text-red-700" />
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

      <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm z-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

          {modalState === 'buscar' && (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <LogOut size={20} className="text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Registrar salida</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Ingresa el folio impreso en el gafete</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 active:bg-slate-100 transition-colors touch-manipulation"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-6 flex flex-col gap-4">
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej. 123456"
                    value={folio}
                    onChange={(e) => { setFolio(e.target.value); setFolioError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                    className={`
                      w-full h-14 px-5 text-xl text-center font-semibold rounded-xl border-2
                      text-slate-900 placeholder:text-slate-300
                      focus:outline-none focus:ring-2 transition-colors
                      ${folioError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'}
                    `}
                  />
                  {folioError && (
                    <p className="flex items-center gap-1.5 mt-2 text-sm text-red-600 font-medium">
                      <AlertCircle size={13} className="flex-shrink-0" />
                      {folioError}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleBuscar}
                  disabled={!folio.trim() || searching}
                  className="
                    flex items-center justify-center gap-2.5 w-full h-14
                    bg-blue-700 text-white text-base font-semibold rounded-xl
                    shadow-md shadow-blue-900/20 active:scale-[0.98] active:bg-blue-800
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                    transition-all duration-150 select-none touch-manipulation
                  "
                >
                  {searching ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Search size={20} /> Buscar folio</>
                  )}
                </button>
              </div>
            </>
          )}

          {modalState === 'confirmar' && visitaEncontrada && (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <UserCheck size={20} className="text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Confirmar salida</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Verifica los datos antes de continuar</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  <DataRow icon={<Hash size={15} className="text-slate-400" />} label="Folio" value={`#${visitaEncontrada.folio}`} highlight />
                  <DataRow icon={<Users size={15} className="text-slate-400" />} label="Nombre" value={visitaEncontrada.fullName} />
                  <DataRow icon={<Building2 size={15} className="text-slate-400" />} label="Empresa" value={visitaEncontrada.company} />
                  <DataRow icon={<UserCheck size={15} className="text-slate-400" />} label="Visita a" value={visitaEncontrada.visitTo} />
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleCancelarConfirmar}
                  className="
                    flex-1 flex items-center justify-center gap-2 h-14
                    bg-white border-2 border-slate-200 text-slate-700 text-base font-semibold
                    rounded-xl active:scale-[0.97] active:bg-slate-50
                    transition-all duration-150 select-none touch-manipulation
                  "
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmar}
                  disabled={confirming}
                  className="
                    flex-[2] flex items-center justify-center gap-2.5 h-14
                    bg-blue-700 text-white text-base font-semibold
                    rounded-xl shadow-md shadow-blue-900/20
                    active:scale-[0.98] active:bg-blue-800
                    disabled:opacity-50
                    transition-all duration-150 select-none touch-manipulation
                  "
                >
                  {confirming ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><LogOut size={19} /> Confirmar salida</>
                  )}
                </button>
              </div>
            </>
          )}

          {modalState === 'exito' && visitaEncontrada && (
            <div className="flex flex-col items-center px-6 py-10 gap-4 text-center">
              <div
                style={{
                  transform: showSuccess ? 'scale(1)' : 'scale(0.4)',
                  opacity: showSuccess ? 1 : 0,
                  transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
                }}
              >
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={52} className="text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <div
                style={{
                  opacity: showSuccess ? 1 : 0,
                  transform: showSuccess ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 350ms ease 200ms, transform 350ms ease 200ms',
                }}
              >
                <h2 className="text-2xl font-bold text-slate-900">Salida registrada</h2>
                <p className="text-base text-slate-600 mt-1.5 font-medium">
                  {visitaEncontrada.fullName} · {exitTime}
                </p>
                <p className="text-sm text-slate-400 mt-2">El visitante puede retirar su gafete</p>
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: showSuccess ? '0%' : '100%', transition: 'width 2.4s linear 100ms' }}
                />
              </div>
              <p className="text-xs text-slate-400">Cerrando automáticamente…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <span className="flex items-center gap-2 text-xs text-slate-500 font-medium min-w-[90px]">
        {icon}{label}
      </span>
      <span className={`text-sm font-semibold text-right ${highlight ? 'text-blue-700 font-mono' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
