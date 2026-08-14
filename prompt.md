# CAMBIOS FUNCIONALES Y DE INTERFAZ — HORARIOS, PAGOS, TRANSPORTISTAS Y REGISTROS


Hemos revisado la plataforma funcionando en vivo y necesitamos realizar una serie de cambios funcionales, de base de datos y de interfaz.


IMPORTANTE:


Antes de modificar código, lee y comprende:


- README.md
- estructura completa del proyecto
- esquema actual de Prisma
- modelos relacionados con usuarios, personas y registros
- flujo actual de entrada/salida
- dashboard administrativo
- kiosco principal
- sidebar
- componentes reutilizables


No rompas las funcionalidades existentes.


Los cambios deben integrarse con la arquitectura actual y PostgreSQL.


---


# 1. ASIGNAR HORARIO A LAS PERSONAS


Necesitamos agregar la posibilidad de asignar un horario a las personas que corresponda.


En el dashboard administrativo, al crear o editar una persona debe existir una sección:


"Horario"


Debe permitir configurar, como mínimo:


- Hora de entrada.
- Hora de salida.


Ejemplo:


```text
Horario


Entrada:
[ 08:00 ]


Salida:
[ 17:00 ]

Esto debe persistirse en PostgreSQL.

No hardcodear horarios.

2. HORARIO POR PERSONA

El horario debe pertenecer a la persona correspondiente.

Debe permitir que diferentes personas tengan diferentes horarios.

Ejemplo:

Juan Pérez
Horario:
08:00 - 17:00
María González
Horario:
09:00 - 18:00

No asumir que todos tienen el mismo horario.

3. PAGO POR SEMANA O QUINCENA

Necesitamos agregar a las personas que corresponda una configuración de periodicidad de pago.

Opciones:

Semanal
Quincenal

Por ejemplo:

Practicante:
Pago: Quincenal

o:

Practicante:
Pago: Semanal

Este dato debe persistirse en PostgreSQL.

4. ¿A QUIÉNES APLICA EL PAGO?

La periodicidad de pago debe ser configurable principalmente para personas como practicantes, pero la arquitectura debe permitir utilizarla para otros tipos de personal si posteriormente se requiere.

No hardcodear:

Practicantes = Quincenal

El usuario administrativo debe poder seleccionar:

Semanal
Quincenal

al crear/editar la persona cuando corresponda.

5. HORAS TRABAJADAS

Necesitamos calcular las horas trabajadas utilizando:

Entrada
Salida

Por ejemplo:

Entrada: 08:00
Salida: 17:00


Total:
9 horas

Si existen minutos:

Entrada: 08:15
Salida: 17:42


Total:
9h 27m

El cálculo debe hacerse a partir de los timestamps reales almacenados en PostgreSQL.

No almacenar manualmente el total de horas como valor independiente si puede calcularse de manera confiable a partir de entrada/salida.

6. PERSONAS A LAS QUE APLICA EL CÁLCULO

El cálculo de horas aplica al personal que registra entrada y salida.

NO aplicar este concepto de la misma manera a:

Visitantes externos.

Los visitantes externos tienen su propio flujo de entrada/salida y deben continuar en su sección independiente.

7. NUEVO TIPO: TRANSPORTISTAS

Necesitamos agregar un nuevo tipo de personal:

Transportistas

Debe funcionar conceptualmente igual que:

Practicantes.
Limpieza.
Seguridad.
Personal médico.

Pero tiene una diferencia importante:

Transportistas tendrá su propio apartado.

No debe quedar combinado dentro del apartado genérico de "Personal".

8. TRANSPORTISTAS EN EL SIDEBAR

Agregar una nueva opción en el sidebar administrativo:

Transportistas

Debe tener su propia ruta/página.

Por ejemplo:

/admin/transportistas

o la estructura equivalente existente.

9. TRANSPORTISTAS COMO CATÁLOGO PROPIO

Los transportistas deben poder:

Ver sus registros.
Crear transportistas.
Editar transportistas.
Activar/desactivar transportistas.
Configurar horario.
Configurar periodicidad de pago.
Consultar entradas y salidas.

No mezclarlos visualmente con:

/admin/personal

aunque internamente puedan reutilizar modelos/componentes.

10. REGISTRO DE TRANSPORTISTAS EN EL KIOSCO

En el kiosco principal debe aparecer:

Transportistas

como una opción independiente.

Debe funcionar igual que:

Practicantes
Limpieza
Seguridad
Personal médico

permitiendo seleccionar al transportista y registrar:

Entrada
Salida

La información debe persistirse en PostgreSQL.

11. CAMBIO DEL HOME / KIOSCO PRINCIPAL

Actualmente la interfaz tiene:

Registrar nuevo visitante
Registrar salida
Llaves
Sin gafete
Practicantes


Personal médico
Limpieza
Seguridad

como se observa en la interfaz actual.

Necesitamos simplificarla.

12. REGISTRAR NUEVO VISITANTE

El botón:

Registrar nuevo visitante

actualmente ocupa prácticamente todo el ancho.

Debe hacerse más compacto.

No debe ocupar toda la fila.

La parte superior debe convertirse en dos acciones principales:

┌──────────────────────────────┬──────────────────────┐
│ Registrar nuevo visitante    │ Registrar salida     │
│ Captura de datos...          │ Cerrar visita activa │
└──────────────────────────────┴──────────────────────┘

Ambos deben tener aproximadamente la misma jerarquía visual.

"Registrar nuevo visitante" debe dejar de ser un banner gigante.

13. ACCIONES RÁPIDAS

Eliminar de "Acciones rápidas":

Sin gafete

No debe aparecer más en el kiosco.

En su lugar, las acciones rápidas deben quedar exactamente como:

Llaves
Transportistas
Practicantes

Por ejemplo:

ACCIONES RÁPIDAS


┌──────────────┬──────────────┬──────────────┐
│ 🔑 Llaves    │ 🚚 Transport.│ 🎓 Practic.  │
│ Control...   │ Registro...  │ Registro...  │
└──────────────┴──────────────┴──────────────┘

La composición exacta puede adaptarse al diseño existente.

14. PERSONAL INTERNO

Debajo de las acciones rápidas puede continuar existiendo:

PERSONAL INTERNO


Personal médico
Limpieza
Seguridad

Transportistas NO deben agregarse aquí si ya tienen su propia sección dentro de acciones rápidas.

Evitar duplicar botones.

15. SIDEBAR ADMINISTRATIVO

Agregar:

Transportistas

como sección independiente.

No ocultarlo dentro de "Personal".

La navegación debe permitir entrar directamente a:

Transportistas

y administrar exclusivamente ese tipo de personal.

16. CAMBIO FUNDAMENTAL EN REGISTROS DE ACCESO

Actualmente la pantalla:

Registros de acceso

muestra una fila por cada movimiento.

Por ejemplo:

ERNESTO COLIN ESCALERA | Practicantes | Salida  | 15:52 | 14/08/2026
ERNESTO COLIN ESCALERA | Practicantes | Entrada | 15:43 | 14/08/2026

Esto debe cambiar.

NO queremos una fila por movimiento.

Queremos una fila por:

Persona + Día
17. NUEVA ESTRUCTURA DE REGISTROS

La tabla debe mostrar:

Persona
Tipo
Fecha
Entrada
Salida
Total de horas

Ejemplo:

┌──────────────────────┬──────────────┬────────────┬─────────┬─────────┬──────────────┐
│ Persona              │ Tipo         │ Fecha      │ Entrada │ Salida  │ Total horas  │
├──────────────────────┼──────────────┼────────────┼─────────┼─────────┼──────────────┤
│ ERNESTO COLIN...     │ Practicantes │ 14/08/2026 │ 15:43  │ 15:52  │ 00h 09m      │
└──────────────────────┴──────────────┴────────────┴─────────┴─────────┴──────────────┘

Una persona que tenga entrada y salida el mismo día debe aparecer UNA SOLA VEZ.

18. AGRUPACIÓN POR DÍA

El concepto de registro debe ser:

persona + fecha

Por ejemplo:

Juan Pérez
14/08/2026
Entrada 08:00
Salida 17:00

es una sola fila.

Si se filtra por una semana:

Semana

una persona que haya trabajado los 7 días puede tener:

Máximo 7 filas

una por cada día.

NO mostrar 14 filas por tener 7 entradas + 7 salidas.

19. CASO SIN SALIDA

Si una persona tiene:

Entrada: 08:00
Salida: NULL

mostrar:

Entrada: 08:00
Salida: —
Total horas: En curso

No inventar una hora de salida.

Para el cálculo de horas en curso, si se decide mostrar tiempo transcurrido, debe distinguirse visualmente de un total cerrado.

20. CASO SIN ENTRADA

Si existe una salida sin una entrada correspondiente, no asumir una entrada.

Mostrar:

Entrada: —
Salida: 17:00
Total horas: —

Y, si es necesario, marcarlo como inconsistente.

No inventar datos.

21. MULTIPLES ENTRADAS/SALIDAS EN UN MISMO DÍA

Debemos considerar que una persona podría registrar más de una entrada/salida en un mismo día.

No eliminar información histórica.

La interfaz principal debe seguir mostrando una sola fila por:

Persona + Día

Si existen múltiples pares de entrada/salida en un día, calcula el total diario sumando los intervalos válidos.

Ejemplo:

Entrada 08:00
Salida 12:00


Entrada 13:00
Salida 17:00

La fila debe mostrar:

Entrada: 08:00
Salida: 17:00
Total horas: 08h 00m

El detalle de los movimientos individuales puede abrirse en un modal/detalle si resulta necesario.

No perder los registros individuales en la base de datos.

22. TOTAL DE HORAS

Agregar una columna:

Total de horas

El cálculo debe ser:

Salida - Entrada

o la suma de intervalos válidos cuando existan múltiples movimientos.

Ejemplo:

08:00 → 17:00


Total:
09h 00m

Otro:

08:15 → 17:42


Total:
09h 27m
23. FILTRO DE FECHA

Actualmente existen:

Hoy
Semana
Mes
Personalizado

Agregar:

Quincenal

La barra debe quedar:

Hoy
Semana
Mes
Quincenal
Personalizado
24. FILTRO QUINCENAL

"Quincenal" debe representar un período de 15 días.

Debe definirse claramente el rango que se está consultando.

Por ejemplo:

Quincena actual

y/o según la lógica existente del proyecto.

IMPORTANTE:

No confundir "quincenal" con "mes".

Debe consultar exactamente un período de 15 días.

Si el sistema necesita distinguir:

1ª quincena: 1–15
2ª quincena: 16–fin de mes

utiliza esa lógica, siempre que sea coherente con la implementación de periodicidad de pago existente.

25. RELACIÓN ENTRE FILTRO QUINCENAL Y PAGO

El filtro:

Quincenal

de registros representa un período de consulta de 15 días.

No significa necesariamente que solo las personas con:

payment_frequency = QUINCENAL

aparezcan.

El filtro de fecha y la periodicidad de pago son conceptos distintos.

Una persona con pago semanal puede ser consultada dentro de un rango quincenal.

26. BÚSQUEDA POR PERSONA

Conservar el buscador actual:

BUSCAR PERSONA


Nombre completo o parcial...

Debe continuar funcionando.

Debe buscar en los registros agrupados por persona/día.

Ejemplo:

Buscar:
Ernesto

mostrar los días correspondientes a Ernesto.

27. FILTRO POR TIPO

Conservar:

Tipo

pero agregar Transportistas como tipo disponible.

Por ejemplo:

Todos
Practicantes
Seguridad
Limpieza
Personal médico
Transportistas

Los valores deben provenir de la arquitectura actual y no estar duplicados innecesariamente.

28. MOVIMIENTO

El filtro actual:

Movimiento
Todos
Entrada
Salida

ya no tiene sentido exactamente igual porque la tabla ahora representa una jornada diaria.

Por lo tanto, analizar y adaptar este filtro.

Una opción preferida sería:

Estado
Todos
Completo
En curso
Inconsistente

Donde:

Completo

Existe entrada y salida.

En curso

Existe entrada pero no salida.

Inconsistente

Existe salida pero no entrada.

No mantener "Entrada/Salida" como filtro principal si contradice el nuevo modelo visual.

29. CONSULTA A BASE DE DATOS

IMPORTANTE:

La agrupación por:

persona + día

debe hacerse correctamente a nivel de servidor/consulta.

No cargar todos los movimientos históricos al navegador para después agruparlos con JavaScript.

La consulta debe:

Aplicar filtros de fecha.
Aplicar filtro de persona.
Aplicar filtro de tipo.
Obtener movimientos relevantes.
Agrupar por persona y fecha.
Resolver entrada/salida.
Calcular total de horas.
Devolver solamente los registros necesarios para la tabla.

Utilizar Prisma/PostgreSQL.

30. PAGINACIÓN

Si existe paginación actualmente, adaptarla al nuevo modelo.

La paginación debe aplicarse sobre:

Persona + Día

y no sobre movimientos individuales.

31. DASHBOARD DE PERSONAL

Al crear/editar personas, agregar:

Horario

y:

Periodicidad de pago

Ejemplo:

Nombre:
Juan Pérez


Tipo:
Practicantes


Horario:
Entrada [08:00]
Salida  [17:00]


Pago:
( ) Semanal
( ) Quincenal
32. TRANSPORTISTAS — ADMIN

Crear una página administrativa propia para transportistas.

Debe permitir:

Lista de transportistas
Agregar transportista
Editar
Activar/desactivar
Horario
Periodicidad de pago

Y consultar sus registros de acceso.

Reutilizar los componentes existentes cuando sea posible.

No duplicar lógica innecesariamente.

33. TRANSPORTISTAS — KIOSCO

En el kiosco:

Transportistas

debe abrir un flujo equivalente al de Practicantes/Limpieza/Seguridad.

Debe utilizar el catálogo de personas de Transportistas.

La selección debe ser mediante el mismo tipo de combobox/buscador utilizado actualmente para el personal.

No permitir escribir nombres arbitrarios.

34. BASE DE DATOS

Analiza el esquema actual antes de modificarlo.

Necesitamos soportar:

Persona
horario_entrada
horario_salida
payment_frequency

o nombres equivalentes siguiendo la convención actual.

Tipo Transportistas

Agregar el tipo correspondiente.

Registros

No eliminar los movimientos individuales.

La base de datos debe continuar almacenando cada:

ENTRY
EXIT

individualmente.

La agrupación:

persona + día

es únicamente para la vista administrativa.

Esto es MUY IMPORTANTE.

No convertir la tabla histórica de movimientos en una tabla diaria porque perderíamos trazabilidad.

35. HISTORIAL

Debe mantenerse el historial individual.

Ejemplo:

AccessRecord


08:00 ENTRY
12:00 EXIT
13:00 ENTRY
17:00 EXIT

La interfaz puede mostrar:

08:00 | 17:00 | 08h 00m

pero los cuatro movimientos deben continuar existiendo en PostgreSQL.

36. AUDITORÍA

Las nuevas operaciones administrativas deben continuar utilizando el sistema de AuditLog existente.

Especialmente:

CREATE_PERSON
UPDATE_PERSON
UPDATE_SCHEDULE
UPDATE_PAYMENT_FREQUENCY
CREATE_TRANSPORTER
UPDATE_TRANSPORTER
DEACTIVATE_TRANSPORTER
ACTIVATE_TRANSPORTER

Utilizar los nombres/conceptos existentes de AuditLog si ya hay convenciones establecidas.

37. HOME / KIOSCO — DISEÑO FINAL

La interfaz debería evolucionar aproximadamente hacia:

┌──────────────────────────────────────────────────────────────┐
│ CODA                                      Hora / Fecha       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────┐ ┌───────────────────────────┐ │
│ │ Registrar nuevo visitante  │ │ Registrar salida          │ │
│ │ Captura de datos...        │ │ Cerrar visita activa      │ │
│ └────────────────────────────┘ └───────────────────────────┘ │
│                                                              │
│ ACCIONES RÁPIDAS                                              │
│                                                              │
│ ┌────────────┐ ┌───────────────┐ ┌──────────────┐            │
│ │ 🔑 Llaves  │ │ 🚚 Transport. │ │ 🎓 Practic.  │            │
│ │            │ │               │ │              │            │
│ └────────────┘ └───────────────┘ └──────────────┘            │
│                                                              │
│ PERSONAL INTERNO                                              │
│                                                              │
│ ┌────────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Personal médico│ │ Limpieza     │ │ Seguridad    │         │
│ └────────────────┘ └──────────────┘ └──────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

No es necesario copiar exactamente este diseño, pero sí respetar la nueva jerarquía:

Visitante.
Salida.
Llaves.
Transportistas.
Practicantes.
Personal interno restante.
38. ELIMINAR "SIN GAFETE"

Eliminar completamente del kiosco:

Sin gafete

No debe quedar:

Botón.
Ruta.
Acceso desde home.
Referencia visual.

Antes de eliminarlo, verifica si alguna funcionalidad depende de esta ruta.

Si existe lógica relacionada, no eliminar datos históricos; únicamente retirar la opción de acceso si ese es el objetivo.

39. NO ROMPER VISITANTES

Los visitantes externos continúan teniendo su propio flujo:

Registrar visitante
Registrar salida

No mezclar visitantes con:

horas trabajadas
horarios
periodicidad de pago

Los visitantes siguen siendo externos.

40. VALIDACIONES

Al guardar horario:

Validar hora de entrada.
Validar hora de salida.
Permitir horarios válidos.
No aceptar valores inválidos.

Al calcular horas:

Manejar correctamente minutos.
No producir valores negativos.
Manejar registros sin salida.
Manejar registros inconsistentes.
41. ZONA HORARIA

Utilizar la misma zona horaria que actualmente utiliza CODA para los registros.

No introducir una nueva zona horaria arbitrariamente.

Los cálculos de entrada/salida deben utilizar timestamps consistentes.

42. README

Actualizar README.md con:

Nuevo concepto de horarios.
Periodicidad de pago.
Tipo Transportistas.
Ruta/sección de Transportistas.
Nuevo modelo de visualización de registros.
Agrupación por persona + día.
Cálculo de horas.
Filtro Quincenal.
Estados de registro.
Funcionamiento de entradas/salidas múltiples en un mismo día.
43. MIGRACIONES

Si el esquema actual no soporta:

Horario.
Periodicidad de pago.
Transportistas.

crear las migraciones Prisma necesarias.

NO eliminar datos existentes.

Antes de modificar tablas existentes, revisar:

foreign keys;
relaciones;
índices;
datos actuales.

Las migraciones deben ser reversibles/reproducibles.

44. VERIFICACIÓN

Ejecutar:

npm run db:generate
npm run typecheck
npm run lint
npm run build

Y probar manualmente:

Practicante
Crear/editar practicante.
Asignar horario 08:00–17:00.
Asignar pago quincenal.
Registrar entrada.
Registrar salida.
Ir a Registros.
Ver una sola fila.
Ver Entrada 08:00.
Ver Salida 17:00.
Ver Total horas 09h 00m.
Semana

Registrar una persona durante varios días.

Filtrar:

Semana

Verificar que exista como máximo una fila por persona por día.

Quincena

Filtrar:

Quincenal

Verificar que el rango corresponda a 15 días según la lógica definida.

Transportista
Crear transportista.
Asignar horario.
Asignar pago.
Registrar entrada.
Registrar salida.
Verificar registro diario.
Verificar que aparezca en el filtro de tipo Transportistas.
Verificar que tenga su propia sección administrativa.
Sin salida

Registrar entrada sin salida.

Debe mostrar:

Entrada: 08:00
Salida: —
Total horas: En curso
Múltiples movimientos

Registrar:

08:00 Entrada
12:00 Salida
13:00 Entrada
17:00 Salida

Debe mostrar una sola fila:

Entrada: 08:00
Salida: 17:00
Total: 08h 00m

pero mantener los cuatro movimientos en la base de datos.

45. CRITERIO DE ÉXITO

El cambio principal es pasar de:

UNA FILA = UN MOVIMIENTO

a:

UNA FILA = UNA PERSONA EN UN DÍA

manteniendo en PostgreSQL:

TODOS LOS MOVIMIENTOS INDIVIDUALES

La interfaz final de registros debe ser:

┌──────────────────────┬──────────────┬────────────┬─────────┬─────────┬──────────────┐
│ Persona              │ Tipo         │ Fecha      │ Entrada │ Salida  │ Total horas  │
├──────────────────────┼──────────────┼────────────┼─────────┼─────────┼──────────────┤
│ Ernesto Colin        │ Practicantes │ 14/08/2026 │ 15:43  │ 15:52  │ 00h 09m      │
└──────────────────────┴──────────────┴────────────┴─────────┴─────────┴──────────────┘

Y los filtros:

Buscar persona
Hoy
Semana
Mes
Quincenal
Personalizado
Tipo
Estado

La pantalla debe ser considerablemente más limpia que la actual y evitar duplicar filas de entrada/salida.

No sacrificar el historial real en la base de datos por simplificar la interfaz.