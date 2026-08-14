'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowLeft, AlertCircle, Search, User, ChevronDown, Check, X } from 'lucide-react';
import StatusBar from '@/components/ui/StatusBar';
import { ROUTES } from '@/lib/constants';
import { getKioskKeys, takeKey, returnKey, type KioskKeyItem } from '@/app/actions/keys';
import { getActivePeople, type PersonOption } from '@/app/actions/people';

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
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Modal Tomar
  const [modalTomar, setModalTomar] = useState<KioskKeyItem | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonOption | null>(null);
  const [searchPerson, setSearchPerson] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [submittingTomar, setSubmittingTomar] = useState(false);
  const [errorTomar, setErrorTomar] = useState<string | null>(null);

  // Modal Devolver
  const [modalDevolver, setModalDevolver] = useState<KioskKeyItem | null>(null);
  const [submittingDevolver, setSubmittingDevolver] = useState(false);
  const [errorDevolver, setErrorDevolver] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [keysData, peopleData] = await Promise.all([
        getKioskKeys(),
        getActivePeople(),
      ]);
      setLlaves(keysData);
      setPeople(peopleData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer para refrescar "hace Xm"
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleOpenTomar = (llave: KioskKeyItem) => {
    setModalTomar(llave);
    setSelectedPerson(null);
    setSearchPerson('');
    setOpenCombobox(false);
    setErrorTomar(null);
  };

  const handleConfirmarTomar = async () => {
    if (!modalTomar || !selectedPerson) return;
    setSubmittingTomar(true);
    setErrorTomar(null);
    try {
      const res = await takeKey(modalTomar.id, selectedPerson.id);
      if (res.success) {
        setModalTomar(null);
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

  const hayModal = !!modalTomar || !!modalDevolver;

  const filteredPeople = people.filter((p) =>
    p.fullName.toLowerCase().includes(searchPerson.toLowerCase()) ||
    p.personTypeName.toLowerCase().includes(searchPerson.toLowerCase())
  );

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

      {/* Modales */}
      {hayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          {/* Modal Tomar Llave */}
          {modalTomar && (
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">¿Quién toma la llave?</h2>
                  <p className="text-sm font-semibold text-blue-700 mt-0.5">{modalTomar.name}</p>
                </div>
                <button
                  onClick={() => setModalTomar(null)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Seleccionar empleado <span className="text-red-500">*</span>
                </label>

                {/* Combobox selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenCombobox(!openCombobox)}
                    className="
                      w-full min-h-[52px] px-4 py-3 text-left rounded-xl border-2 border-slate-200 bg-white
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                      flex items-center justify-between gap-2 transition-colors
                    "
                  >
                    {selectedPerson ? (
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-slate-900 truncate">
                          {selectedPerson.fullName}
                        </span>
                        <span className="block text-xs text-slate-500 truncate">
                          {selectedPerson.personTypeName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Seleccionar empleado...</span>
                    )}
                    <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                  </button>

                  {openCombobox && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 max-h-60 flex flex-col">
                      <div className="relative mb-2">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchPerson}
                          onChange={(e) => setSearchPerson(e.target.value)}
                          placeholder="Buscar por nombre o tipo..."
                          className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                        {filteredPeople.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 py-4">No hay coincidencias</p>
                        ) : (
                          filteredPeople.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPerson(p);
                                setOpenCombobox(false);
                                setErrorTomar(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <p className="font-semibold text-slate-800">{p.fullName}</p>
                                <p className="text-[10px] text-slate-400">{p.personTypeName}</p>
                              </div>
                              {selectedPerson?.id === p.id && <Check size={14} className="text-blue-600" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errorTomar && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errorTomar}
                </p>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleConfirmarTomar}
                  disabled={!selectedPerson || submittingTomar}
                  className="
                    w-full h-12 flex items-center justify-center gap-2
                    bg-blue-700 text-white text-sm font-semibold rounded-xl
                    active:scale-[0.98] active:bg-blue-800
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                    transition-all duration-150 select-none touch-manipulation
                  "
                >
                  {submittingTomar ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirmar préstamo'
                  )}
                </button>
                <button
                  onClick={() => setModalTomar(null)}
                  className="
                    w-full h-10 text-slate-500 text-sm font-medium
                    hover:bg-slate-100 rounded-xl transition-colors
                    select-none touch-manipulation
                  "
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Modal Devolver Llave */}
          {modalDevolver && (
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Confirmar devolución</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  ¿Confirmas que{' '}
                  <span className="font-bold text-slate-900">
                    {modalDevolver.activeAssignment?.personName ?? 'el empleado'}
                  </span>{' '}
                  devuelve la llave de{' '}
                  <span className="font-bold text-blue-700">{modalDevolver.name}</span>?
                </p>
                {modalDevolver.activeAssignment?.takenAt && (
                  <p className="text-xs text-slate-400 mt-1">
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

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmarDevolver}
                  disabled={submittingDevolver}
                  className="
                    w-full h-12 flex items-center justify-center gap-2
                    bg-blue-700 text-white text-sm font-semibold rounded-xl
                    active:scale-[0.98] active:bg-blue-800
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
                    w-full h-10 text-slate-500 text-sm font-medium
                    hover:bg-slate-100 rounded-xl transition-colors
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
  const personName = llave.activeAssignment?.personName;
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
          ${disponible ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}
        `}
        >
          <KeyRound size={20} />
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

      {!disponible && personName && (
        <div className="bg-red-50 rounded-xl px-3 py-2 border border-red-100">
          <p className="text-xs font-semibold text-slate-700 truncate">{personName}</p>
          {takenAt && (
            <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>
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