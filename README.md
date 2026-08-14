# CODA — Sistema de Control de Acceso

> **Documento de contexto para agentes de IA.**
> Este README es la fuente primaria de comprensión arquitectónica del proyecto. Léelo completo antes de modificar cualquier archivo.

---

## Índice

1. [Qué es el proyecto](#1-qué-es-el-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura de directorios](#3-estructura-de-directorios)
4. [Arquitectura y flujo de datos](#4-arquitectura-y-flujo-de-datos)
5. [Rutas de la aplicación](#5-rutas-de-la-aplicación)
6. [Módulos y responsabilidades](#6-módulos-y-responsabilidades)
7. [Componentes UI reutilizables](#7-componentes-ui-reutilizables)
8. [Sistema de estilos](#8-sistema-de-estilos)
9. [Constantes globales](#9-constantes-globales)
10. [Funcionalidades principales](#10-funcionalidades-principales)
11. [Estado de datos — Sin backend real](#11-estado-de-datos--sin-backend-real)
12. [Autenticación y seguridad](#12-autenticación-y-seguridad)
13. [Sistema de impresión de gafetes](#13-sistema-de-impresión-de-gafetes)
14. [Dependencias importantes](#14-dependencias-importantes)
15. [Variables de entorno](#15-variables-de-entorno)
16. [Cómo ejecutar el proyecto](#16-cómo-ejecutar-el-proyecto)
17. [Convenciones de código](#17-convenciones-de-código)
18. [Decisiones arquitectónicas](#18-decisiones-arquitectónicas)
19. [Mapa mental del proyecto](#19-mapa-mental-del-proyecto)
20. [AI AGENT CONTEXT](#20-ai-agent-context)

---

## 1. Qué es el proyecto

**CODA** (nombre en `lib/constants.ts`: `SYSTEM_NAME = "CODA"`) es una aplicación web de **control de acceso industrial** operada por la empresa **Demo Techinic** (`COMPANY_NAME`). Actualmente en la versión `v1.0.0`.

El sistema es operado por personal de recepción/seguridad desde un dispositivo táctil fijo (tablet o pantalla kiosco). Permite:

- Registrar la entrada de **visitantes externos** con generación de gafete físico imprimible.
- Registrar la **salida** de visitantes mediante búsqueda por folio.
- Gestionar el **control de llaves** de salas y espacios.
- Registrar acceso de personas **sin gafete** identificado.
- Registrar **practicantes/pasantes**.
- Registrar entrada/salida de **personal interno** agrupado por tipo: médico, limpieza y seguridad.

La interfaz está diseñada exclusivamente para **uso táctil** en un único dispositivo fijo. No es multi-usuario ni multi-dispositivo.

El archivo `safe_visitor_main_redesign.html` en la raíz es un **prototipo HTML estático** de referencia visual. No forma parte del build de la aplicación.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.7 |
| Runtime UI | React | 19.2.4 |
| Lenguaje | TypeScript | ^5 |
| Estilos | Tailwind CSS v4 | ^4 |
| Procesador CSS | @tailwindcss/postcss | ^4 |
| Iconos | lucide-react | ^1.17.0 |
| QR Code | qrcode.react | ^4.2.0 |
| Fuente | Inter (Google Fonts, next/font) | — |
| Linting | ESLint + eslint-config-next | 16.2.7 |
| Gestión de paquetes | npm (package-lock.json presente) | — |

> **IMPORTANTE — Next.js 16:** Antes de usar cualquier API de Next.js, verificar en `node_modules/next/dist/docs/`. Ver también `AGENTS.md` en la raíz del proyecto.

> **Tailwind CSS v4:** No usa `tailwind.config.js`. La configuración de tokens se hace en `globals.css` con `@theme inline {}`. No hay archivo `tailwind.config.ts/js`.

---

## 3. Estructura de directorios

```text
sistema-entrada/
├── app/                          # App Router de Next.js (rutas = directorios)
│   ├── layout.tsx                # Layout raíz: fuente Inter, metadatos e iconos globales
│   ├── page.tsx                  # Pantalla principal (home / dashboard)
│   ├── globals.css               # Estilos globales + tokens CSS + print media query
│   ├── visitante/
│   │   └── nuevo/
│   │       └── page.tsx          # Registro de nuevo visitante (formulario + gafete)
│   ├── salida/
│   │   └── page.tsx              # Registro de salida (búsqueda por folio)
│   ├── llaves/
│   │   └── page.tsx              # Panel de control de llaves
│   ├── sin-gafete/
│   │   └── page.tsx              # Registro de acceso sin identificación
│   ├── practicantes/
│   │   └── page.tsx              # Registro de practicantes/pasantes
│   └── personal/
│       ├── medico/
│       │   └── page.tsx          # Registro de personal médico
│       ├── limpieza/
│       │   └── page.tsx          # Registro de personal de limpieza
│       └── seguridad/
│           └── page.tsx          # Registro de personal de seguridad
│
├── components/
│   ├── GafeteVisitante.tsx       # Componente de preview de gafete Brother QL (53x84.5mm, B&W)
│   ├── modals/
│   │   └── RegistroGeneralModal.tsx  # Modal reutilizable entrada/salida de personal
│   └── ui/
│       ├── PrimaryButton.tsx     # Botón principal azul de navegación
│       ├── SecondaryButton.tsx   # Botón secundario blanco de navegación
│       ├── StaffButton.tsx       # Botón compacto vertical para personal interno
│       └── StatusBar.tsx         # Barra inferior con reloj, versión y empresa
│
├── lib/
│   ├── constants.ts              # Constantes globales: SYSTEM_NAME, ROUTES, COLORS
│   └── printing/
│       └── brother/
│           ├── visitorBadge.ts   # Generador de comandos Brother QL Raster (53x84.5mm, 300 DPI)
│           └── printer.ts        # Servicio de transporte (Browser Print, red TCP Wi-Fi puerto 9100, .PRN)
│
├── public/
│   ├── favicon_io/               # Iconos y manifiesto de la aplicación (favicon, apple-touch-icon, webmanifest)
│   └── safe-demo_logo-blc-Photoroom.png  # Logo del sistema
│
├── AGENTS.md                     # Reglas para agentes de IA
├── CLAUDE.md                     # Apunta a AGENTS.md con @AGENTS.md
├── safe_visitor_main_redesign.html  # Prototipo estático de referencia (NO parte del build)
├── next.config.ts                # Configuración de Next.js (vacía)
├── tsconfig.json                 # TypeScript config (strict: true, paths: @/* → ./*)
├── postcss.config.mjs            # PostCSS con @tailwindcss/postcss
├── eslint.config.mjs             # ESLint con next/core-web-vitals + next/typescript
└── package.json                  # Scripts y dependencias
```

### Responsabilidades por directorio

| Directorio | Responsabilidad |
|---|---|
| `app/` | Rutas y páginas (Next.js App Router). Cada subdirectorio con `page.tsx` es una ruta. |
| `app/personal/` | Agrupa los 3 tipos de personal interno bajo un segmento URL común. |
| `components/ui/` | Componentes visuales reutilizables. Sin lógica de negocio. |
| `components/modals/` | Modales con lógica de formulario. Solo `RegistroGeneralModal` actualmente. |
| `components/` (raíz) | Componentes específicos y complejos (`GafeteVisitante`). |
| `lib/` | Constantes y utilidades compartidas. |
| `public/` | Assets estáticos (imágenes, SVGs). |

---

## 4. Arquitectura y flujo de datos

### Arquitectura general

**Next.js 16 App Router con PostgreSQL (Prisma ORM), Server Actions y Autenticación con cookies encriptadas.**

- **Kiosco (Público):** Pantalla principal táctil para registro de visitantes con generación/impresión de gafete, salida por folio, control de llaves y registro de acceso de personal interno con selección mediante Combobox dinámico.
- **Panel Administrativo (Protegido):** En `/admin/*`, separado visualmente del kiosco, protegido por sesión encriptada (`iron-session`) con layout Server Component y login seguro (`bcryptjs`). Métricas en tiempo real, gestión de personal (CRUD), historial de accesos y visitantes.

```
DISPOSITIVO TÁCTIL (Kiosco) / NAVEGADOR ADMIN
         ↓
   Next.js 16 (puerto 4555)
         ↓
   Server Actions (`app/actions/*`) & Server Components
         ↓
   Prisma ORM 7 (`@prisma/adapter-pg` + `pg` Pool)
         ↓
   PostgreSQL (`sistema-entrada`) — Fuente Única de Verdad
```

---

## 5. Rutas de la aplicación

Definidas en `lib/constants.ts → ROUTES`:

| Path | Constante | Archivo | Descripción | Auth |
|---|---|---|---|---|
| `/` | `ROUTES.home` | `app/page.tsx` | Pantalla principal del kiosco | No |
| `/visitante/nuevo` | `ROUTES.nuevoVisitante` | `app/visitante/nuevo/page.tsx` | Registro de visitante (persiste en DB + gafete) | No |
| `/salida` | `ROUTES.salida` | `app/salida/page.tsx` | Registro de salida (busca por folio en DB) | No |
| `/llaves` | `ROUTES.llaves` | `app/llaves/page.tsx` | Control de llaves | No |
| `/sin-gafete` | `ROUTES.sinGafete` | `app/sin-gafete/page.tsx` | Acceso sin identificación | No |
| `/practicantes` | `ROUTES.practicantes` | `app/practicantes/page.tsx` | Registro practicantes (Combobox DB) | No |
| `/personal/medico` | `ROUTES.personalMedico` | `app/personal/medico/page.tsx` | Personal médico (Combobox DB) | No |
| `/personal/limpieza` | `ROUTES.limpieza` | `app/personal/limpieza/page.tsx` | Personal limpieza (Combobox DB) | No |
| `/personal/seguridad` | `ROUTES.seguridad` | `app/personal/seguridad/page.tsx` | Personal seguridad (Combobox DB) | No |
| `/admin` | — | `app/admin/page.tsx` | Redirección a `/admin/dashboard` | — |
| `/admin/login` | `ROUTES.adminLogin` | `app/admin/login/page.tsx` | Inicio de sesión administrativo | No |
| `/admin/dashboard` | `ROUTES.adminDashboard` | `app/admin/(authenticated)/dashboard/page.tsx` | Dashboard con métricas | **Sí** |
| `/admin/personal` | `ROUTES.adminPersonal` | `app/admin/(authenticated)/personal/page.tsx` | Catálogo y CRUD de personal | **Sí** |
| `/admin/registros` | `ROUTES.adminRegistros` | `app/admin/(authenticated)/registros/page.tsx` | Historial y filtros de accesos | **Sí** |
| `/admin/visitantes` | `ROUTES.adminVisitantes` | `app/admin/(authenticated)/visitantes/page.tsx` | Historial y detalle de visitantes | **Sí** |

---

## 6. Módulos y responsabilidades

### `app/page.tsx` — Home / Dashboard

- Muestra hora en tiempo real (cada 60 segundos).
- Renderiza `PrimaryButton`, `SecondaryButton`, `StaffButton`.
- Tres secciones: acción principal, acciones rápidas, personal interno.

### `app/visitante/nuevo/page.tsx` — Registro de Visitante

- Formulario con 5 campos: empresa, nombre completo, visita a, motivo, tipo de identificación.
- Validación con patrón `touched + errors` (solo muestra errores en campos ya tocados).
- `isValidFullName()`: valida al menos 2 palabras de ≥ 2 caracteres.
- Al confirmar: folio = `Date.now().toString().slice(-5)`, fecha ISO, overlay con `<GafeteVisitante>`.
- Imprimir: `window.print()` → setTimeout(1000) → home. O "Omitir" → home directamente.
- Estilos de inputs (`inputBase`, `inputNormal`, `inputError`, `labelBase`) como constantes al inicio del archivo.
- El campo "A quién visita" está hardcodeado con una sola opción.

### `app/salida/page.tsx` — Registro de Salida

- Patrón modal sobre home deshabilitado.
- Máquina de estados: `'buscar' | 'confirmar' | 'exito'`.
- Búsqueda por folio contra `MOCK_VISITAS` (folios `00142` y `00143`).
- Estado `'exito'` auto-redirige al home en 2.5 segundos.
- Define `useClock()` como función local (código duplicado).

### `app/llaves/page.tsx` — Control de Llaves

- Estado local con llaves: `{ id, nombre, estado, tomadaPor?, tomadaAlas? }`.
- `EstadoLlave`: `'disponible' | 'ocupada' | 'inactiva'`.
- 6 llaves hardcodeadas.
- Tomar (requiere nombre empleado) / Devolver con confirmación modal.
- Tiempo transcurrido calculado y actualizado cada minuto.
- Sin persistencia.

### Páginas de personal y accesos especiales

`/sin-gafete`, `/practicantes`, `/personal/medico`, `/personal/limpieza`, `/personal/seguridad` son **idénticas en estructura**:

1. Renderizan home con `pointer-events-none` y `aria-hidden`.
2. Montan `<RegistroGeneralModal>` con props específicas.
3. `onSuccess` y `onClose` redirigen al home.

La única diferencia son las props `titulo` y `subtitulo` del modal.

---

## 7. Componentes UI reutilizables

### `components/ui/PrimaryButton.tsx`

Botón principal de acción destacada (azul). Para "Registrar nuevo visitante".

```typescript
Props: { href: string; icon: ReactNode; label: string; description?: string }
```

Apariencia: `bg-blue-700`, ancho completo, `min-h-[80px]`, ícono en `bg-white/20`, chevron derecho. `active:scale-[0.98]`.

---

### `components/ui/SecondaryButton.tsx`

Botones de acciones rápidas en grid 2x2. Fondo blanco con borde.

```typescript
Props: { href: string; icon: ReactNode; label: string; description?: string; iconBg?: string; iconColor?: string }
```

Apariencia: blanco, `border-slate-200`, ícono con color configurable. `active:scale-[0.97]`.

---

### `components/ui/StaffButton.tsx`

Botones compactos verticales para "Personal interno" en grid 3 columnas.

```typescript
Props: { href: string; icon: ReactNode; label: string; iconBg?: string; iconColor?: string }
```

Apariencia: layout columna, ícono circular `rounded-full` con `ring-4 ring-white`. `active:scale-[0.95]`.

---

### `components/ui/StatusBar.tsx`

Barra inferior fija en **todas** las páginas.

Contenido: punto pulsante verde (`animate-ping`) + `COMPANY_NAME` | "Sistema de Control de Acceso" | reloj HH:MM:SS + badge versión.

Apariencia: `bg-slate-800 text-slate-300`.

---

### `components/modals/RegistroGeneralModal.tsx`

Modal reutilizable para registro de entrada/salida de personal (no visitantes).

```typescript
Props: {
  titulo: string;
  subtitulo: string;
  labelBoton?: string;   // definido en interfaz pero no usado en render actual
  onSuccess: () => void;
  onClose: () => void;
}
```

Lógica: nombre completo (validado) + toggle Entrada/Salida + Toast de confirmación 2.5s + llamada a `onSuccess()`.

> **Bug conocido (línea 220):** `{(showToast || true) && tipo && ...}`. El `|| true` hace que el Toast se renderice siempre que `tipo !== null`. Parece un residuo de desarrollo.

---

### `components/GafeteVisitante.tsx`

Preview visual del gafete físico para **Brother QL-810W** (53 mm × 84.5 mm, vertical/portrait).

**Esquema de color:** Estrictamente **Blanco (#FFFFFF) y Negro (#000000)**. No utiliza tonos grises, degradados ni colores secundarios.

```typescript
Props: {
  folio: string;
  nombre: string;
  empresa: string;
  visitaA: string;
  motivo: string;
  identificacion: string;
  fechaHora: string | Date;
}
```

Estructura vertical (top → bottom):
1. **Barra superior:** 4px negra sólida.
2. **Header:** Logo Safe Demo (monocromático) + Badge "VISITANTE" (bloque negro con texto blanco).
3. **Sección Principal:** Nombre (mayúsculas, bold, wrap) + Empresa + Folio (`FOLIO #000123`).
4. **Sección Visita:** `VISITA A` (anfitrión) + `MOTIVO` + `IDENTIFICACIÓN`.
5. **Footer:** Fecha (`DD/MM/YYYY`) y Hora (`HH:mm`) a la izquierda + Código QR a la derecha.


---

## 8. Sistema de estilos

### Configuración

- Tailwind CSS v4 — `@import "tailwindcss"` en `globals.css`.
- Sin `tailwind.config.js`. Tokens en `globals.css` con `@theme inline {}`.
- PostCSS via `@tailwindcss/postcss`.

### CSS Variables

```css
:root {
  --background: #f1f5f9;   /* slate-100 — fondo general */
  --foreground: #0f172a;   /* slate-950 — texto principal */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
}
```

### Paleta de colores (`lib/constants.ts → COLORS`)

```typescript
{
  primary:      "#1d4ed8",  // blue-700   — acción principal
  primaryHover: "#1e40af",  // blue-800   — hover/active
  success:      "#15803d",  // green-700  — confirmaciones
  warning:      "#b45309",  // amber-700  — llaves
  danger:       "#b91c1c",  // red-700    — sin gafete, errores
  info:         "#0369a1",  // sky-700    — practicantes
  medical:      "#0e7490",  // cyan-700   — personal médico
  cleaning:     "#4338ca",  // indigo-700 — limpieza
  security:     "#7c3aed",  // violet-700 — seguridad
}
```

> Estas constantes están definidas pero **no se usan en los componentes**. Los componentes usan clases Tailwind directamente.

### Paleta efectiva en uso (clases Tailwind)

| Uso | Clase |
|---|---|
| Fondo de app | `bg-slate-100` |
| Cards / superficies | `bg-white` |
| Header | `bg-white border-b border-slate-200 shadow-sm` |
| StatusBar | `bg-slate-800 text-slate-300` |
| Acción primaria | `bg-blue-700` / `active:bg-blue-800` |
| Bordes default | `border-slate-200` |
| Texto principal | `text-slate-900` |
| Texto secundario | `text-slate-500` / `text-slate-400` |
| Error | `text-red-600` / `border-red-400` |
| Éxito | `text-emerald-600` / `bg-emerald-100` |
| Foco de input | `focus:border-blue-500 focus:ring-blue-500` |
| Salida | `bg-green-100 text-green-700` |
| Llaves | `bg-amber-100 text-amber-700` |
| Sin gafete | `bg-red-100 text-red-700` |
| Practicantes | `bg-sky-100 text-sky-700` |
| Médico | `bg-cyan-100 text-cyan-700` |
| Limpieza | `bg-indigo-100 text-indigo-700` |
| Seguridad | `bg-violet-100 text-violet-700` |

### Tipografía

| Elemento | Clase |
|---|---|
| Fuente global | Inter (Google Fonts, `next/font/google`) |
| Título sistema header | `text-2xl font-bold text-slate-900 tracking-tight` |
| Reloj en header | `text-4xl font-bold tabular-nums tracking-tighter` |
| Headings de sección | `text-xs font-semibold text-slate-500 uppercase tracking-widest` |
| Label PrimaryButton | `text-xl font-semibold tracking-tight` |
| Label SecondaryButton | `text-base font-semibold text-slate-800` |
| Labels de formulario | `text-sm font-semibold text-slate-700` |
| Texto de error | `text-sm text-red-600 font-medium` |
| Monospace (reloj status) | `font-mono text-xs` |

### Espaciado

Basado en escala de 4px de Tailwind:
- Padding de páginas: `px-6 py-5` (main), `px-6 py-4` (header)
- Gap entre secciones: `gap-5`
- Gap entre botones grilla: `gap-3`
- Radius: `rounded-2xl` (cards, inputs), `rounded-xl` (botones), `rounded-3xl` (modales)

### Filosofía visual

**Kiosco industrial / SaaS de campo.** Touch-first, limpio, funcional:
- Fondo `slate-100`, cards blancas.
- Botones grandes (`min-h-[80px]`).
- Micro-animaciones táctiles: `active:scale-[0.97/0.98]`, `transition-all duration-150`.
- `select-none touch-manipulation` en todos los elementos interactivos.
- `rounded-2xl/3xl` — moderno sin ser excesivo.
- Azul como acción principal, colores semánticos por categoría.
- Sin imágenes decorativas — solo iconos lucide-react.

### Responsive

**No hay diseño responsive.** Pantalla fija (kiosco). Sin breakpoints ni `sm:`, `md:`, `lg:`.

La única media query es `@media print` para el gafete.

### Media Query de Impresión

```css
@media print {
  @page { margin: 0; size: 56mm 85.6mm; }
  body * { visibility: hidden; }
  #gafete-print {
    visibility: visible;
    position: fixed;
    top: 0; left: 0;
    width: 56mm; height: 85.6mm;
  }
  #gafete-print .badge-inner {
    width: 56mm !important;
    height: 85.6mm !important;
    border: none !important;
    border-radius: 0 !important;
  }
}
```

---

## 9. Constantes globales

**Archivo:** `lib/constants.ts`

```typescript
SYSTEM_NAME    = "CODA"           // Nombre en header
COMPANY_NAME   = "Demo Techinic"  // En StatusBar
SYSTEM_VERSION = "v1.0.0"         // Badge de versión en StatusBar

COLORS = { ... }  // Colores semánticos (definidos, no usados en componentes actualmente)

ROUTES = {
  home:           "/",
  nuevoVisitante: "/visitante/nuevo",
  salida:         "/salida",
  llaves:         "/llaves",
  sinGafete:      "/sin-gafete",
  practicantes:   "/practicantes",
  personalMedico: "/personal/medico",
  limpieza:       "/personal/limpieza",
  seguridad:      "/personal/seguridad",
} as const
```

**Regla:** Siempre usar `ROUTES.xxx`. Nunca strings literales de rutas.

---

## 10. Funcionalidades principales

### F1 — Registro de nuevo visitante (`/visitante/nuevo`)

1. Formulario 5 campos (empresa, nombre, visita a, motivo, identificación).
2. Validación on-blur y on-submit.
3. Folio = `Date.now().toString().slice(-5)`.
4. Overlay con `<GafeteVisitante>` + botón imprimir.
5. `window.print()` → setTimeout(1000ms) → home. O "Omitir" → home.

Sin persistencia.

### F2 — Registro de salida (`/salida`)

1. Input de folio en modal.
2. Busca en `MOCK_VISITAS` (folios hardcodeados `00142`, `00143`).
3. Encontrado → estado "confirmar". No encontrado → error.
4. Confirmar → éxito animado → auto-redirección 2.5s.

### F3 — Control de llaves (`/llaves` & `/admin/llaves`)

1. **Personas autorizadas para solicitar llaves:**
   - Provienen exclusivamente del catálogo de **`VisitHost`** (personal autorizado importado en base de datos).
   - Más la opción especial **`Limpieza`** (`CLEANING`) que no requiere nombres individuales ni crea personas ficticias.
   - Si una persona no está en `VisitHost` o está inactiva (`active = false`), no puede solicitar llaves.
2. **Flujo en el Kiosco:**
   - Botón "Tomar" → Abre modal `<KeyRequesterPicker>` con buscador server-side y debounce.
   - Opción destacada fija: `🧹 Limpieza`.
   - Confirmación explícita con nombre del solicitante y nombre de la llave.
   - Devolución con confirmación y cálculo de duración en tiempo real.
3. **Persistencia y Auditoría:**
   - Modelo `KeyAssignment` con `visitHostId` (nullable), `requesterType` (`PERSON` / `CLEANING`), `requesterLabel`, `takenAt` y `returnedAt`.
   - Registro histórico en `/admin/llaves/registro` con filtros por estado, fecha, solicitante (Todos / Personas / Limpieza) y buscador inteligente.


### F4 — Personal interno y accesos especiales

Sin-gafete, practicantes, médico, limpieza, seguridad — flujo idéntico:
1. `<RegistroGeneralModal>` sobre home deshabilitado.
2. Nombre completo + Entrada/Salida.
3. Confirmar → Toast 2.5s → home.

---

## 11. Estado de datos — Sin backend real

> **CRÍTICO:** No hay backend, API ni base de datos. Datos efímeros en memoria. Al recargar se pierden.

| Dato | Tipo | Ubicación |
|---|---|---|
| Visitas activas | Mock hardcodeado | `app/salida/page.tsx → MOCK_VISITAS` |
| Llaves | useState local | `app/llaves/page.tsx` |
| Formulario visitante | useState local | `app/visitante/nuevo/page.tsx` |
| Registros de personal | No persistido | `console.log` en modal (línea 113) |

Los `console.log` en `RegistroGeneralModal.tsx` (línea 113) y `salida/page.tsx` (línea 130) indican los puntos donde debe conectarse un backend.

---

## 12. Autenticación y seguridad

**No existe autenticación.** Todas las rutas son públicas.

No hay: JWT, cookies de sesión, middleware de auth, roles/permisos, protección de rutas, rate limiting.

El control de acceso al sistema es físico/operativo (quién tiene acceso al dispositivo kiosco).

---

## 13. Sistema de impresión de gafetes (Brother QL-810W)

CODA utiliza una impresora térmica **Brother QL-810W** para la emisión física de gafetes de visitantes.

> **IMPORTANTE:** La impresora oficial es **Brother QL-810W**. No se utiliza Zebra ni ZPL.

### Dimensiones físicas y resolución
- **Ancho:** 53.0 mm ($\approx 626\text{ dots}$ a 300 DPI)
- **Alto:** 84.5 mm ($\approx 998\text{ dots}$ a 300 DPI)
- **Orientación:** Vertical / Portrait directo
- **Resolución:** 300 DPI estándar
- **Color:** Monocromático binario estricto: **#000000** (Negro) y **#FFFFFF** (Blanco)

### Módulos de Impresión (`lib/printing/brother/`)
- **`visitorBadge.ts`:** Generador del flujo de comandos binarios oficiales **Brother QL Raster (ESC/P Raster Mode)**:
  - Inicialización limpia con 200 bytes nulos + `ESC @` + `ESC i a 1`.
  - Configuración de medios continuos / troquelados (`ESC i z`).
  - Renderizado de 998 líneas raster de 90 bytes (720 pines).
  - Comando de corte automático (`ESC i M`) y finalización (`0x1A`).
- **`printer.ts`:** Métodos de transporte:
  1. **Controlador Nativo Kiosco:** Vía diálogo de impresión con estilos calibrados a 53 × 84.5 mm portrait.
  2. **Socket TCP Wi-Fi (Puerto 9100):** Envío directo del buffer raster a la IP de la Brother en la red local mediante `/api/print/brother`.
  3. **Descarga de archivo `.PRN`:** Archivo binario con comandos raster para utilidades de Brother o cola de impresión.


---

## 14. Dependencias importantes

```
next@16.2.7
→ Framework principal. App Router.
→ ADVERTENCIA: V16 puede tener APIs distintas. Verificar node_modules/next/dist/docs/

react@19.2.4
→ Runtime de UI. V19 con concurrent features.

tailwindcss@^4
→ Sistema de estilos. V4 sin tailwind.config.js — config en globals.css.

@tailwindcss/postcss@^4
→ Plugin PostCSS para Tailwind v4.

lucide-react@^1.17.0
→ Todos los iconos de la interfaz. Importar por nombre.

qrcode.react@^4.2.0
→ QR en el gafete. Usar <QRCodeSVG>.

typescript@^5
→ Tipado estático. strict: true.

eslint-config-next@16.2.7
→ Reglas de lint de Next.js (core-web-vitals + typescript).
```

---

## 15. Variables de entorno

**No hay variables de entorno definidas.** No existe `.env`, `.env.local` ni `.env.example`.

El `.gitignore` excluye todos los `.env*`.

Not documented / cannot be determined from the codebase.

---

## 16. Cómo ejecutar el proyecto

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Levanta en **`http://localhost:4555`**.

### Build de producción

```bash
npm run build
```

### Producción

```bash
npm start
```

Levanta en **`http://localhost:4555`**.

### Build + Start en un solo comando

```bash
npm run serve
```

### Lint

```bash
npm run lint
```

### Verificación de tipos

```bash
npm run typecheck
```

### Tests

No hay tests configurados.

---

## 17. Convenciones de código

### Naming

| Elemento | Convención |
|---|---|
| Componentes React | PascalCase (`GafeteVisitante`, `StatusBar`) |
| Páginas Next.js | `page.tsx` en su directorio |
| Archivos de componentes | PascalCase.tsx |
| Interfaces | PascalCase (`FormData`, `FormErrors`, `Llave`) |
| Constantes globales | UPPER_SNAKE_CASE (`SYSTEM_NAME`, `ROUTES`) |
| Variables locales | camelCase |
| Funciones handler | `handle` + acción (`handleRegistrar`, `handleConfirmar`) |
| Funciones utilitarias | camelCase descriptivo (`isValidFullName`, `tiempoTranscurrido`) |
| Hooks locales | `use` + descripción (`useClock`) |

### Organización de componentes

- Cada componente en su propio archivo.
- Interfaces del componente en el mismo archivo.
- Constantes de estilos Tailwind como `const` al inicio del archivo.
- Sub-componentes auxiliares (`ErrorMsg`, `DataRow`, `Toast`, `LlaveCard`) al final del mismo archivo.

### TypeScript

- `strict: true` en tsconfig.
- Interfaces explícitas para props y estado.
- `as const` para objetos de constantes.
- `type` para tipos simples (`type ModalState = 'buscar' | 'confirmar' | 'exito'`).

### Patrón de formularios (canónico)

```typescript
// Estado
const [form, setForm] = useState<FormData>({...});
const [errors, setErrors] = useState<FormErrors>({});
const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

// Handlers
const handleChange = (field, value) => { ... valida si ya fue tocado }
const handleBlur = (field) => { marca como tocado + valida }
const handleSubmit = () => { marca todos tocados + valida + procede si OK }

// Estilos condicionales
className={touched.field && errors.field ? inputError : inputNormal}
```

### Manejo de errores

- Formulario: objetos `FormErrors` parciales, inline.
- Búsqueda: estado local `string | null`.
- Sin ErrorBoundary global. Sin toast de error global.

### Imports

- Path alias `@/*` → root del proyecto.
- Usar `@/components/...`, `@/lib/...`. Nunca rutas relativas.

### Estilos

- Clases Tailwind inline en JSX.
- Strings complejos reutilizados → constante `const inputBase = '...'`.
- Sin CSS Modules, styled-components ni emotion.

### `'use client'`

Todas las páginas son Client Components. Solo `layout.tsx` es Server Component (sin directiva).

---

## 18. Decisiones arquitectónicas

### Sin backend

Proyecto en fase de **prototipo/MVP**. Los datos mock y `console.log` en lugar de API calls indican backend pendiente.

### Patrón de modal sobre home deshabilitado

Decisión de UX para: dar contexto visual al operador, reusar layout del home, hacer evidente el regreso al home al cerrar.

### `useClock` duplicado

No fue extraído a un hook compartido. **Código duplicado** candidato a `lib/hooks/useClock.ts`.

### Estilos de inputs duplicados

`inputBase/Normal/Error` duplicados en `visitante/nuevo/page.tsx` y `RegistroGeneralModal.tsx`. Razón no documentada. Candidatos a `lib/styles.ts` o componente `<FormInput>`.

### Tailwind v4 sin `tailwind.config.js`

Arquitectura oficial de Tailwind v4. Config de tema en CSS con `@theme inline {}`.

### Puerto 4555

Hardcodeado en scripts. Razón no documentada en el código.

### `safe_visitor_main_redesign.html`

Prototipo HTML estático de referencia visual. No parte del build. No modificar como código de la app.

### Folio de visitante

`String(Date.now()).slice(-5)`. No garantiza unicidad en producción. En producción debería venir del backend.

---

## 19. Mapa mental del proyecto

```
OPERADOR (toca pantalla del kiosco)
          ↓
    app/page.tsx (Home)
          ↓ (navega por Link / router.push usando ROUTES)
          ↓
  ┌──────────────────────────────────────────────────────┐
  │                    Módulos de la app                  │
  ├───────────────┬─────────────────┬────────────────────┤
  │  VISITANTES   │   OPERACIONES   │  PERSONAL INTERNO  │
  │               │                 │                    │
  │ /visitante/   │  /salida        │ /personal/medico   │
  │  nuevo        │  (modal sobre   │ /personal/limpieza │
  │  (formulario  │  home, estados: │ /personal/seguridad│
  │  + gafete     │  buscar/        │ /practicantes      │
  │  imprimible)  │  confirmar/     │ /sin-gafete        │
  │               │  exito)         │                    │
  │               │                 │ (todos usan        │
  │               │  /llaves        │  RegistroGeneral   │
  │               │  (panel con     │  Modal)            │
  │               │  estado local)  │                    │
  └───────────────┴─────────────────┴────────────────────┘
          ↓
    Estado local React (useState por página)
          ↓
    console.log (punto de integración futura con backend)
          ↓
    [Sin persistencia — datos en memoria]
```

### Flujo de registro de visitante

```
Formulario (5 campos)
       ↓
Validación (touched + errors pattern)
       ↓
handleRegistrar() → validateForm() → createVisitor() en DB
       ↓
Generación de Folio y persistencia
       ↓
Overlay con <GafeteVisitante> (Preview 53 × 84.5 mm Portrait, B&W)
       ↓
Impresión Brother QL-810W (Controlador / Wi-Fi TCP 9100 / Descarga .PRN)
       ↓
Finalizar → router.push(ROUTES.home)
```

---

## 20. AI AGENT CONTEXT

### Antes de modificar el proyecto

1. **Lee este README completo.** Representa el estado actual del código.
2. **Lee `AGENTS.md`** en la raíz (reglas específicas de Next.js v16).
3. **Identifica el módulo** usando la tabla de rutas (sección 5).
4. **No introduzcas nuevos patrones** si ya existe uno:
   - Formulario con validación → patrón `touched + errors`.
   - Registro de personal → `RegistroGeneralModal`.
   - Navegación → `ROUTES` de `lib/constants.ts`.
   - Botones del home → `PrimaryButton`, `SecondaryButton`, `StaffButton`.
5. **No crees hooks globales** sin verificar si el código duplicado es intencional.
6. **Preserva el lenguaje visual:** fondo `slate-100`, cards blancas, azul `blue-700` primario, `rounded-2xl` para cards.
7. **No modifiques `globals.css`** para estilos de componentes específicos — usa Tailwind inline.
8. **No expongas datos reales** ni secretos.
9. **Si agregas una ruta nueva**, agrégala a `ROUTES` en `lib/constants.ts`.
10. **Ejecuta `npm run typecheck`** tras modificar TypeScript.
11. **Ejecuta `npm run lint`** para verificar lint.

### Where to look

```
Pantalla principal / navegación
→ app/page.tsx
→ lib/constants.ts (ROUTES)
→ components/ui/PrimaryButton.tsx
→ components/ui/SecondaryButton.tsx
→ components/ui/StaffButton.tsx

Registro de visitante
→ app/visitante/nuevo/page.tsx
→ components/GafeteVisitante.tsx

Registro de salida
→ app/salida/page.tsx

Control de llaves
→ app/llaves/page.tsx

Personal interno (médico, limpieza, seguridad, practicantes, sin gafete)
→ app/personal/medico/page.tsx
→ app/personal/limpieza/page.tsx
→ app/personal/seguridad/page.tsx
→ app/practicantes/page.tsx
→ app/sin-gafete/page.tsx
→ components/modals/RegistroGeneralModal.tsx

Barra de estado inferior
→ components/ui/StatusBar.tsx

Estilos globales / impresión / tokens CSS
→ app/globals.css

Constantes (nombre, versión, rutas, colores)
→ lib/constants.ts

Layout raíz y fuente
→ app/layout.tsx

Config de Next.js
→ next.config.ts (actualmente vacía)

Config TypeScript
→ tsconfig.json

Reglas de linting
→ eslint.config.mjs
```

### Do not modify

| Archivo | Razón |
|---|---|
| `package-lock.json` | Generado por npm. Nunca editar manualmente. |
| `.next/` | Build generado. En `.gitignore`. |
| `next-env.d.ts` | Generado por Next.js. En `.gitignore`. |
| `safe_visitor_main_redesign.html` | Prototipo de referencia. No es código de la app. |
| `AGENTS.md` | Reglas del agente. Modificar solo si el usuario lo pide explícitamente. |

### Important dependencies (alto impacto)

| Módulo | Impacto |
|---|---|
| `lib/constants.ts` | Rutas, nombres y colores en TODA la app. |
| `app/globals.css` | Estilos globales + comportamiento de impresión de gafetes. |
| `app/layout.tsx` | Fuente, metadatos y HTML base de TODAS las páginas. |
| `components/modals/RegistroGeneralModal.tsx` | Usado por 5 páginas distintas. |
| `components/ui/StatusBar.tsx` | Presente en TODAS las páginas. |
| `components/GafeteVisitante.tsx` | ID `gafete-print` acoplado con `globals.css`. No cambiar el ID sin actualizar el CSS. |

---

## 21. Catálogo VisitHost — "A quién visita"

### Modelo de datos

El modelo `VisitHost` en `prisma/schema.prisma` representa a las personas que pueden recibir visitas:

```prisma
model VisitHost {
  id             String    @id @default(cuid())
  employeeNumber String    @unique @map("employee_number")  // num_empleado — clave de upsert
  fullName       String    @map("full_name")                // nombre_empleado
  department     String                                      // departamento
  position       String                                      // puesto
  active         Boolean   @default(true)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  visitors       Visitor[]
}
```

`employeeNumber` es la clave única de upsert. El catálogo se importa desde `admins_entrada.csv`.

### Relación Visitor → VisitHost

```
Visitor.visitHostId  (FK opcional)
         │
         ▼
      VisitHost.id
```

Además, `Visitor.visitTo` almacena el nombre completo del anfitrión al momento del registro (snapshot). Esto garantiza que los datos históricos muestren correctamente el nombre aunque el `VisitHost` sea editado o desactivado.

### Importación desde CSV

El catálogo de anfitriones se carga desde `admins_entrada.csv` (en la raíz del proyecto, excluido de git):

```
num_empleado → employeeNumber
nombre_empleado → fullName
departamento → department
puesto → position
```

**Comando de importación:**

```bash
npm run db:import-visit-hosts
```

El script `prisma/import-visit-hosts.ts`:
- Valida encabezados del CSV
- Ignora filas vacías
- Detecta duplicados de `num_empleado` en el CSV
- Hace `upsert` usando `employeeNumber` como clave
- Mantiene `active = true`
- Reporta: creados / actualizados / errores
- **No elimina registros existentes**

**Para actualizar el catálogo** con un CSV nuevo:
1. Reemplaza `admins_entrada.csv` en la raíz
2. Ejecuta `npm run db:import-visit-hosts`
3. Los registros existentes se actualizan; los nuevos se crean; los no presentes en el CSV permanecen sin cambios

### Popup de búsqueda server-side

El campo "A quién visita" en el formulario de nuevo visitante usa el componente `components/ui/VisitHostPicker.tsx`.

**Flujo:**
1. Recepción hace clic en "Seleccionar persona"
2. Se abre un modal con un campo de búsqueda
3. Al escribir (debounce 300ms) se llama a la Server Action `searchVisitHosts(query)` en `app/actions/visitors.ts`
4. PostgreSQL busca coincidencias en `full_name`, `department`, `position`, `employee_number` (case-insensitive)
5. Se muestran hasta 20 resultados con nombre, puesto, departamento y número de empleado
6. Al seleccionar, el modal se cierra y el formulario guarda el `visitHostId`

**No se cargan los 80+ registros al cliente.** La búsqueda es siempre server-side.

### Administración de Personas a Visitar (`/admin/personas-a-visitar`)

Disponible en el menú lateral del Dashboard Administrativo bajo la pestaña **"Personas a visitar"**:

- **Lectura directa desde PostgreSQL:** Consulta la tabla `visit_hosts` mediante Server Actions (`app/actions/visitHosts.ts`).
- **Pestañas de estado:** Filtro rápido por `Activos` (por defecto), `Inactivos` o `Todos`.
- **Buscador server-side:** Búsqueda en tiempo real por nombre, número de empleado, departamento o puesto.
- **Edición y creación:** Modales para dar de alta nuevas personas a visitar o modificar número de empleado, nombre completo, departamento y puesto.
- **Desactivación / Reactivación (Soft Delete):**
  - Al desactivar un anfitrión (`active = false`), deja de aparecer inmediatamente en el popup de visitas del kiosco.
  - El anfitrión permanece en la base de datos y se muestra en la pestaña de `Inactivos` del panel.
  - Los visitantes históricos que apuntan a ese `visit_host_id` mantienen su relación e historial intactos.
  - Puede reactivarse en cualquier momento con un solo clic.
- **Auditoría:** Cada creación, edición o cambio de estado registra un evento en la tabla `audit_logs`.

---

## 22. Control de Llaves (`Key` y `KeyAssignment`)

### Modelo de datos

El control de llaves cuenta con dos entidades persistidas en PostgreSQL:

```prisma
enum KeyStatus {
  AVAILABLE
  OCCUPIED
  INACTIVE
}

model Key {
  id          String          @id @default(cuid())
  name        String          @unique
  status      KeyStatus       @default(AVAILABLE)
  active      Boolean         @default(true)
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  assignments KeyAssignment[]

  @@map("keys")
}

model KeyAssignment {
  id         String    @id @default(cuid())
  keyId      String    @map("key_id")
  personId   String    @map("person_id")
  takenAt    DateTime  @default(now()) @map("taken_at")
  returnedAt DateTime? @map("returned_at")
  createdAt  DateTime  @default(now()) @map("created_at")

  key        Key       @relation(fields: [keyId], references: [id])
  person     Person    @relation(fields: [personId], references: [id])

  @@map("key_assignments")
}
```

### Relación con el personal (`Person`)

```
Person (id) ────1:N────► KeyAssignment (person_id) ◄────N:1──── Key (id)
```

Quien toma una llave debe ser una persona registrada y activa en el catálogo general de `Person` (Seguridad, Limpieza, Médico, Practicantes).

### Flujo en el Kiosco (`/llaves`)

1. **Tomar llave disponible:**
   - Clic en "Tomar" abre el modal "¿Quién toma la llave?".
   - Selector interactivo/combobox de personas activas desde `Person`.
   - Al confirmar: se crea un `KeyAssignment` con `taken_at = now()` y `returned_at = null`, y la llave cambia a `OCCUPIED`.
2. **Devolver llave ocupada:**
   - La tarjeta muestra quién tiene la llave y el tiempo transcurrido (`hace Xm`).
   - Clic en "Devolver" muestra modal de confirmación.
   - Al confirmar: se actualiza `returnedAt = now()` en el `KeyAssignment` activo y la llave vuelve a `AVAILABLE`.
3. **Persistencia e historial:**
   - Al devolver una llave **nunca se borra el registro**, preservando todo el historial de préstamos.

### Administración de Llaves en el Panel

El menú lateral del Dashboard Administrativo cuenta con dos secciones dedicadas:

#### 1. Catálogo de Llaves (`/admin/llaves`)
- **Métricas:** Conteo en tiempo real de llaves `Disponibles`, `En uso`, `Inactivas` y `Total`.
- **Gestión de Llaves:**
  - Ver disponibilidad y quién tiene cada llave en tiempo real.
  - Agregar nuevas llaves al catálogo.
  - Editar nombre de llave existente.
  - Desactivar/activar llaves (`active = false` / `true`).
  - Acceso directo a la pantalla de historial de registros.

#### 2. Registro de Llaves (`/admin/llaves/registro`)
- **Sección independiente en el sidebar:** Historial de préstamos accesible tanto para `ADMIN` como para `SUPERADMIN`.
- **Buscador principal server-side:** Búsqueda rápida por nombre de persona, número de empleado o nombre de la llave.
- **Barra de filtros combinables:**
  - Filtro por llave específica o todas las llaves.
  - Filtro por estado: `Todos`, `En uso` (con indicador pulsante), `Devuelta`.
  - Filtro por fecha: `Histórico`, `Hoy`, `Ayer`, `Esta semana`, `Este mes`, `Personalizado` (desde/hasta).
- **Paginación Server-Side:** Navegación por páginas (`page`, `pageSize`, conteo total) para garantizar escalabilidad a miles de registros.
- **Duración en tiempo real:** Cálculo dinámico de la duración de préstamo (`returned_at - taken_at` para devueltas, `ahora - taken_at` para llaves actualmente en uso).
- **Auditoría:** Cada operación administrativa (`CREATE_KEY`, `UPDATE_KEY`, `ACTIVATE_KEY`, `DEACTIVATE_KEY`) y operativa (`TAKE_KEY`, `RETURN_KEY`) genera un log en `audit_logs`.

### Llaves Iniciales (Seed)

El seed (`npm run db:seed`) inicializa las 6 llaves por defecto:
1. `Sala Agave`
2. `Sala Mezquite`
3. `Sala Sotol`
4. `Sala Aant`
5. `Sala Asakao`
6. `Enfermería`

### Known issues / technical debt

1. **`useClock` duplicado:** Copiado en 5+ archivos. Candidato a `lib/hooks/useClock.ts`.
2. **`inputBase/Normal/Error` duplicados:** En `visitante/nuevo/page.tsx` y `RegistroGeneralModal.tsx`. Candidatos a `lib/styles.ts` o `<FormInput>`.
3. **Bug línea 220 de `RegistroGeneralModal.tsx`:** `(showToast || true)` siempre es `true`. Toast se renderiza siempre que `tipo !== null`.
4. **Páginas de personal duplicadas:** Las 5 páginas son prácticamente idénticas. Candidatas a rutas dinámicas.


