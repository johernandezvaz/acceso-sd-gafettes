Quiero que implementes una nueva sección completa de **Administración para CODA**, utilizando como fuente primaria de contexto el `README.md` existente y el código actual del proyecto.

## CONTEXTO IMPORTANTE

Antes de comenzar:

1. Lee COMPLETAMENTE `README.md`.
2. Lee `AGENTS.md`.
3. Analiza el código actual relacionado con:

   * visitantes
   * practicantes
   * personal médico
   * personal de limpieza
   * personal de seguridad
   * `RegistroGeneralModal`
   * `lib/constants.ts`
   * `globals.css`
4. Comprende cómo funciona actualmente el registro de entradas y salidas.
5. Respeta las convenciones arquitectónicas y visuales existentes.

El README indica que actualmente CODA es un frontend-only, sin backend, API ni base de datos, y que los datos se almacenan únicamente en memoria mediante `useState`. Esto es importante porque la nueva funcionalidad requiere persistencia real. No intentes resolver el dashboard utilizando únicamente mocks o `localStorage`.

---

# OBJETIVO

Necesitamos convertir CODA en un sistema donde exista una separación clara entre:

### 1. Aplicación principal / Kiosco

Es la interfaz que utiliza recepción/seguridad para registrar accesos.

Debe seguir siendo extremadamente sencilla y touch-first.

### 2. Dashboard administrativo

Es una interfaz independiente para administradores donde puedan:

* Administrar personas.
* Consultar entradas y salidas.
* Consultar visitantes.
* Filtrar registros.
* Ver información histórica.
* Administrar los diferentes tipos de personal.

El dashboard administrativo NO debe aparecer visualmente dentro del kiosco principal.

---

# 1. SEPARACIÓN ENTRE KIOSCO Y ADMINISTRACIÓN

Crea una sección administrativa independiente.

Por ejemplo:

```text
/admin
/admin/login
/admin/dashboard
```

La estructura exacta puede adaptarse a la arquitectura existente, pero debe existir una separación clara.

## IMPORTANTE

El login administrativo:

* NO debe aparecer como botón en el home del kiosco.
* NO debe aparecer en ninguna pantalla del flujo normal de registro.
* NO debe ser accesible mediante un link visible dentro del kiosco.
* Debe existir como una ruta independiente.
* Debe proteger todas las rutas administrativas.

Un usuario que solamente utiliza el kiosco no debería saber, mediante la interfaz normal, que existe el panel administrativo.

No agregues:

```text
"Administración"
"Admin"
"Dashboard"
"Login"
```

al menú principal del kiosco.

La existencia del panel administrativo debe ser independiente.

---

# 2. AUTENTICACIÓN ADMINISTRATIVA

Actualmente el proyecto no tiene autenticación.

Necesitamos agregar autenticación real para el dashboard.

Implementa una solución apropiada para Next.js 16 y la arquitectura actual.

El resultado debe permitir:

```text
/admin/login
        ↓
autenticación
        ↓
/admin/dashboard
```

Y:

```text
usuario no autenticado
        ↓
/admin/*
        ↓
/admin/login
```

El usuario autenticado debe mantenerse autenticado al navegar entre las páginas administrativas.

NO implementes una protección falsa basada únicamente en:

```typescript
useState()
localStorage
sessionStorage
```

La autenticación debe proteger realmente las rutas administrativas.

No hardcodees passwords dentro del código fuente.

Utiliza variables de entorno o el mecanismo seguro apropiado para las credenciales.

---

# 3.1 BASE DE DATOS REAL — FUENTE ÚNICA DE VERDAD

Toda la información de CODA debe almacenarse en una **base de datos real**.

La conexión a la base de datos estará definida mediante una variable de entorno en `.env`.

Por ejemplo:

```env
DATABASE_URL="..."
```

**NO escribas la URL real de la base de datos en el código ni en el README.**

La aplicación debe obtener la conexión exclusivamente desde las variables de entorno.

---

## CREAR LAS TABLAS NECESARIAS

Actualmente el proyecto no tiene una base de datos implementada.

Por lo tanto, debes:

1. Identificar qué motor de base de datos corresponde a `DATABASE_URL`.
2. Elegir e implementar una capa de acceso a datos/ORM apropiada para el proyecto.
3. Crear las tablas necesarias.
4. Crear las relaciones entre tablas.
5. Crear los índices necesarios para las consultas principales.
6. Crear las migraciones correspondientes.
7. Ejecutar/verificar las migraciones contra la base de datos.
8. Conectar la aplicación a estas tablas.
9. Eliminar la dependencia de los datos mock donde corresponda.

No quiero solamente que definas interfaces TypeScript.

**Las entidades deben existir físicamente en la base de datos.**

---

# MODELO DE DATOS

Antes de implementar las pantallas, analiza y diseña las entidades necesarias.

Como mínimo, el sistema debe contemplar entidades equivalentes a:

```text
AdminUser
PersonType
Person
AccessRecord
Visitor
VisitorAccessRecord
```

La implementación concreta puede tener nombres diferentes si existe una mejor decisión arquitectónica.

---

## PERSON TYPES

Debe existir una tabla para los tipos de personal.

Ejemplo:

```text
person_types
-------------
id
name
slug
description
active
created_at
updated_at
```

Debe permitir almacenar:

```text
Practicantes
Seguridad
Limpieza
Médico
```

No hardcodees estos tipos dentro de los componentes del frontend.

La aplicación debe obtenerlos desde la base de datos o desde una capa de dominio centralizada alimentada por la base de datos.

La estructura debe permitir agregar posteriormente categorías como:

```text
Administrativo
Mantenimiento
Recursos Humanos
Dirección
Contratistas
etc.
```

sin modificar múltiples páginas del frontend.

---

# PERSONAS

Debe existir una entidad para las personas que pueden registrar entradas y salidas.

Conceptualmente:

```text
persons
-------------
id
full_name
person_type_id
active
created_at
updated_at
```

Relación:

```text
PersonType
    1
    │
    │
    N
Person
```

Una persona pertenece a un tipo de personal.

Una persona desactivada NO debe eliminarse físicamente si tiene historial.

Debe poder conservar sus registros históricos.

---

# REGISTROS DE ACCESO

Debe existir una tabla para registrar los movimientos de entrada y salida.

Conceptualmente:

```text
access_records
-------------
id
person_id
movement
timestamp
created_at
```

Donde:

```text
movement:
- ENTRY
- EXIT
```

o la nomenclatura equivalente que adoptes.

Relación:

```text
Person
   1
   │
   │
   N
AccessRecord
```

Cada registro debe conservar exactamente cuándo ocurrió el movimiento.

No dependas de la hora del frontend como fuente de verdad si puedes obtenerla de forma confiable desde el servidor/base de datos.

---

# ENTRADA / SALIDA

No almacenes simplemente:

```text
entrada = true
```

Necesitamos conservar el historial de movimientos.

Ejemplo:

```text
Juan Pérez
    ↓
2026-08-14 07:58 ENTRY
    ↓
2026-08-14 16:03 EXIT
```

Esto permite reconstruir posteriormente:

* Hora de entrada.
* Hora de salida.
* Personas actualmente dentro.
* Historial.
* Duración de estancia.
* Estadísticas.

---

# VISITANTES

Los visitantes deben tener su propia entidad.

Conceptualmente:

```text
visitors
-------------
id
folio
full_name
company
visit_to
reason
identification_type
created_at
```

Los datos deben corresponder al formulario actual de visitantes.

Actualmente el formulario solicita:

* Empresa.
* Nombre completo.
* A quién visita.
* Motivo.
* Tipo de identificación.

Estos datos deben persistirse.

---

# ACCESO DE VISITANTES

No mezcles los registros de visitantes con las personas internas.

Los visitantes son una entidad diferente.

Puedes implementar una estructura equivalente a:

```text
visitor_access_records
-------------
id
visitor_id
movement
timestamp
created_at
```

Relación:

```text
Visitor
   1
   │
   │
   N
VisitorAccessRecord
```

Esto permite conservar:

```text
Visitante
   ↓
ENTRY 08:15
   ↓
EXIT 14:32
```

y consultar posteriormente:

* Entrada.
* Salida.
* Visitantes actualmente dentro.
* Historial de visitantes.

Si consideras que una estructura diferente es más apropiada, puedes utilizarla, pero debe conservar la separación conceptual entre visitantes y personal interno.

---

# USUARIOS ADMINISTRATIVOS

Debe existir una entidad para los usuarios que pueden acceder al dashboard.

Conceptualmente:

```text
admin_users
-------------
id
email
password_hash
active
created_at
updated_at
```

Las contraseñas deben almacenarse únicamente mediante hashes seguros.

**Nunca almacenes passwords en texto plano.**

No hardcodees usuarios ni contraseñas en TypeScript.

---

# RELACIONES

La arquitectura final debe tener relaciones claras.

Conceptualmente:

```text
┌──────────────────┐
│   PersonType     │
├──────────────────┤
│ id               │
│ name             │
│ slug             │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐
│      Person      │
├──────────────────┤
│ id               │
│ full_name        │
│ person_type_id   │
│ active           │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐
│  AccessRecord    │
├──────────────────┤
│ id               │
│ person_id        │
│ movement         │
│ timestamp        │
└──────────────────┘


┌──────────────────┐
│     Visitor      │
├──────────────────┤
│ id               │
│ folio            │
│ full_name        │
│ company          │
│ visit_to         │
│ reason           │
│ identification   │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼──────────────┐
│ VisitorAccessRecord   │
├───────────────────────┤
│ id                    │
│ visitor_id            │
│ movement              │
│ timestamp             │
└───────────────────────┘


┌──────────────────┐
│    AdminUser     │
├──────────────────┤
│ id               │
│ email            │
│ password_hash    │
│ active            │
└──────────────────┘
```

Este diagrama es conceptual. Ajusta los nombres y relaciones según la solución final.

---

# MIGRACIONES

No crees tablas manualmente únicamente ejecutando SQL directamente sobre la base de datos sin dejar una migración reproducible.

Debe existir un mecanismo para que otro desarrollador pueda ejecutar:

```bash
npm run db:migrate
```

o el comando equivalente correspondiente al ORM elegido.

El esquema de la base de datos debe poder reconstruirse desde el repositorio.

Las migraciones deben formar parte del proyecto y quedar versionadas.

---

# SEED / DATOS INICIALES

Si es necesario, crea un mecanismo de seed para datos iniciales.

Por ejemplo:

```text
Person Types
├── Practicantes
├── Seguridad
├── Limpieza
└── Médico
```

Pero:

* No insertes datos personales ficticios que puedan confundirse con datos reales.
* No crees usuarios administrativos con passwords inseguros.
* Si necesitas un administrador inicial, documenta claramente cómo configurarlo mediante variables de entorno o un proceso de inicialización seguro.

---

# ÍNDICES

Analiza las consultas que necesitará el dashboard y crea índices apropiados.

Especialmente para:

```text
access_records.timestamp
access_records.person_id
access_records.movement

visitors.folio
visitors.created_at

visitor_access_records.timestamp
visitor_access_records.visitor_id

persons.person_type_id
persons.active
```

No crees índices indiscriminadamente.

Solo los que tengan sentido para las consultas reales.

---

# FILTROS Y BASE DE DATOS

Los filtros del dashboard deben ejecutarse correctamente sobre la fuente de datos.

Por ejemplo:

```text
Seguridad
+
Esta semana
+
Entrada
```

no debería descargar todos los registros al navegador para después filtrarlos si la cantidad de datos puede crecer considerablemente.

La arquitectura debe permitir que los filtros se ejecuten en la capa de datos/backend mediante consultas apropiadas.

Especialmente:

* Día.
* Semana.
* Mes.
* Rango personalizado.
* Tipo de personal.
* Entrada/salida.
* Estado dentro/fuera.

---

# FUENTE ÚNICA DE VERDAD

La base de datos debe ser la **fuente única de verdad**.

No debe existir información crítica duplicada en:

* arrays hardcodeados;
* `useState` como almacenamiento permanente;
* `localStorage`;
* `sessionStorage`;
* constantes del frontend;
* mocks.

El frontend debe consultar la información persistida.

Por ejemplo:

```text
Kiosco
   ↓
API / Server Layer
   ↓
Database
```

y:

```text
Admin Dashboard
   ↓
API / Server Layer
   ↓
Database
```

Ambos deben consultar la misma información.

---

# IMPORTANTE: EXISTENCIA DE DATABASE_URL

Antes de implementar la conexión:

1. Busca `.env`.
2. Busca `.env.local`.
3. Busca `.env.example`.
4. Verifica si existe `DATABASE_URL`.
5. Identifica el motor de base de datos.
6. Revisa si ya existe alguna dependencia relacionada con DB.
7. Revisa si ya existe ORM, cliente SQL o esquema.

Si `DATABASE_URL` ya existe, úsala.

**No reemplaces ni sobrescribas su valor.**

Si no existe una variable adecuada, crea `.env.example` con:

```env
DATABASE_URL=
```

pero nunca agregues la URL real al repositorio.

---

# VERIFICACIÓN DE LA BASE DE DATOS

Después de crear las migraciones:

1. Ejecuta las migraciones.
2. Verifica que las tablas existan.
3. Verifica las foreign keys.
4. Verifica los índices.
5. Verifica que los inserts y queries funcionen.
6. Verifica que el CRUD de personas funcione.
7. Verifica que los registros de entrada/salida se persistan.
8. Verifica que los visitantes se persistan.
9. Verifica que los filtros consulten los datos reales.

No consideres terminada la funcionalidad si solamente compila el frontend.

---

# README

Actualiza el README para documentar:

* Motor de base de datos.
* ORM/capa de acceso.
* `DATABASE_URL`.
* Estructura de tablas.
* Relaciones.
* Migraciones.
* Seeds.
* Comandos de DB.
* Arquitectura de acceso a datos.
* Flujo Kiosco → API/Server → DB.
* Flujo Admin → API/Server → DB.
* Autenticación administrativa.
* Nuevas variables de entorno.

Nunca documentes la URL real de la base de datos.

---

# CRITERIO FINAL

Considera que la implementación NO está completa si:

* Los datos desaparecen al recargar.
* Los registros solamente existen en React state.
* Los visitantes siguen siendo mocks.
* Las personas siguen siendo hardcodeadas.
* Las entradas/salidas no llegan a la DB.
* El dashboard utiliza datos ficticios.
* Los filtros se ejecutan únicamente sobre datos mock.
* No existen migraciones.
* Las relaciones no están definidas.
* No se puede reconstruir el esquema de DB desde el repositorio.

El objetivo final es que:

```text
                 ┌──────────────────┐
                 │     CODA DB      │
                 │                  │
                 │ Personas         │
                 │ Tipos            │
                 │ Accesos          │
                 │ Visitantes       │
                 │ Admin Users      │
                 └────────▲─────────┘
                          │
                    API / SERVER
                     ▲          ▲
                     │          │
              ┌──────┴───┐  ┌───┴─────────┐
              │  KIOSCO  │  │    ADMIN    │
              │           │  │             │
              │ Entradas  │  │ Dashboard   │
              │ Salidas   │  │ Reportes    │
              │ Visitantes│  │ Personal    │
              └───────────┘  └─────────────┘
```

debe representar la arquitectura real implementada.

**La base de datos debe ser persistente, relacional y la fuente de verdad de todo el sistema.**


---

# 4. CATÁLOGO DE PERSONAL

El dashboard debe permitir administrar las personas que pueden registrar entradas y salidas.

Como mínimo deben existir estas categorías:

* Practicantes
* Seguridad
* Limpieza
* Personal médico

La arquitectura debe permitir agregar nuevas categorías posteriormente.

IMPORTANTE:

El usuario mencionó "empleados de seguridad" y "personal de seguridad". Trátalos como una sola categoría:

```text
Seguridad
```

No dupliques la categoría.

---

# 5. ALTA DE PERSONAL

Dentro del dashboard debe existir una sección para agregar personas.

Debe ser posible registrar una persona con al menos:

* Nombre.
* Apellido(s) / nombre completo.
* Tipo de personal.
* Estado activo/inactivo.

La arquitectura debe permitir agregar posteriormente otros campos sin tener que rehacer todo el sistema.

El formulario debe:

* Validar campos obligatorios.
* Mostrar errores claramente.
* Evitar duplicados cuando corresponda.
* Confirmar exitosamente la creación.
* Actualizar inmediatamente la lista.

---

# 6. EDICIÓN Y DESACTIVACIÓN

Además de crear personas, el administrador debe poder:

* Ver personas existentes.
* Editarlas.
* Desactivarlas.
* Reactivarlas si es necesario.

NO elimines físicamente personas si eso puede romper registros históricos.

Es preferible utilizar:

```text
active / inactive
```

para conservar el historial.

Por ejemplo:

```text
Juan Pérez
Seguridad
Activo
```

puede pasar a:

```text
Juan Pérez
Seguridad
Inactivo
```

pero sus registros históricos deben seguir existiendo.

---

# 7. CAMBIAR EL REGISTRO ACTUAL DE PERSONAL

Actualmente `RegistroGeneralModal` solicita que el usuario escriba manualmente su nombre completo. El README documenta que este componente es utilizado por las páginas de personal y que actualmente maneja `nombre completo + Entrada/Salida`.

Esto debe cambiar.

Ya NO queremos:

```text
Nombre completo:
[_____________________]
```

Queremos:

```text
Persona:
[ Seleccionar persona ▼ ]
```

utilizando un **Combobox / searchable select**.

---

# 8. COMBOBOX DE PERSONAL

El combobox debe:

* Mostrar únicamente personas activas.
* Permitir buscar por nombre.
* Mostrar nombre completo.
* Mostrar opcionalmente la categoría como información secundaria.
* Permitir selección táctil.
* Ser suficientemente grande para utilizarse en el kiosco.
* Mantener el estilo visual actual de CODA.

Ejemplo conceptual:

```text
┌─────────────────────────────────────┐
│ Seleccionar persona             ▼   │
└─────────────────────────────────────┘

Al abrir:

┌─────────────────────────────────────┐
│ Buscar persona...                   │
├─────────────────────────────────────┤
│ Juan Pérez                          │
│ Seguridad                           │
├─────────────────────────────────────┤
│ María González                      │
│ Limpieza                            │
├─────────────────────────────────────┤
│ Carlos Hernández                    │
│ Médico                              │
└─────────────────────────────────────┘
```

No debe existir la posibilidad de registrar una persona escribiendo manualmente un nombre que no existe en el catálogo.

---

# 9. CATEGORÍA DEL REGISTRO

Cuando una persona sea seleccionada, el sistema debe conocer su categoría automáticamente.

Ejemplo:

```text
Juan Pérez
→ Seguridad
```

El operador no debería tener que seleccionar nuevamente la categoría.

La categoría viene determinada por el registro de la persona.

---

# 10. ENTRADA Y SALIDA

Todo personal que utilice el sistema debe generar registros de entrada/salida.

Cada registro debe contener como mínimo:

```text
id
persona
tipo de personal
tipo de movimiento
fecha
hora
timestamp
```

Donde:

```text
tipo de movimiento:
- entrada
- salida
```

Debe utilizarse una fecha/hora real.

No uses valores hardcodeados.

---

# 11. HORA DE ENTRADA Y SALIDA

El dashboard debe permitir visualizar claramente:

```text
Hora de entrada
Hora de salida
```

Por ejemplo:

| Persona        | Tipo      | Entrada | Salida |
| -------------- | --------- | ------: | -----: |
| Juan Pérez     | Seguridad |   07:58 |  16:05 |
| María González | Limpieza  |   08:12 |  17:02 |
| Carlos López   | Médico    |   09:01 |      — |

Si una persona todavía está dentro:

```text
Entrada: 08:02
Salida: —
Estado: Dentro
```

Debe quedar claro visualmente.

---

# 12. REGISTRO DE VISITANTES

Necesitamos una sección completamente independiente dentro del dashboard para visitantes.

Por ejemplo:

```text
/admin/dashboard/visitantes
```

o mediante una pestaña:

```text
Dashboard
Personal
Visitantes
```

Esta sección debe permitir consultar los registros de visitantes.

El README indica que actualmente el formulario de visitantes solicita:

* Empresa
* Nombre completo
* A quién visita
* Motivo
* Tipo de identificación

y genera un folio y gafete.

El dashboard debe mostrar TODOS esos datos.

---

# 13. TABLA DE VISITANTES

La tabla debe mostrar información como:

| Folio | Visitante | Empresa | Visita a | Motivo | Identificación | Entrada | Salida |
| ----- | --------- | ------- | -------- | ------ | -------------- | ------- | ------ |

Debe ser posible abrir un registro para consultar información completa.

No simplifiques la información del visitante.

El administrador debe poder consultar todos los datos que originalmente fueron solicitados en el formulario.

---

# 14. DASHBOARD PRINCIPAL

El dashboard administrativo debe tener una interfaz profesional orientada a escritorio.

No debe parecer una copia exacta del kiosco.

El kiosco es:

```text
Touch-first
Simple
Grandes botones
Operación rápida
```

El dashboard debe ser:

```text
Desktop-first
Data-oriented
Tablas
Filtros
Métricas
Navegación lateral o superior
```

Mantén, sin embargo, la identidad visual de CODA:

* Inter.
* Slate.
* Azul `blue-700`.
* Cards blancas.
* Bordes `slate-200`.
* Colores semánticos.
* Border radius consistente.
* Iconos Lucide.
* Diseño limpio y profesional.

---

# 15. NAVEGACIÓN DEL DASHBOARD

Crea una navegación clara.

Como mínimo:

```text
Dashboard
Personal
  ├── Todos
  ├── Practicantes
  ├── Seguridad
  ├── Limpieza
  └── Médico

Registros
Visitantes
```

Puedes mejorar esta estructura si encuentras una arquitectura más adecuada.

---

# 16. PESTAÑAS POR TIPO DE PERSONAL

Necesitamos poder consultar cada tipo de entrada por separado.

Debe ser posible tener pestañas como:

```text
Todos
Practicantes
Seguridad
Limpieza
Médico
```

Estas pestañas deben filtrar los registros.

Ejemplo:

```text
┌────────┬──────────────┬───────────┬──────────┬─────────┐
│ Todos  │ Practicantes │ Seguridad │ Limpieza │ Médico  │
└────────┴──────────────┴───────────┴──────────┴─────────┘
```

Al seleccionar:

```text
Seguridad
```

solo deben aparecer registros de seguridad.

La arquitectura debe permitir agregar nuevas categorías sin tener que duplicar páginas completas.

---

# 17. FILTROS POR FECHA

Esta funcionalidad es fundamental.

Debe ser posible consultar registros por:

### Día

```text
Hoy
```

### Semana

```text
Esta semana
```

### Mes

```text
Este mes
```

Y también debería existir un filtro personalizado:

```text
Desde: [ fecha ]
Hasta: [ fecha ]
```

Esto debe funcionar tanto para:

* Personal.
* Visitantes.

---

# 18. FILTROS COMBINADOS

Los filtros deben poder combinarse.

Ejemplo:

```text
Tipo:
[ Seguridad ]

Fecha:
[ Esta semana ]

Movimiento:
[ Entrada ]
```

Resultado:

```text
Solo entradas de personal de seguridad
durante la semana seleccionada.
```

Otro ejemplo:

```text
Tipo:
[ Limpieza ]

Fecha:
[ 01/08/2026 - 14/08/2026 ]
```

Debe devolver solamente esos registros.

---

# 19. FILTROS EN TIEMPO REAL

Cuando el usuario cambie un filtro, la información mostrada debe actualizarse.

No debe ser necesario recargar manualmente la página.

Los filtros deben funcionar correctamente juntos.

---

# 20. DASHBOARD / MÉTRICAS

En la pantalla principal administrativa agrega métricas útiles.

Como mínimo:

```text
Personas activas
Entradas hoy
Salidas hoy
Personas actualmente dentro
Visitantes de hoy
```

Ejemplo:

```text
┌──────────────────┐
│ Personas activas │
│       48         │
└──────────────────┘

┌──────────────────┐
│ Entradas hoy     │
│       36         │
└──────────────────┘

┌──────────────────┐
│ Dentro ahora     │
│       12         │
└──────────────────┘

┌──────────────────┐
│ Visitantes hoy   │
│        9         │
└──────────────────┘
```

Los números deben provenir de la base de datos.

No uses números mock.

---

# 21. ESTADO "DENTRO"

El sistema debe poder determinar si una persona actualmente se encuentra dentro.

Ejemplo:

```text
Juan Pérez
Entrada: 07:58
Salida: —
Estado: Dentro
```

Si posteriormente registra salida:

```text
Juan Pérez
Entrada: 07:58
Salida: 16:03
Estado: Fuera
```

El dashboard debe mostrar esta diferencia.

---

# 22. HISTORIAL

El administrador debe poder consultar registros históricos.

No limitar el sistema solamente a "hoy".

Debe poder consultar:

```text
Hoy
Ayer
Esta semana
Este mes
Rango personalizado
```

La información histórica debe permanecer almacenada.

---

# 23. VISITANTES VS PERSONAL

No mezcles conceptualmente ambas entidades.

Debe existir una separación clara:

```text
PERSONAL
→ personas registradas por administración
→ entrada/salida
→ categoría
→ historial

VISITANTES
→ registros creados desde el formulario de visitantes
→ folio
→ empresa
→ nombre
→ visita a
→ motivo
→ identificación
→ entrada/salida
```

El dashboard puede compartir componentes de tabla y filtros, pero los modelos y flujos deben mantenerse correctamente separados.

---

# 24. MODELO DE DATOS

Diseña el modelo de datos antes de implementar las pantallas.

Como mínimo deben existir conceptos equivalentes a:

```text
AdminUser
Person
PersonType
AccessRecord
Visitor
```

La implementación concreta puede variar.

Por ejemplo:

```text
Person
├── id
├── full_name
├── type
├── active
├── created_at
└── updated_at

AccessRecord
├── id
├── person_id
├── type
├── movement
├── timestamp
└── created_at

Visitor
├── id
├── folio
├── full_name
├── company
├── visit_to
├── reason
├── identification_type
├── entry_at
├── exit_at
└── created_at

AdminUser
├── id
├── username/email
├── password_hash
└── ...
```

No copies este modelo literalmente si la arquitectura que encuentres requiere una mejor solución.

Antes de implementar, analiza las relaciones necesarias.

---

# 25. IMPORTANTE: NO ROMPER EL KIOSCO

La aplicación principal debe continuar funcionando.

No conviertas el kiosco en un dashboard.

No hagas que el administrador tenga que pasar por el kiosco.

El flujo debe quedar conceptualmente así:

```text
                    ┌──────────────────┐
                    │      CODA        │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
       KIOSCO PRINCIPAL              ADMINISTRACIÓN
              │                             │
              │                             │
       Registro rápido              Login protegido
              │                             │
       Visitantes                     Dashboard
       Personal                       Personal
       Entradas                       Registros
       Salidas                        Visitantes
       Llaves                         Filtros
              │                             │
              └──────────────┬──────────────┘
                             ▼
                       BASE DE DATOS
```

Ambos lados deben utilizar la misma fuente de datos.

---

# 26. MIGRAR LOS DATOS MOCK ACTUALES

El README identifica varios datos hardcodeados:

* Visitantes mock.
* Llaves mock.
* "A quién visita".
* Registros de personal no persistidos.

La nueva arquitectura debe preparar el terreno para sustituir los mocks relevantes por datos reales.

No es necesario convertir absolutamente todo del sistema si no es necesario para este requerimiento, pero:

**personal, registros de entrada/salida y visitantes sí deben quedar persistidos.**

---

# 27. "A QUIÉN VISITA"

Actualmente el campo "A quién visita" está hardcodeado con una sola opción.

No quiero que esto permanezca hardcodeado.

Analiza cómo debe modelarse esta información para que pueda crecer.

Como mínimo, el dashboard debería permitir que las opciones disponibles sean gestionables o estén almacenadas de forma estructurada.

No mantengas un array hardcodeado dentro de la página si la nueva arquitectura ya cuenta con persistencia.

---

# 28. UX DEL DASHBOARD

El dashboard debe sentirse como un sistema administrativo profesional.

Debe incluir:

* Sidebar o navegación administrativa.
* Header.
* Título de sección.
* Breadcrumbs si son útiles.
* Tablas.
* Badges de estado.
* Formularios.
* Modales.
* Empty states.
* Loading states.
* Error states.
* Confirmaciones.
* Estados activos/inactivos.
* Filtros claros.

No sobrecargues la interfaz.

La información debe ser fácil de escanear.

---

# 29. TABLAS

Las tablas deben:

* Tener encabezados claros.
* Permitir escaneo rápido.
* Usar badges para categorías.
* Mostrar fechas y horas correctamente.
* Mostrar estado.
* Tener acciones claras.
* Tener estados vacíos.
* Tener loading state.
* Manejar correctamente cantidades grandes de registros.

No coloques demasiados elementos visuales innecesarios.

---

# 30. RESPONSIVE DEL ADMIN

A diferencia del kiosco, el dashboard sí debe ser responsive.

Debe funcionar correctamente al menos en:

* Desktop.
* Laptop.
* Tablet.

El kiosco puede conservar su comportamiento actual.

No agregues responsive innecesario al kiosco si rompe su diseño fijo.

---

# 31. COMPONENTES REUTILIZABLES

No dupliques componentes.

Si existen tablas similares para:

```text
Personal
Visitantes
Registros
```

crea componentes reutilizables cuando tenga sentido.

Lo mismo para:

* filtros;
* badges;
* cards;
* modales;
* formularios;
* combobox;
* estados de carga;
* paginación si es necesaria.

Pero evita crear abstracciones prematuras.

Primero identifica los patrones reales.

---

# 32. REUTILIZA EL DISEÑO ACTUAL

El README define claramente el lenguaje visual de CODA:

* `slate-100` como fondo.
* Cards blancas.
* `blue-700` como acción primaria.
* Inter.
* `rounded-2xl`.
* `rounded-3xl` para modales.
* Lucide React.
* Colores semánticos por categoría.

Utiliza ese lenguaje visual.

Para las categorías conserva los colores existentes:

```text
Practicantes → sky
Médico       → cyan
Limpieza     → indigo
Seguridad    → violet
```

No inventes una nueva identidad visual para administración.

El dashboard puede ser más sobrio y denso, pero debe sentirse como parte del mismo producto.

---

# 33. RUTAS

Actualiza `lib/constants.ts`.

No uses strings de rutas dispersos por el código.

El README establece explícitamente que las rutas deben centralizarse en `ROUTES`.

Agrega las nuevas rutas administrativas siguiendo ese patrón.

---

# 34. SEGURIDAD

No expongas:

* passwords.
* hashes.
* secrets.
* tokens.
* credenciales.
* variables `.env`.

No hardcodees credenciales.

Protege las APIs administrativas además de proteger visualmente las páginas.

Un usuario no autenticado no debe poder consultar directamente los endpoints administrativos.

---

# 35. VALIDACIÓN

Después de implementar:

```bash
npm run typecheck
npm run lint
npm run build
```

Corrige cualquier error generado por tus cambios.

No dejes TypeScript roto.

No dejes rutas inaccesibles.

No dejes imports sin utilizar.

---

# 36. README

Una vez terminado el desarrollo, actualiza `README.md`.

La nueva documentación debe incluir:

* Nueva arquitectura.
* Backend.
* Base de datos.
* Nuevas rutas.
* Autenticación.
* Dashboard.
* Modelos.
* Flujo de datos.
* Componentes nuevos.
* Variables de entorno.
* Cómo ejecutar la aplicación.
* Cómo ejecutar/migrar la base de datos.
* Cómo funciona la autenticación.
* Cómo funciona el registro de personal.
* Cómo funcionan los registros.
* Cómo funcionan los filtros.
* Cómo funciona visitantes.
* Nuevas reglas para agentes de IA.

El README sigue siendo la fuente primaria de contexto para futuros agentes.

---

# 37. ACTUALIZA TAMBIÉN AI AGENT CONTEXT

Agrega reglas específicas como:

```text
Admin
→ app/admin/

Admin authentication
→ ...

People
→ ...

Access records
→ ...

Visitors
→ ...

Database
→ ...

API
→ ...
```

Y explica:

* dónde modificar el catálogo de personal;
* dónde modificar registros;
* dónde modificar visitantes;
* dónde modificar autenticación;
* dónde modificar filtros;
* dónde modificar componentes del dashboard.

---

# 38. REGLA CRÍTICA SOBRE EL DESARROLLO

NO empieces creando componentes visuales inmediatamente.

Primero:

### Fase 1 — Análisis

Comprende:

```text
README
↓
AGENTS.md
↓
arquitectura actual
↓
modelos actuales
↓
flujo actual
```

### Fase 2 — Arquitectura

Define:

```text
Base de datos
↓
Modelos
↓
API / server layer
↓
Autenticación
↓
Admin
↓
Kiosco
```

### Fase 3 — Implementación

Implementa primero la infraestructura necesaria.

Después:

```text
Admin login
↓
Admin layout
↓
Personal CRUD
↓
Access records
↓
Visitors
↓
Filters
↓
Dashboard metrics
↓
Integración con kiosco
```

### Fase 4 — Validación

Ejecuta:

```bash
npm run typecheck
npm run lint
npm run build
```

Y prueba manualmente los flujos principales.

---

# 39. NO HAGAS ESTO

No:

* No uses mocks como solución final.
* No uses `localStorage` como base de datos.
* No hardcodees usuarios.
* No hardcodees passwords.
* No dupliques las páginas para cada categoría.
* No dupliques la lógica de filtros.
* No dupliques la lógica de entrada/salida.
* No agregues un botón de Admin al kiosco.
* No hagas que el login aparezca en el home.
* No rompas el diseño actual del kiosco.
* No elimines el sistema de impresión de gafetes.
* No modifiques `safe_visitor_main_redesign.html`.
* No hagas refactors no relacionados.
* No actualices dependencias sin necesidad.
* No inventes datos.
* No dejes código muerto.
* No dejes `console.log` innecesarios.
* No expongas secretos.

---

# 40. CRITERIO DE ÉXITO

Al terminar, debe ser posible hacer este flujo:

### Administrador

```text
/admin/login
        ↓
Login
        ↓
/admin/dashboard
        ↓
Agregar "Juan Pérez"
        ↓
Tipo: Seguridad
        ↓
Guardar
```

Después:

```text
Kiosco
   ↓
Seguridad
   ↓
Combobox
   ↓
Juan Pérez
   ↓
Entrada
   ↓
Registrar
```

Después:

```text
Admin Dashboard
   ↓
Registros
   ↓
Seguridad
   ↓
Hoy
```

Y aparecer:

```text
Juan Pérez
Seguridad
Entrada
08:02
```

Posteriormente:

```text
Kiosco
   ↓
Seguridad
   ↓
Juan Pérez
   ↓
Salida
```

Y el dashboard debe mostrar:

```text
Juan Pérez
Seguridad
Entrada: 08:02
Salida: 16:15
Estado: Fuera
```

Para visitantes:

```text
Kiosco
   ↓
Nuevo visitante
   ↓
Formulario
   ↓
Registro
```

Y posteriormente:

```text
Admin
   ↓
Visitantes
   ↓
Registro correspondiente
```

mostrando todos los datos del visitante, incluyendo:

```text
Folio
Nombre
Empresa
A quién visita
Motivo
Identificación
Entrada
Salida
```

Finalmente, debe ser posible combinar filtros como:

```text
Seguridad
+
Esta semana
+
Entradas
```

y obtener únicamente los registros correspondientes.

---

# INSTRUCCIÓN FINAL

No consideres esta tarea como "crear un dashboard".

Considera que estás evolucionando CODA desde un **prototipo frontend-only hacia un sistema de control de acceso con persistencia, administración y separación de roles**.

Antes de escribir código, entiende completamente el proyecto existente.

Antes de modificar una parte existente, entiende por qué funciona como funciona.

Preserva todo lo que actualmente funciona.

Implementa la nueva arquitectura de manera incremental.

Si alguna decisión técnica importante no puede determinarse a partir del código existente, elige la solución más simple, mantenible y coherente con Next.js 16 y documenta la decisión en `README.md`.

Al finalizar, entrega el proyecto funcionando, con el dashboard administrativo, autenticación, persistencia, catálogo de personal, registros de entrada/salida, visitantes, filtros y documentación actualizada.
