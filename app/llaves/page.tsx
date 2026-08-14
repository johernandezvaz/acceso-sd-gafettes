'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft, AlertCircle, User, Sparkles } from 'lucide-react';
import StatusBar from '@/components/ui/StatusBar';
import { ROUTES } from '@/lib/constants';
import {
  getKioskKeys,
  takeKey,
  returnKey,
  type KioskKeyItem,
  type KeyRequesterOption,
} from '@/app/actions/keys';
import KeyRequesterPicker from '@/components/ui/KeyRequesterPicker';

function tiempoTranscurrido(desde: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(desde).getTime()) / 60000);
  if (diff < 1) return 'hace un momento';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `hace ${m}m`;
  return `hace ${h}h ${m}m`;
}

export default function LlavesPage() {
  const router = useRouter();

  const [llaves, setLlaves] = useState<KioskKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const [keyToTake, setKeyToTake] = useState<KioskKeyItem | null>(null);
  const [openPicker, setOpenPicker] = useState(false);

  const [confirmTomar, setConfirmTomar] = useState<{
    key: KioskKeyItem;
    requester: KeyRequesterOption;
  } | null>(null);
  const [submittingTomar, setSubmittingTomar] = useState(false);
  const [errorTomar, setErrorTomar] = useState<string | null>(null);

  const [modalDevolver, setModalDevolver] = useState<KioskKeyItem | null>(null);
  const [submittingDevolver, setSubmittingDevolver] = useState(false);
  const [errorDevolver, setErrorDevolver] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const keysData = await getKioskKeys();
      setLlaves(keysData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const handleOpenTomar = (llave: KioskKeyItem) => {
    setKeyToTake(llave);
    setOpenPicker(true);
  };

  const handleSelectRequester = (requester: KeyRequesterOption) => {
    if (!keyToTake) return;
    setOpenPicker(false);
    setConfirmTomar({
      key: keyToTake,
      requester,
    });
    setErrorTomar(null);
  };

  const handleConfirmarTomar = async () => {
    if (!confirmTomar) return;
    setSubmittingTomar(true);
    setErrorTomar(null);
    try {
      const payload =
        confirmTomar.requester.type === 'CLEANING'
          ? { type: 'CLEANING' as const }
          : {
            type: 'PERSON' as const,
            visitHostId: confirmTomar.requester.id!,
          };

      const res = await takeKey(confirmTomar.key.id, payload);
      if (res.success) {
        setConfirmTomar(null);
        setKeyToTake(null);
        await loadData();
      } else {
        setErrorTomar(res.error ?? 'Error al tomar la llave');
      }
    } finally {
      setSubmittingTomar(false);
    }
  };

  const handleOpenDevolver = (llave: KioskKeyItem) => {
    setModalDevolver(llave);
    setErrorDevolver(null);
  };

  const handleConfirmarDevolver = async () => {
    if (!modalDevolver) return;
    setSubmittingDevolver(true);
    setErrorDevolver(null);
    try {
      const res = await returnKey(modalDevolver.id);
      if (res.success) {
        setModalDevolver(null);
        await loadData();
      } else {
        setErrorDevolver(res.error ?? 'Error al devolver la llave');
      }
    } finally {
      setSubmittingDevolver(false);
    }
  };

  const disponibles = llaves.filter((l) => l.status === 'AVAILABLE').length;
  const enUso = llaves.filter((l) => l.status === 'OCCUPIED').length;
  const total = llaves.length;

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="inline-block w-8 h-8 border-3 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[10px]">
            {llaves.map((llave) => (
              <LlaveCard
                key={llave.id}
                llave={llave}
                tick={tick}
                onTomar={() => handleOpenTomar(llave)}
                onDevolver={() => handleOpenDevolver(llave)}
              />
            ))}
          </div>
        )}
      </main>

      <StatusBar />

      <KeyRequesterPicker
        open={openPicker}
        onClose={() => {
          setOpenPicker(false);
          setKeyToTake(null);
        }}
        onSelect={handleSelectRequester}
      />

      {confirmTomar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`
                w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0
                ${confirmTomar.requester.type === 'CLEANING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}
              `}
              >
                {confirmTomar.requester.type === 'CLEANING' ? (
                  '🧹'
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Confirmar Préstamo
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {confirmTomar.key.name}
                </h2>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-1.5">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Solicitante:
              </p>
              <p className="text-base font-bold text-slate-900">
                {confirmTomar.requester.fullName}
              </p>
              {confirmTomar.requester.position && (
                <p className="text-xs text-slate-600 font-medium">
                  {confirmTomar.requester.position} · {confirmTomar.requester.department}
                </p>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              ¿Confirmas que{' '}
              <strong className="text-slate-900">
                {confirmTomar.requester.fullName}
              </strong>{' '}
              toma la llave de{' '}
              <strong className="text-blue-700">{confirmTomar.key.name}</strong>?
            </p>

            {errorTomar && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                <AlertCircle size={14} className="flex-shrink-0" />
                {errorTomar}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleConfirmarTomar}
                disabled={submittingTomar}
                className="
                  w-full h-12 flex items-center justify-center gap-2
                  bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl
                  active:scale-[0.98]
                  disabled:opacity-50 transition-all duration-150 select-none touch-manipulation
                "
              >
                {submittingTomar ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirmar y tomar llave'
                )}
              </button>
              <button
                onClick={() => {
                  setConfirmTomar(null);
                  setKeyToTake(null);
                }}
                className="
                  w-full h-10 text-slate-500 hover:text-slate-800 text-sm font-medium
                  hover:bg-slate-100 rounded-xl transition-colors
                  select-none touch-manipulation
                "
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDevolver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5 border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Confirmar Devolución
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {modalDevolver.name}
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                ¿Confirmas que{' '}
                <span className="font-bold text-slate-900">
                  {modalDevolver.activeAssignment?.requesterName ?? 'el solicitante'}
                </span>{' '}
                devuelve la llave de{' '}
                <span className="font-bold text-blue-700">{modalDevolver.name}</span>?
              </p>
              {modalDevolver.activeAssignment?.takenAt && (
                <p className="text-xs text-slate-400 mt-2">
                  Tomada {tiempoTranscurrido(modalDevolver.activeAssignment.takenAt)}
                </p>
              )}
            </div>

            {errorDevolver && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                <AlertCircle size={14} className="flex-shrink-0" />
                {errorDevolver}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleConfirmarDevolver}
                disabled={submittingDevolver}
                className="
                  w-full h-12 flex items-center justify-center gap-2
                  bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl
                  active:scale-[0.98]
                  disabled:opacity-50 transition-all duration-150 select-none touch-manipulation
                "
              >
                {submittingDevolver ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirmar devolución'
                )}
              </button>
              <button
                onClick={() => setModalDevolver(null)}
                className="
                  w-full h-10 text-slate-500 hover:text-slate-800 text-sm font-medium
                  hover:bg-slate-100 rounded-xl transition-colors
                  select-none touch-manipulation
                "
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  colorBg,
  colorBorder,
  colorText,
  colorValue,
}: {
  label: string;
  value: number;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorValue: string;
}) {
  return (
    <div className={`${colorBg} ${colorBorder} border rounded-2xl p-3 text-center`}>
      <p className={`text-3xl font-bold tabular-nums ${colorValue}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${colorText}`}>{label}</p>
    </div>
  );
}

function LlaveCard({
  llave,
  tick,
  onTomar,
  onDevolver,
}: {
  llave: KioskKeyItem;
  tick: number;
  onTomar: () => void;
  onDevolver: () => void;
}) {
  const disponible = llave.status === 'AVAILABLE';
  const requesterName = llave.activeAssignment?.requesterName;
  const requesterDetail = llave.activeAssignment?.requesterDetail;
  const isCleaning = llave.activeAssignment?.requesterType === 'CLEANING';
  const takenAt = llave.activeAssignment?.takenAt;

  return (
    <div
      className={`
      flex flex-col gap-3 p-4 bg-white rounded-2xl border-2 shadow-sm
      ${disponible ? 'border-slate-200' : 'border-red-200'}
    `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
          w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl
          ${disponible ? 'bg-slate-100 text-slate-500' : isCleaning ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}
        `}
        >
          {isCleaning ? <span className="text-xl">🧹</span> : <KeyRound size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight truncate">{llave.name}</p>

          <span
            className={`
            inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
            ${disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
          `}
          >
            {disponible ? 'Disponible' : 'En uso'}
          </span>
        </div>
      </div>

      {!disponible && requesterName && (
        <div
          className={`
          rounded-xl px-3 py-2 border
          ${isCleaning ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-100'}
        `}
        >
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-slate-800 truncate">{requesterName}</p>
            {isCleaning && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900">
                <Sparkles size={8} />
                Servicio
              </span>
            )}
          </div>
          {requesterDetail && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{requesterDetail}</p>
          )}
          {takenAt && (
            <p className="text-xs text-slate-400 mt-0.5 font-medium" suppressHydrationWarning>
              {tiempoTranscurrido(takenAt)}
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
            bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl
            active:scale-[0.97]
            transition-all duration-150 select-none touch-manipulation shadow-sm
          "
        >
          Tomar
        </button>
      ) : (
        <button
          onClick={onDevolver}
          className="
            w-full h-11 flex items-center justify-center
            bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded-xl
            active:scale-[0.97]
            transition-all duration-150 select-none touch-manipulation
          "
        >
          Devolver
        </button>
      )}
    </div>
  );
}