'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';
import StatusBar from '@/components/ui/StatusBar';
import { ROUTES } from '@/lib/constants';


type EstadoLlave = 'disponible' | 'ocupada' | 'inactiva';

interface Llave {
  id: string;
  nombre: string;
  estado: EstadoLlave;
  tomadaPor?: string;
  tomadaAlas?: string;
}


function tiempoTranscurrido(desde: string): string {
  const diff = Math.floor((Date.now() - new Date(desde).getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `hace ${m}m`;
  return `hace ${h}h ${m}m`;
}


export default function LlavesPage() {
  const router = useRouter();

  const [llaves, setLlaves] = useState<Llave[]>([
    { id: '1', nombre: 'Sala Agave', estado: 'disponible' },
    { id: '2', nombre: 'Sala Mezquite', estado: 'ocupada', tomadaPor: 'Yagamy N. López', tomadaAlas: '2026-06-05T08:28:00' },
    { id: '3', nombre: 'Sala Sotol', estado: 'disponible' },
    { id: '4', nombre: 'Sala Aant', estado: 'disponible' },
    { id: '5', nombre: 'Sala Asakao', estado: 'disponible' },
    { id: '6', nombre: 'Enfermería', estado: 'ocupada', tomadaPor: 'Rodrigo M. Serna', tomadaAlas: '2026-06-05T11:05:00' },
  ]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const [modalTomar, setModalTomar] = useState<Llave | null>(null);
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const tomarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalTomar) {
      setNombreEmpleado('');
      setTimeout(() => tomarInputRef.current?.focus(), 50);
    }
  }, [modalTomar]);

  const handleConfirmarTomar = () => {
    if (!nombreEmpleado.trim() || !modalTomar) return;
    setLlaves((prev) =>
      prev.map((l) =>
        l.id === modalTomar.id
          ? { ...l, estado: 'ocupada', tomadaPor: nombreEmpleado.trim(), tomadaAlas: new Date().toISOString() }
          : l
      )
    );
    setModalTomar(null);
  };

  const [modalDevolver, setModalDevolver] = useState<Llave | null>(null);

  const handleConfirmarDevolver = () => {
    if (!modalDevolver) return;
    setLlaves((prev) =>
      prev.map((l) =>
        l.id === modalDevolver.id
          ? { ...l, estado: 'disponible', tomadaPor: undefined, tomadaAlas: undefined }
          : l
      )
    );
    setModalDevolver(null);
  };

  const disponibles = llaves.filter((l) => l.estado === 'disponible').length;
  const enUso = llaves.filter((l) => l.estado === 'ocupada').length;
  const total = llaves.length;

  const hayModal = !!modalTomar || !!modalDevolver;

  return (
    <div className="flex flex-col h-full bg-slate-100">

      <header className="flex items-center px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex-shrink-0 relative">
        <button
          onClick={() => router.push(ROUTES.home)}
          className="
            flex items-center gap-1.5 px-3 py-2 min-h-[44px]
            text-slate-600 font-medium text-sm rounded-xl
            active:bg-slate-100 transition-colors
            select-none touch-manipulation
          "
        >
          <ArrowLeft size={18} />
          Inicio
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-900">Panel de llaves</span>
        </div>

        <div className="ml-auto w-[80px]" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            label="Disponibles"
            value={disponibles}
            colorBg="bg-emerald-50"
            colorBorder="border-emerald-200"
            colorText="text-emerald-700"
            colorValue="text-emerald-800"
          />
          <SummaryCard
            label="En uso"
            value={enUso}
            colorBg="bg-red-50"
            colorBorder="border-red-200"
            colorText="text-red-600"
            colorValue="text-red-700"
          />
          <SummaryCard
            label="Total"
            value={total}
            colorBg="bg-slate-50"
            colorBorder="border-slate-200"
            colorText="text-slate-500"
            colorValue="text-slate-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-[10px]">
          {llaves.map((llave) => (
            <LlaveCard
              key={llave.id}
              llave={llave}
              tick={tick}
              onTomar={() => setModalTomar(llave)}
              onDevolver={() => setModalDevolver(llave)}
            />
          ))}
        </div>
      </main>

      <StatusBar />

      {hayModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40">

          {modalTomar && (
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">¿Quién toma la llave?</h2>
                <p className="text-sm text-slate-500 mt-1">{modalTomar.nombre}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre del empleado
                </label>
                <input
                  ref={tomarInputRef}
                  type="text"
                  placeholder="Nombre completo"
                  value={nombreEmpleado}
                  onChange={(e) => setNombreEmpleado(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmarTomar()}
                  className="
                    w-full h-14 px-4 text-lg rounded-xl border-2 border-slate-200
                    text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-colors
                  "
                />
                {nombreEmpleado === '' && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                    <AlertCircle size={11} />
                    Requerido para confirmar
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmarTomar}
                  disabled={!nombreEmpleado.trim()}
                  className="
                    w-full h-12 flex items-center justify-center
                    bg-blue-700 text-white text-base font-semibold rounded-xl
                    active:scale-[0.98] active:bg-blue-800
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                    transition-all duration-150 select-none touch-manipulation
                  "
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setModalTomar(null)}
                  className="
                    w-full h-10 text-slate-500 text-sm font-medium
                    active:text-slate-800 transition-colors
                    select-none touch-manipulation
                  "
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {modalDevolver && (
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Confirmar devolución</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  ¿Confirmas que{' '}
                  <span className="font-semibold text-slate-700">{modalDevolver.tomadaPor}</span>{' '}
                  devuelve la llave de{' '}
                  <span className="font-semibold text-slate-700">{modalDevolver.nombre}</span>?
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmarDevolver}
                  className="
                    w-full h-12 flex items-center justify-center
                    bg-blue-700 text-white text-base font-semibold rounded-xl
                    active:scale-[0.98] active:bg-blue-800
                    transition-all duration-150 select-none touch-manipulation
                  "
                >
                  Devolver
                </button>
                <button
                  onClick={() => setModalDevolver(null)}
                  className="
                    w-full h-10 text-slate-500 text-sm font-medium
                    active:text-slate-800 transition-colors
                    select-none touch-manipulation
                  "
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label, value,
  colorBg, colorBorder, colorText, colorValue,
}: {
  label: string; value: number;
  colorBg: string; colorBorder: string; colorText: string; colorValue: string;
}) {
  return (
    <div className={`${colorBg} ${colorBorder} border rounded-2xl p-3 text-center`}>
      <p className={`text-3xl font-bold tabular-nums ${colorValue}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${colorText}`}>{label}</p>
    </div>
  );
}

function LlaveCard({
  llave, tick, onTomar, onDevolver,
}: {
  llave: Llave;
  tick: number;
  onTomar: () => void;
  onDevolver: () => void;
}) {
  const disponible = llave.estado === 'disponible';

  return (
    <div className={`
      flex flex-col gap-3 p-4 bg-white rounded-2xl border-2 shadow-sm
      ${disponible ? 'border-slate-200' : 'border-red-200'}
    `}>

      <div className="flex items-start gap-3">
        <div className={`
          w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl
          ${disponible ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}
        `}>
          <KeyRound size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight truncate">{llave.nombre}</p>

          <span className={`
            inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
            ${disponible
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'}
          `}>
            {disponible ? 'Disponible' : 'En uso'}
          </span>
        </div>
      </div>

      {!disponible && llave.tomadaPor && (
        <div className="bg-red-50 rounded-xl px-3 py-2 border border-red-100">
          <p className="text-xs font-semibold text-slate-700 truncate">{llave.tomadaPor}</p>
          {llave.tomadaAlas && (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>
              {tiempoTranscurrido(llave.tomadaAlas)}
              <span className="hidden">{tick}</span>
            </p>
          )}
        </div>
      )}

      {disponible ? (
        <button
          onClick={onTomar}
          className="
            w-full h-11 flex items-center justify-center
            bg-blue-700 text-white text-sm font-semibold rounded-xl
            active:scale-[0.97] active:bg-blue-800
            transition-all duration-150 select-none touch-manipulation
          "
        >
          Tomar
        </button>
      ) : (
        <button
          onClick={onDevolver}
          className="
            w-full h-11 flex items-center justify-center
            bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl
            active:scale-[0.97] active:bg-slate-300
            transition-all duration-150 select-none touch-manipulation
          "
        >
          Devolver
        </button>
      )}
    </div>
  );
}
