# CORRECCIÓN — AUTORIZACIÓN PARA SOLICITAR LLAVES


Necesitamos modificar el módulo de llaves para establecer correctamente quién puede solicitar/tomar una llave.


## 1. PERSONAS AUTORIZADAS


Las personas que pueden tomar una llave serán exactamente las mismas personas que actualmente pueden ser seleccionadas como:


"A quién visita"


Es decir, deben provenir del catálogo existente:


VisitHost


NO crear un nuevo catálogo de personas para las llaves.


La fuente de verdad debe ser:


PostgreSQL
    ↓
VisitHost
    ↓
Personas autorizadas para recibir visitantes
    ↓
Personas autorizadas para solicitar llaves


---


# 2. EXCEPCIÓN: LIMPIEZA


Además de las personas existentes en `VisitHost`, debe existir una opción especial:


```text
Limpieza

Esta opción NO representa a una persona específica.

No queremos registrar los nombres individuales del personal de limpieza porque existe mucha rotación.

Por lo tanto:

VisitHost
    ├── Personas reales
    │
    └── NO incluye necesariamente "Limpieza"

y para el módulo de llaves tendremos una opción adicional/global:

Limpieza
3. FLUJO PARA TOMAR UNA LLAVE

Actualmente el modal permite escribir manualmente:

Nombre del empleado
[ Nombre completo ]

Esto debe eliminarse.

No queremos que el usuario pueda escribir cualquier nombre.

El nuevo flujo debe ser exactamente similar al flujo de selección de:

"A quién visita"

Es decir:

Llave disponible
       ↓
Tomar
       ↓
¿Quién solicita la llave?
       ↓
Abrir buscador
       ↓
Buscar persona
       ↓
Seleccionar persona
       ↓
Confirmar
4. BUSCADOR

El selector debe utilizar un popup/modal de búsqueda.

No mostrar un combobox enorme con todas las personas cargadas desde el inicio.

Debe utilizar el mismo patrón UX que ya implementamos para VisitHost.

Ejemplo:

┌─────────────────────────────────────────┐
│ ¿Quién solicita la llave?            × │
│                                         │
│ [ 🔍 Buscar persona...                 ] │
│                                         │
│ Resultados                               │
│                                         │
│ Juan Pérez                               │
│ Supervisor de Procesos                   │
│ Manufactura                              │
│                                         │
│ María González                           │
│ Analista                                 │
│ Recursos Humanos                          │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🧹 Limpieza                              │
│ Personal de limpieza                    │
└─────────────────────────────────────────┘
5. BÚSQUEDA

La búsqueda de personas debe consultar:

VisitHost

y debe permitir buscar por:

Nombre.
Número de empleado.
Departamento.
Puesto.

Debe ser:

Case-insensitive.
Parcial.
Server-side.
Utilizando Prisma/PostgreSQL.

No cargar todo el catálogo al navegador para realizar el filtro.

6. LIMPIEZA COMO OPCIÓN ESPECIAL

La opción:

Limpieza

debe aparecer siempre como una opción adicional dentro del selector.

No debe requerir buscar un nombre específico.

Por ejemplo:

Buscar persona...


Resultados:


Juan Pérez
María González


──────────────


Limpieza

Si el usuario selecciona:

Limpieza

el registro de la llave debe indicar claramente que fue solicitada por:

Limpieza
7. BASE DE DATOS

Necesitamos adaptar el modelo KeyAssignment.

Actualmente se planteó:

KeyAssignment
├── id
├── key_id
├── person_id
├── taken_at
├── returned_at
└── created_at

Esto funciona para personas reales, pero necesitamos soportar también el caso:

Limpieza

sin crear una persona ficticia en Person.

NO crear:

Person:
nombre = "Limpieza"

porque conceptualmente no es una persona.

Tampoco crear múltiples usuarios/personas de limpieza.

8. MODELADO RECOMENDADO

Adapta KeyAssignment para permitir que el solicitante pueda ser:

Una persona real de VisitHost.
El grupo especial Limpieza.

La solución debe mantener una relación real con la persona cuando se trate de un empleado.

Por ejemplo, puedes utilizar una estructura equivalente a:

KeyAssignment
├── id
├── key_id
├── visit_host_id      nullable
├── requester_type
├── requester_label
├── taken_at
├── returned_at
└── created_at

Donde:

requester_type:
PERSON
CLEANING

y:

visit_host_id

solo se utiliza cuando:

requester_type = PERSON

Para:

requester_type = CLEANING

el registro debe representar simplemente:

Limpieza

No inventes una persona.

Si existe una solución más limpia con un enum/modelo diferente, puedes utilizarla, pero debe mantener estos principios.

9. IMPORTANTE: NO USAR Person SI NO CORRESPONDE

Anteriormente se planteó relacionar:

KeyAssignment → Person

para identificar quién toma una llave.

Debemos corregir esta parte.

Las personas autorizadas para tomar llaves son las de:

VisitHost

no necesariamente todas las personas de:

Person

Por lo tanto, NO permitir que cualquier:

Seguridad.
Limpieza.
Médico.
Practicante.

pueda solicitar una llave únicamente por estar registrado en Person.

La autorización para solicitar llaves debe basarse en:

VisitHost
+
Limpieza
10. RELACIONES

La relación conceptual debe quedar:

VisitHost
    │
    │
    ▼
KeyAssignment
    │
    ▼
Key

y adicionalmente:

CLEANING
    │
    ▼
KeyAssignment
    │
    ▼
Key

Por lo tanto:

                ┌── VisitHost
                │
Requester ──────┤
                │
                └── CLEANING
                       │
                       ▼
                  KeyAssignment
                       │
                       ▼
                      Key
11. INFORMACIÓN MOSTRADA EN EL KIOSCO

Cuando una llave está ocupada, debe mostrarse:

Persona
Juan Pérez

o:

Limpieza
Limpieza

Por ejemplo:

Sala Mezquite


En uso


Juan Pérez
hace 35m

o:

Sala Agave


En uso


Limpieza
hace 12m
12. DEVOLUCIÓN

La devolución funciona exactamente igual independientemente de quién haya tomado la llave.

Si fue:

Juan Pérez

mostrar:

¿Confirmas que Juan Pérez devuelve la llave de Sala Agave?

Si fue:

Limpieza

mostrar:

¿Confirmas que Limpieza devuelve la llave de Sala Agave?

Al devolver:

returned_at = ahora

y conservar el historial.

13. HISTORIAL ADMINISTRATIVO

En:

/admin/llaves/registro

el registro debe mostrar:

Persona / Solicitante
Llave
Fecha
Hora de toma
Hora de devolución
Duración
Estado

Para una persona:

Juan Pérez
Sala Agave
14/08/2026
08:15
16:02
7h 47m
Devuelta

Para limpieza:

Limpieza
Sala Agave
14/08/2026
08:15
09:20
1h 05m
Devuelta
14. BUSCADOR DEL REGISTRO

El buscador existente de:

/admin/llaves/registro

también debe encontrar:

Juan Pérez

y:

Limpieza

Por ejemplo:

Buscar: limpieza

debe mostrar todos los registros históricos donde:

requester_type = CLEANING
15. FILTRO POR SOLICITANTE

Si es posible, agrega un filtro:

Solicitante:
[ Todos ▼ ]

con:

Todos
Personas
Limpieza

Opcionalmente, dentro de personas puede buscarse por nombre.

16. VISITHOST INACTIVO

Si un VisitHost es desactivado:

active = false

debe dejar de aparecer como opción para nuevas solicitudes de llaves.

Pero los registros históricos deben permanecer.

Por ejemplo:

Juan Pérez
active = false

No debe poder tomar una nueva llave.

Sin embargo:

KeyAssignment
Juan Pérez
14/08/2026

debe seguir existiendo en el historial.

17. LIMPIEZA SIEMPRE DISPONIBLE

La opción:

Limpieza

debe estar disponible independientemente de los registros de VisitHost.

No depende de:

VisitHost.active

porque no representa a una persona específica.

18. NO DUPLICAR CATÁLOGOS

No crear:

KeyPeople
KeyRequesters
AuthorizedKeyUsers

ni ninguna tabla equivalente para duplicar VisitHost.

Utilizar:

VisitHost

como catálogo existente de personas autorizadas.

La única excepción es:

Limpieza

que es un solicitante especial/grupo.

19. FLUJO COMPLETO

El flujo final debe ser:

Usuario toca "Tomar"
        ↓
Modal "¿Quién solicita la llave?"
        ↓
┌─────────────────────────────┐
│ Buscar persona...           │
│                             │
│ Juan Pérez                  │
│ María González              │
│                             │
│ ─────────────────────────── │
│                             │
│ 🧹 Limpieza                 │
└─────────────────────────────┘
        ↓
Seleccionar
        ↓
Confirmar
        ↓
KeyAssignment
        ↓
PostgreSQL
20. EJEMPLO: PERSONA
Llave:
Sala Mezquite


Solicitante:
Juan Pérez


KeyAssignment:


key_id = Sala Mezquite
visit_host_id = <ID de Juan Pérez>
requester_type = PERSON
taken_at = ahora
returned_at = NULL
21. EJEMPLO: LIMPIEZA
Llave:
Sala Agave


Solicitante:
Limpieza


KeyAssignment:


key_id = Sala Agave
visit_host_id = NULL
requester_type = CLEANING
taken_at = ahora
returned_at = NULL
22. VALIDACIONES

Antes de permitir tomar una llave:

Persona

Debe verificarse server-side que:

VisitHost existe
AND
VisitHost.active = true
Limpieza

Debe verificarse:

requester_type = CLEANING

y permitir la operación.

No confiar únicamente en la información enviada desde el cliente.

23. AUDITORÍA

Las operaciones:

TAKE_KEY
RETURN_KEY

deben continuar generando AuditLog.

El log debe poder identificar:

Quién realizó la operación en el sistema

y:

Quién solicitó/tomó la llave

Son conceptos diferentes.

Por ejemplo:

Administrador operativo:
José Hernández


Solicitante:
Limpieza


Llave:
Sala Agave

No mezclar estos dos datos.

24. README

Actualiza README.md explicando:

Quién puede solicitar llaves.
Que los solicitantes provienen de VisitHost.
Que existe el solicitante especial Limpieza.
Que no se almacenan nombres individuales de limpieza.
Cómo funciona el selector.
Cómo se almacenan los KeyAssignment.
Cómo funciona el historial.
CRITERIO DE ÉXITO

Debe funcionar exactamente así:

Persona autorizada
Tomar llave
     ↓
Buscar "Juan"
     ↓
Juan Pérez
     ↓
Seleccionar
     ↓
Confirmar
     ↓
Llave asignada a Juan Pérez
Limpieza
Tomar llave
     ↓
Abrir selector
     ↓
Seleccionar "Limpieza"
     ↓
Confirmar
     ↓
Llave asignada a Limpieza
Persona NO autorizada

Si una persona existe en Person pero NO existe en VisitHost:

NO debe aparecer

y no debe poder solicitar una llave.

Persona VisitHost desactivada
VisitHost.active = false

Debe:

NO aparecer para nuevas solicitudes

pero conservar:

historial de llaves
Limpieza

Debe:

aparecer siempre

sin necesidad de crear una persona individual.

La fuente de personas reales debe ser VisitHost, y la única opción adicional debe ser Limpieza.


