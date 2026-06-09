'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Building2,
  Users,
  ClipboardList,
  CreditCard,
  AlertCircle,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import StatusBar from '@/components/ui/StatusBar';
import GafeteVisitante from '@/components/GafeteVisitante';
import { SYSTEM_NAME, ROUTES } from '@/lib/constants';


interface FormData {
  company: string;
  fullName: string;
  visitsTo: string;
  reason: string;
  idType: string;
}

interface FormErrors {
  company?: string;
  fullName?: string;
  visitsTo?: string;
  reason?: string;
  idType?: string;
}


const isValidFullName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter((p) => p.length >= 2);
  return parts.length >= 2;
};

const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};
  if (!data.company.trim()) errors.company = 'Este campo es obligatorio';
  if (!data.fullName.trim()) {
    errors.fullName = 'Este campo es obligatorio';
  } else if (!isValidFullName(data.fullName)) {
    errors.fullName = 'Ingresa nombre y apellido completos';
  }
  if (!data.visitsTo) errors.visitsTo = 'Este campo es obligatorio';
  if (!data.reason) errors.reason = 'Este campo es obligatorio';
  if (!data.idType) errors.idType = 'Este campo es obligatorio';
  return errors;
};

const hasErrors = (e: FormErrors) => Object.keys(e).length > 0;



const inputBase =
  'w-full min-h-[52px] px-4 py-3 text-base rounded-xl border-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none';
const inputNormal = `${inputBase} border-slate-200`;
const inputError = `${inputBase} border-red-400 focus:border-red-400 focus:ring-red-400`;
const labelBase = 'block text-sm font-semibold text-slate-700 mb-1.5';



export default function NuevoVisitantePage() {
  const router = useRouter();

  const [mostrarGafete, setMostrarGafete] = useState(false);
  const [folioRegistro, setFolioRegistro] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');
  const [visitaALabel, setVisitaALabel] = useState('');


  const [form, setForm] = useState<FormData>({
    company: '',
    fullName: '',
    visitsTo: '',
    reason: '',
    idType: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});


  const confirmRegistration = () => {
    const folio = String(Date.now()).slice(-5);
    const fechaHora = new Date().toISOString();
    setFolioRegistro(folio);
    setFechaRegistro(fechaHora);
    setMostrarGafete(true);
  };

  const handleImprimir = () => {
    window.print();
    setTimeout(() => router.push(ROUTES.home), 1000);
  };


  const handleChange = (field: keyof FormData, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    if (touched[field]) {
      setErrors(validateForm(newForm));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateForm(form));
  };


  const handleRegistrar = () => {
    const allTouched = { company: true, fullName: true, visitsTo: true, reason: true, idType: true };
    setTouched(allTouched);
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (!hasErrors(newErrors)) {
      confirmRegistration();
    }
  };

  const isFormValid = !hasErrors(validateForm(form));


  return (
    <div className="flex flex-col h-full bg-slate-100">

      <header className="flex items-center px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex-shrink-0 relative">

        <button
          onClick={() => router.push(ROUTES.home)}
          className="
            flex items-center gap-1.5 px-3 py-2 min-h-[44px]
            text-slate-600 font-medium text-sm
            rounded-xl active:bg-slate-100 transition-colors
            select-none touch-manipulation
          "
        >
          <ArrowLeft size={18} />
          Cancelar
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-900">Nuevo visitante</span>
        </div>

        <div className="ml-auto">
          <Image
            src="/safe-demo_logo-blc-Photoroom.png"
            alt={`${SYSTEM_NAME} logo`}
            width={32}
            height={32}
            className="rounded-lg opacity-60"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={16} className="text-blue-700" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Datos del visitante</h2>
            </div>

            <div>
              <label className={labelBase} htmlFor="company">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-slate-400" />
                  Compañía <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                id="company"
                type="text"
                placeholder="Nombre de la empresa"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                onBlur={() => handleBlur('company')}
                className={touched.company && errors.company ? inputError : inputNormal}
                autoComplete="organization"
              />
              {touched.company && errors.company && (
                <ErrorMsg message={errors.company} />
              )}
            </div>

            <div>
              <label className={labelBase} htmlFor="fullName">
                <span className="flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  Nombre completo <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Nombre y apellidos"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={touched.fullName && errors.fullName ? inputError : inputNormal}
                autoComplete="name"
              />
              {touched.fullName && errors.fullName && (
                <ErrorMsg message={errors.fullName} />
              )}
            </div>

            <div>
              <label className={labelBase} htmlFor="visitsTo">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  A quién visita <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                id="visitsTo"
                value={form.visitsTo}
                onChange={(e) => {
                  const sel = e.target;
                  handleChange('visitsTo', sel.value);
                  setVisitaALabel(sel.options[sel.selectedIndex].text);
                }}
                onBlur={() => handleBlur('visitsTo')}
                className={touched.visitsTo && errors.visitsTo ? inputError : inputNormal}
              >
                <option value="">Seleccionar...</option>
                <option value="jose_hernandez">José de Jesús Hernández Vázquez</option>
              </select>
              {touched.visitsTo && errors.visitsTo && (
                <ErrorMsg message={errors.visitsTo} />
              )}
            </div>

            <div>
              <label className={labelBase} htmlFor="reason">
                <span className="flex items-center gap-1.5">
                  <ClipboardList size={14} className="text-slate-400" />
                  Motivo de visita <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                id="reason"
                value={form.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                onBlur={() => handleBlur('reason')}
                className={touched.reason && errors.reason ? inputError : inputNormal}
              >
                <option value="">Seleccionar motivo...</option>
                <option value="practicas">Prácticas</option>
                <option value="prueba_sistema">Prueba de sistema</option>
                <option value="revision_proyecto">Revisión de proyecto</option>
                <option value="servicio">Servicio</option>
                <option value="visita_cliente">Visita cliente</option>
                <option value="visita_corporativo">Visita corporativo</option>
                <option value="visita_proveedor">Visita de proveedor</option>
              </select>
              {touched.reason && errors.reason && (
                <ErrorMsg message={errors.reason} />
              )}
            </div>

            <div>
              <label className={labelBase} htmlFor="idType">
                <span className="flex items-center gap-1.5">
                  <CreditCard size={14} className="text-slate-400" />
                  Identificación <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                id="idType"
                value={form.idType}
                onChange={(e) => handleChange('idType', e.target.value)}
                onBlur={() => handleBlur('idType')}
                className={touched.idType && errors.idType ? inputError : inputNormal}
              >
                <option value="">Seleccionar...</option>
                <option value="ine">INE</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="licencia">Licencia de conducir</option>
                <option value="gafete_empresa">Gafete de otra empresa</option>
              </select>
              {touched.idType && errors.idType && (
                <ErrorMsg message={errors.idType} />
              )}
            </div>

            <button
              onClick={handleRegistrar}
              disabled={!isFormValid}
              className="
                flex items-center justify-center gap-3
                w-full h-14 mt-2
                bg-emerald-600 text-white text-base font-semibold
                rounded-xl shadow-md shadow-emerald-900/20
                active:scale-[0.98] active:bg-emerald-700
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                transition-all duration-150
                select-none touch-manipulation
              "
            >
              <CheckCircle2 size={20} />
              Registrar visitante
            </button>
          </div>

        </div>
      </main>

      <StatusBar />

      {mostrarGafete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            zIndex: 50,
          }}
        >
          <GafeteVisitante
            folio={folioRegistro}
            nombre={form.fullName}
            empresa={form.company}
            visitaA={visitaALabel}
            motivo={form.reason}
            identificacion={form.idType}
            fechaHora={fechaRegistro}
          />

          <button
            onClick={handleImprimir}
            className="
              flex items-center gap-2
              bg-white text-slate-900 font-semibold
              px-8 py-3 rounded-xl text-base shadow-lg
              active:scale-[0.97] transition-transform
              select-none touch-manipulation
            "
          >
            <Printer size={18} />
            Imprimir gafete
          </button>

          <button
            onClick={() => router.push(ROUTES.home)}
            className="text-white/60 text-sm select-none touch-manipulation active:text-white transition-colors"
          >
            Omitir e ir al inicio
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600 font-medium">
      <AlertCircle size={13} className="flex-shrink-0" />
      {message}
    </p>
  );
}
