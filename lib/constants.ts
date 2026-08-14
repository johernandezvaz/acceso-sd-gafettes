export const SYSTEM_NAME = "CODA";
export const COMPANY_NAME = "Demo Techinic";
export const SYSTEM_VERSION = "v1.0.0";

export const COLORS = {
  primary: "#1d4ed8",
  primaryHover: "#1e40af",
  success: "#15803d",
  warning: "#b45309",
  danger: "#b91c1c",
  info: "#0369a1",
  medical: "#0e7490",
  cleaning: "#4338ca",
  security: "#7c3aed",
  transporter: "#d97706",
} as const;

export const ROUTES = {
  home: "/",
  nuevoVisitante: "/visitante/nuevo",
  salida: "/salida",
  llaves: "/llaves",
  sinGafete: "/sin-gafete",
  transportistas: "/transportistas",
  practicantes: "/practicantes",
  personalMedico: "/personal/medico",
  limpieza: "/personal/limpieza",
  seguridad: "/personal/seguridad",
  adminLogin:          "/admin/login",
  adminChangePassword: "/admin/change-password",
  adminDashboard:      "/admin/dashboard",
  adminPersonal:       "/admin/personal",
  adminTransportistas: "/admin/transportistas",
  adminVisitHosts:     "/admin/personas-a-visitar",
  adminLlaves:         "/admin/llaves",
  adminRegistroLlaves: "/admin/llaves/registro",
  adminRegistros:      "/admin/registros",
  adminVisitantes:     "/admin/visitantes",
  adminUsuarios:       "/admin/usuarios",
  adminLogs:           "/admin/logs",
} as const;
