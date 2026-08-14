'use client';

import { useState, useEffect } from 'react';
import { X, CircleCheck, CircleArrowOutUpRight, AlertCircle } from 'lucide-react';
import PersonCombobox from '@/components/admin/PersonCombobox';
import { getActivePeople, type PersonOption } from '@/app/actions/people';
import { registerAccess } from '@/app/actions/access';

export interface Props {
  titulo: string;
  subtitulo: string;
  labelBoton?: string;
  personTypeSlug?: string;
  onSuccess: () => void;
  onClose: () => void;
}

function horaActual() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

interface ToastProps {
  tipo: 'entrada' | 'salida';
  nombre: string;
  hora: string;
  visible: boolean;
}

function Toast({ tipo, nombre, hora, visible }: ToastProps) {
  const esEntrada = tipo === 'entrada';
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="bg-white rounded-2xl p-8 text-center max-w-xs w-full mx-6 shadow-2xl flex flex-col items-center gap-3"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        {esEntrada ? (
          <CircleCheck size={48} className="text-green-600" strokeWidth={1.5} />
        ) : (
          <CircleArrowOutUpRight size={48} className="text-slate-600" strokeWidth={1.5} />
        )}
        <p className="text-xl font-semibold text-slate-900">
          {esEntrada ? 'Entrada registrada' : 'Salida registrada'}
        </p>
        <p className="text-sm text-slate-500">
          {nombre} · {hora}
        </p>
      </div>
    </div>
  );
}

export default function RegistroGeneralModal({
  titulo,
  subtitulo,
  personTypeSlug,
  onSuccess,
  onClose,
}: Props) {
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [loadingPeople, setLoading] = useState(true);
  const [selectedPerson, setSelected] = useState<PersonOption | null>(null);
  const [tipo, setTipo] = useState<'entrada' | 'salida' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastHora, setToastHora] = useState('');

  useEffect(() => {
    getActivePeople(personTypeSlug).then((data) => {
      setPeople(data);
      setLoading(false);
    });
  }, [personTypeSlug]);

  const handleSubmit = async () => {
    if (!selectedPerson) {
      setError('Selecciona una persona');
      return;
    }
    if (!tipo) {
      setError('Selecciona si es entrada o salida');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await registerAccess(
      selectedPerson.id,
      tipo === 'entrada' ? 'ENTRY' : 'EXIT'
    );

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Error al registrar');
      return;
    }

    setToastHora(horaActual());
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      onSuccess();
    }, 2500);
  };

  return (
    <>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{titulo}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{subtitulo}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 active:bg-slate-100 transition-colors touch-manipulation"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-6 flex flex-col gap-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Persona <span className="text-red-500">*</span>
              </label>
              {loadingPeople ? (
                <div className="h-14 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                  <span className="text-xs text-slate-400">Cargando personal...</span>
                </div>
              ) : people.length === 0 ? (
                <div className="h-14 rounded-xl border-2 border-amber-200 bg-amber-50 flex items-center justify-center">
                  <span className="text-xs text-amber-700 font-medium">
                    No hay personal registrado en esta categoría
                  </span>
                </div>
              ) : (
                <PersonCombobox
                  people={people}
                  value={selectedPerson?.id ?? null}
                  onChange={(p) => { setSelected(p); if (error) setError(null); }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo de movimiento <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setTipo('entrada'); if (error) setError(null); }}
                  className={`
                    h-14 rounded-xl border-2 font-semibold text-base
                    transition-all duration-150 active:scale-95
                    select-none touch-manipulation
                    ${tipo === 'entrada'
                      ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-900/20'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-700'}
                  `}
                >
                  Entrada
                </button>
                <button
                  onClick={() => { setTipo('salida'); if (error) setError(null); }}
                  className={`
                    h-14 rounded-xl border-2 font-semibold text-base
                    transition-all duration-150 active:scale-95
                    select-none touch-manipulation
                    ${tipo === 'salida'
                      ? 'bg-slate-600 border-slate-600 text-white shadow-md shadow-slate-900/20'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'}
                  `}
                >
                  Salida
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <AlertCircle size={13} className="flex-shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!tipo || !selectedPerson || submitting}
              className="
                w-full h-14 rounded-xl
                bg-blue-700 text-white font-semibold text-base
                disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-[0.98] active:bg-blue-800
                transition-all duration-150 select-none touch-manipulation
                flex items-center justify-center gap-2
              "
            >
              {submitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {tipo === 'entrada' && 'Registrar entrada'}
                  {tipo === 'salida' && 'Registrar salida'}
                  {!tipo && 'Selecciona entrada o salida'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showToast && tipo && (
        <Toast
          tipo={tipo}
          nombre={selectedPerson?.fullName ?? ''}
          hora={toastHora}
          visible={showToast}
        />
      )}
    </>
  );
}
