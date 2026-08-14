Necesitamos modificar la estructura del dashboard administrativo para que el **registro histórico de quién tomó las llaves** sea una sección propia y visible desde el sidebar.

## Sidebar administrativo

El sidebar debe quedar conceptualmente así:

```text id="8x7m2q"
Dashboard

Personal
Personas a visitar

Llaves
Registro de llaves

Visitantes
```

La nomenclatura exacta puede ajustarse al diseño existente, pero deben existir **dos conceptos separados**:

### Llaves

Administración del catálogo de llaves:

* Ver llaves.
* Crear.
* Editar.
* Activar/desactivar.
* Ver estado actual.

### Registro de llaves

Historial de quién tomó las llaves:

* Persona.
* Llave.
* Fecha/hora de toma.
* Fecha/hora de devolución.
* Estado.
* Historial completo.

---

# `/admin/llaves`

Esta sección corresponde exclusivamente a la **administración del catálogo de llaves**.

Debe permitir:

* Ver todas las llaves.
* Crear nuevas llaves.
* Editar llaves.
* Activar/desactivar llaves.
* Ver si están disponibles u ocupadas.
* Ver quién tiene actualmente una llave.

Ejemplo:

```text id="p9s2kx"
Sala Agave       Disponible
Sala Mezquite    En uso — Juan Pérez
Sala Sotol       Disponible
Sala Aant        Disponible
Sala Asakao      Disponible
Enfermería       En uso — María González
```

---

# `/admin/llaves/registro`

Crear una nueva sección dedicada exclusivamente al **historial de préstamos de llaves**.

Esta sección debe aparecer directamente en el sidebar como:

```text id="q7v3mx"
Registro de llaves
```

Debe ser accesible tanto para:

* `ADMIN`
* `SUPERADMIN`

---

# Registro de llaves

La pantalla debe mostrar una tabla con el historial de todos los préstamos.

Columnas:

```text id="j3f8nd"
Persona
Llave
Fecha
Hora de toma
Hora de devolución
Duración
Estado
```

Ejemplo:

```text id="5s8k2p"
┌───────────────┬──────────────┬────────────┬────────┬───────────┬──────────┬────────┐
│ Persona       │ Llave        │ Fecha      │ Toma   │ Devolución│ Duración  │ Estado │
├───────────────┼──────────────┼────────────┼────────┼───────────┼──────────┼────────┤
│ Juan Pérez    │ Sala Agave   │ 14/08/26   │ 08:15  │ 16:02     │ 7h 47m   │ Devuelta│
│ María López   │ Enfermería   │ 14/08/26   │ 09:10  │ —         │ 2h 31m   │ En uso │
└───────────────┴──────────────┴────────────┴────────┴───────────┴──────────┴────────┘
```

---

# BUSCADOR

Esta sección debe tener un **buscador principal** para encontrar rápidamente los registros de una persona específica.

Ejemplo:

```text id="z1c6qw"
Buscar por persona, llave o número de empleado...

[ Juan Pérez                         🔍 ]
```

Debe poder buscar por:

* Nombre de la persona.
* Número de empleado.
* Nombre de la llave.

Debe soportar coincidencias parciales y ser case-insensitive.

Por ejemplo:

```text id="v8n3qp"
Buscar: juan
```

debe devolver todos los registros históricos de personas cuyo nombre coincida.

También:

```text id="b4m7ks"
Buscar: mezquite
```

debe devolver todos los registros relacionados con `Sala Mezquite`.

---

# FILTROS

Además del buscador, debe existir una barra de filtros.

Como mínimo:

```text id="h2k8vd"
Persona:    [ Todas ▼ ]
Llave:      [ Todas ▼ ]
Fecha:      [ Hoy ▼ ]
Estado:     [ Todos ▼ ]
```

El filtro de fecha debe permitir:

```text id="n7x4qs"
Hoy
Ayer
Esta semana
Este mes
Rango personalizado
```

El estado:

```text id="q5m9zx"
Todos
En uso
Devuelta
```

---

# COMBINACIÓN DE BUSCADOR Y FILTROS

El buscador y los filtros deben poder utilizarse simultáneamente.

Ejemplo:

```text id="r8k2mj"
Buscar:
[ Juan ]

Llave:
[ Todas ]

Fecha:
[ Este mes ]

Estado:
[ Devuelta ]
```

Resultado:

```text id="f4v7nx"
Todos los préstamos de llaves realizados por
personas cuyo nombre coincide con "Juan",
durante este mes y que ya fueron devueltos.
```

---

# BÚSQUEDA SERVER-SIDE

El buscador y filtros deben ejecutarse sobre PostgreSQL mediante Prisma.

**No cargues todo el historial al navegador para después filtrarlo.**

La consulta debe poder crecer correctamente si posteriormente existen miles o millones de registros.

Conceptualmente:

```text id="k6m2vp"
Usuario
   ↓
Buscar / Filtrar
   ↓
Server Action / API
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Resultados filtrados
```

---

# PAGINACIÓN

Como el historial puede crecer considerablemente, implementa paginación.

Por ejemplo:

```text id="w3q8nz"
Mostrando 1–25 de 438 registros

< Anterior     1  2  3  4  5     Siguiente >
```

La paginación también debe ejecutarse server-side.

No descargues todos los registros para paginarlos en React.

---

# ESTADO DE UNA LLAVE

El registro debe distinguir:

### En uso

Cuando:

```text id="m7p3qx"
returned_at IS NULL
```

Mostrar:

```text id="j9x2kw"
En uso
```

### Devuelta

Cuando:

```text id="v4n8zs"
returned_at IS NOT NULL
```

Mostrar:

```text id="c2k6mp"
Devuelta
```

---

# DURACIÓN

Para registros devueltos:

```text id="s8q4mw"
duración = returned_at - taken_at
```

Para registros actualmente activos:

```text id="f6j2nz"
duración = ahora - taken_at
```

La duración debe actualizarse visualmente para las llaves actualmente en uso.

---

# RELACIÓN CON LA BASE DE DATOS

Utilizar el modelo:

```text id="q4m8vx"
Key
KeyAssignment
Person
```

La tabla de historial debe conservar:

```text id="d7k3mp"
key_id
person_id
taken_at
returned_at
created_at
```

Nunca elimines un `KeyAssignment` cuando se devuelve una llave.

La devolución únicamente debe actualizar:

```text id="p5n9xq"
returned_at
```

De esta manera conservamos todo el historial.

---

# REGISTRO DESDE EL KIOSCO

El flujo actual del kiosco debe seguir siendo:

```text id="x7m3qk"
Kiosco
   ↓
Panel de llaves
   ↓
Tomar
   ↓
Seleccionar persona
   ↓
Confirmar
   ↓
KeyAssignment creado
```

Y:

```text id="z8p4nv"
Kiosco
   ↓
Llave en uso
   ↓
Devolver
   ↓
KeyAssignment.returned_at = ahora
```

Cada operación debe quedar inmediatamente disponible en:

```text id="h3k7mx"
/admin/llaves/registro
```

---

# AUDITORÍA

Estas acciones también deben generar `AuditLog`:

```text id="m2q8vx"
TAKE_KEY
RETURN_KEY
CREATE_KEY
UPDATE_KEY
ACTIVATE_KEY
DEACTIVATE_KEY
```

El `AuditLog` debe registrar quién realizó la acción cuando corresponda.

No almacenar passwords, hashes ni secretos dentro del log.

---

# PERMISOS

Tanto:

```text id="v6k2mq"
ADMIN
SUPERADMIN
```

pueden acceder a:

```text id="e8n3xp"
/admin/llaves
/admin/llaves/registro
```

La diferencia de permisos existente entre Admin y Superadmin se mantiene para las demás funcionalidades.

---

# CRITERIO DE ÉXITO

El sidebar debe permitir:

```text id="q2m7vx"
Dashboard
Personal
Personas a visitar
Llaves
Registro de llaves
Visitantes
```

Y el flujo debe funcionar:

```text id="n5k8zp"
Juan Pérez toma Sala Agave
        ↓
Se crea KeyAssignment
        ↓
Juan devuelve Sala Agave
        ↓
Se actualiza returned_at
        ↓
Admin entra a "Registro de llaves"
        ↓
Busca "Juan"
        ↓
Ve todo su historial de llaves
```

También debe ser posible:

```text id="j4m9qx"
Buscar "Sala Agave"
        ↓
Ver todos los préstamos históricos
de esa llave
```

La sección debe quedar completamente integrada con PostgreSQL, Prisma, `Person`, `Key`, `KeyAssignment` y `AuditLog`.
