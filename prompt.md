# CORRECCIÓN COMPLETA — GAFETE DE VISITANTE PARA BROTHER QL-810W


Necesitamos reemplazar completamente la implementación actual de impresión del gafete de visitante.


IMPORTANTE: anteriormente se asumió incorrectamente que la impresora era Zebra y que debíamos utilizar ZPL. Esto es incorrecto.


La impresora física real es:


Brother QL-810W


Por lo tanto, debemos eliminar cualquier implementación basada en Zebra/ZPL y reemplazarla por una solución compatible específicamente con Brother QL-810W.


Además, debemos rediseñar el gafete para sus dimensiones físicas reales y limitarlo estrictamente a blanco y negro.


---


# 1. IMPRESORA


La impresora objetivo es:


Brother QL-810W


Consideraciones conocidas:


- Resolución estándar: 300 dpi.
- Alta resolución disponible: 300 × 600 dpi.
- Ancho máximo de impresión: aproximadamente 58 mm.
- Conectividad: USB y Wi-Fi.
- Compatible con tecnologías de impresión de Brother.
- Soporte para Brother Print SDK.


NO utilizar:


- ZPL.
- Zebra.
- Comandos `^XA`.
- `^XZ`.
- `^FO`.
- `^FD`.
- `^PW`.
- `^LL`.
- `^BQN`.
- Ningún otro comando específico de Zebra.


La solución debe utilizar exclusivamente tecnologías compatibles con Brother QL-810W.


Antes de implementar, revisa la documentación oficial disponible para este modelo y determina cuál es el mecanismo más apropiado para nuestra aplicación.


---


# 2. DIMENSIONES FÍSICAS CORRECTAS


Las dimensiones anteriores estaban invertidas.


Las dimensiones CORRECTAS del gafete son:


```text
Ancho: 53 mm
Alto: 84.5 mm

La orientación debe ser:

53 mm
←─────────→


┌───────────────────┐
│                   │
│                   │
│      GAFETE       │
│                   │
│                   │
│                   │
│                   │
└───────────────────┘


        ↑
        │
      84.5 mm
        │
        ↓

Es decir:

53 mm corresponden al eje horizontal.
84.5 mm corresponden al eje vertical.
El gafete es vertical/retrato.
NO debemos rotarlo posteriormente.
NO debemos diseñarlo como 84.5 × 53 mm para después girarlo.

La implementación debe diseñarse directamente para:

53 mm × 84.5 mm

Esto es compatible con el ancho máximo aproximado de impresión de la QL-810W.

3. IMPORTANTE SOBRE EL TAMAÑO

No utilizar dimensiones arbitrarias como:

212px

ni asumir que:

53px = 53mm

El tamaño visual debe representar la proporción física real:

53 / 84.5

Para la impresión física, utiliza las unidades correspondientes al mecanismo de impresión de Brother.

Si es necesario convertir a dots:

dots = mm / 25.4 * DPI

Utiliza el DPI real que corresponda al modo de impresión elegido.

No inventes un DPI diferente al soportado por la QL-810W.

4. CAMBIO COMPLETO DE ZEBRA/ZPL A BROTHER

Actualmente se estaba planteando generar ZPL.

Esto debe descartarse completamente.

No quiero una capa de compatibilidad que genere ZPL.

La arquitectura debe cambiar a una solución específica para Brother.

Investiga primero las alternativas compatibles:

Brother Raster Commands.
ESC/P.
P-touch Template.
Brother Print SDK.
Comunicación Wi-Fi.
Comunicación USB.
Otro mecanismo oficialmente compatible con QL-810W.

Selecciona la opción más apropiada para nuestra aplicación.

Si Brother Print SDK es la alternativa adecuada, utilízala.

Si la aplicación web no puede comunicarse directamente con la impresora debido a las restricciones del navegador, no inventes una API inexistente.

En ese caso, separa:

Generación de impresión
        ↓
Transporte hacia la impresora

y utiliza una arquitectura apropiada, como un servicio local, SDK o mecanismo compatible.

5. ARQUITECTURA DE IMPRESIÓN

No quiero que toda la lógica de impresión quede dentro de:

GafeteVisitante.tsx

Crea un módulo independiente para impresión.

Por ejemplo:

lib/printing/
    brotherPrinter.ts
    visitorBadge.ts

Los nombres pueden adaptarse a la arquitectura actual.

Debe existir conceptualmente una separación entre:

generateVisitorBadge()

y:

printVisitorBadge()

La primera función se encarga de preparar la etiqueta.

La segunda se encarga de enviarla mediante el mecanismo compatible con Brother.

6. COMPONENTE ACTUAL

Actualmente existe un componente similar a:

GafeteVisitante

que recibe:

export interface GafeteVisitanteProps {
  folio: string;
  nombre: string;
  empresa: string;
  visitaA: string;
  motivo: string;
  identificacion: string;
  fechaHora: string;
}

Estos datos deben seguir siendo los datos principales del gafete.

No cambiar innecesariamente el contrato existente si no es necesario.

El componente debe continuar representando el gafete visualmente.

Sin embargo, la impresión física ya no debe depender de HTML/CSS.

7. DISEÑO DEL GAFETE

Rediseña el gafete para una etiqueta vertical de:

53 mm × 84.5 mm

El diseño debe ser:

Limpio.
Profesional.
Minimalista.
Muy legible.
Optimizado para impresión térmica.
Alto contraste.
Adecuado para una etiqueta pequeña.

NO intentar conservar exactamente el layout actual de 212px.

Adapta la composición al nuevo tamaño físico.

8. RESTRICCIÓN ABSOLUTA DE COLOR

El gafete debe imprimirse ÚNICAMENTE en:

BLANCO
NEGRO

No debe existir ningún otro color.

Esto significa:

No azul.
No gris.
No rojo.
No verde.
No amarillo.
No tonos intermedios.
No degradados.
No transparencias de color.
No sombras grises.
No elementos semitransparentes.

El diseño debe ser estrictamente:

#FFFFFF
#000000

o sus equivalentes físicos blanco/negro.

IMPORTANTE:

Esto aplica tanto al:

Preview del gafete.
Diseño visual.
Logo.
QR.
Texto.
Líneas.
Bordes.
Elementos gráficos.
Archivo/datos enviados a la impresora.

No debe existir una paleta de colores adicional.

9. LOGO

El logo actual se encuentra en:

public/safe-demo_logo-blc-Photoroom.png

Debe utilizarse este logo.

NO:

Reemplazarlo por una "C".
Crear otro logo.
Utilizar un icono diferente.
Eliminarlo.

Sin embargo, como el gafete debe ser estrictamente blanco y negro, debemos asegurarnos de que el logo sea compatible con impresión monocromática.

Si el PNG contiene tonos grises, transparencias o colores, conviértelo correctamente a una representación binaria/blanco-negro apropiada para la impresora.

No debe introducir grises en la impresión final.

El logo debe conservar:

Proporciones.
Legibilidad.
Identidad visual.
10. ESTRUCTURA DEL GAFETE

El gafete debe contener:

HEADER
Logo Safe Demo.
Etiqueta "VISITANTE".
INFORMACIÓN PRINCIPAL
Nombre del visitante.
Empresa.
Folio.
INFORMACIÓN DE LA VISITA
A quién visita.
Motivo.
Identificación.
FOOTER
Fecha y hora.
Código QR.

Conceptualmente:

┌───────────────────┐
│ LOGO      VISITANTE│
│───────────────────│
│                   │
│ NOMBRE            │
│                   │
│ Empresa           │
│                   │
│ FOLIO #000123     │
│───────────────────│
│                   │
│ VISITA A          │
│ Juan Pérez        │
│                   │
│ MOTIVO            │
│ Servicio          │
│                   │
│ IDENTIFICACIÓN    │
│ INE               │
│───────────────────│
│                   │
│ 14/08/2026        │
│ 11:32        [QR] │
└───────────────────┘

La composición exacta puede mejorar, pero debe conservar esta jerarquía.

11. TEXTO

Todo el texto debe ser negro sobre blanco.

No utilizar:

color: #4b5563;
color: #6b7280;
color: #374151;

ni ningún otro gris.

Utilizar exclusivamente:

color: #000000;
background: #FFFFFF;

Las líneas divisorias también deben ser:

#000000

El texto secundario puede tener menor tamaño o peso tipográfico, pero NO un color diferente.

12. VISITANTE

Debe aparecer claramente:

VISITANTE

Puede utilizar:

Texto negro.
Fondo negro.
Texto blanco.

Pero no utilizar ningún otro color.

Por ejemplo:

┌───────────────────┐
│ LOGO    VISITANTE │
└───────────────────┘

con "VISITANTE" en blanco sobre un bloque negro es válido.

13. NOMBRE

El nombre debe tener alta jerarquía visual.

Ejemplo:

JUAN PÉREZ

Debe ser negro.

Si el nombre es muy largo:

Juan Carlos Hernández Rodríguez

el sistema debe:

Hacer wrapping.
Reducir tamaño si es necesario.
Evitar que se salga del área imprimible.

Nunca permitir que el nombre sea cortado físicamente por los límites de la etiqueta.

14. EMPRESA

Mostrar:

Empresa XYZ

Debe ser negro sobre blanco.

Si la empresa es demasiado larga, manejarla mediante wrapping o reducción controlada.

15. FOLIO

Mostrar claramente:

FOLIO #000123

Debe ser fácilmente identificable.

Utilizar negro sobre blanco.

16. A QUIÉN VISITA

Mostrar:

VISITA A
Juan Pérez

El valor debe provenir del VisitHost seleccionado desde el nuevo popup de búsqueda.

No volver a utilizar un string hardcodeado.

17. MOTIVO

Mostrar:

MOTIVO
Servicio

Debe utilizar el mismo valor que actualmente recibe el componente.

Los labels existentes deben mantenerse:

practicas → Prácticas
prueba_sistema → Prueba de sistema
revision_proyecto → Revisión de proyecto
servicio → Servicio
visita_cliente → Visita cliente
visita_corporativo → Visita corporativo
visita_proveedor → Visita de proveedor

No eliminar estos valores.

18. IDENTIFICACIÓN

Mantener los labels actuales:

ine → INE
pasaporte → Pasaporte
licencia → Licencia de conducir
gafete_empresa → Gafete de empresa

Debe aparecer como:

IDENTIFICACIÓN
INE
19. FECHA Y HORA

Mantener el formato:

DD/MM/YYYY · HH:mm

Ejemplo:

14/08/2026 · 11:32

Todo en negro.

No utilizar colores secundarios.

20. CÓDIGO QR

El QR debe mantenerse.

Actualmente se genera:

const qrData = JSON.stringify({
  folio,
  nombre,
  empresa,
  fecha: fechaHora
});

Mantener esta información salvo que exista una razón técnica para modificarla.

El QR debe ser:

Negro sobre blanco.
Sin colores.
Sin degradados.
Sin fondo transparente que produzca problemas.
De tamaño suficiente para ser escaneado.

No enviar:

<QRCodeSVG />

directamente a la impresora.

El QR debe convertirse/generarse utilizando un método compatible con el sistema de impresión de Brother.

21. QR Y ESPACIO

El QR debe tener suficiente espacio alrededor para poder ser escaneado correctamente.

No colocarlo pegado:

a bordes;
a texto;
a líneas.

Mantener un pequeño margen blanco alrededor del QR.

22. PREVIEW VISUAL

Mantener el preview React del gafete para que el usuario pueda visualizar qué se va a imprimir.

Pero el preview debe:

Representar 53 × 84.5 mm.
Ser vertical.
Ser blanco y negro.
No utilizar colores.
No utilizar sombras grises.
No utilizar backgrounds grises.
Mantener la proporción física.

El preview debe utilizar:

background: #FFFFFF
color: #000000
border: #000000

únicamente.

No utilizar:

slate
gray
blue
red
green

dentro del gafete.

23. EL PREVIEW NO ES LA IMPRESIÓN

El preview debe servir para visualización.

La impresión física debe utilizar el mecanismo específico de Brother.

La arquitectura debe ser:

Datos del visitante
        ↓
Preview React
        ↓
Generador Brother
        ↓
Payload de impresión
        ↓
Brother QL-810W
24. COMUNICACIÓN CON LA IMPRESORA

Investiga la mejor manera de enviar trabajos de impresión a:

Brother QL-810W

La impresora tiene:

USB.
Wi-Fi.

No asumas que el navegador puede abrir directamente una conexión TCP/USB hacia la impresora.

Si se necesita:

Brother Print SDK.
Aplicación local.
Servicio local.
API local.
P-touch Template.
Otro componente.

implementa la arquitectura correspondiente.

No inventes APIs.

Si una parte requiere instalación/configuración fuera de Next.js, documenta exactamente qué debe instalarse y cómo configurarlo.

25. GENERADOR DE IMPRESIÓN

Crea un módulo independiente.

Por ejemplo:

lib/printing/brother/
    visitorBadge.ts
    printer.ts

Debe existir una función equivalente a:

generateVisitorBadge(data)

que reciba:

{
  folio,
  nombre,
  empresa,
  visitaA,
  motivo,
  identificacion,
  fechaHora
}

y genere el formato requerido por la tecnología Brother seleccionada.

26. NO UTILIZAR ZPL

Esta instrucción es crítica.

No debe quedar ningún código nuevo relacionado con:

ZPL
Zebra
^XA
^XZ
^FO
^FD
^PW
^LL
^BQN

Si ya existe código creado previamente intentando implementar Zebra/ZPL:

Identifícalo.
Elimínalo o reemplázalo.
No lo dejes como mecanismo activo.
No mantengas dos sistemas de impresión simultáneamente salvo que exista una razón explícita.

La impresora objetivo es exclusivamente:

Brother QL-810W
27. RESOLUCIÓN

La QL-810W trabaja con 300 dpi y puede manejar alta resolución.

Determina qué resolución es más apropiada para nuestro caso.

Si se utiliza 300 dpi:

53 mm / 25.4 * 300 ≈ 626 dots
84.5 mm / 25.4 * 300 ≈ 998 dots

Estos valores son aproximados y deben utilizarse solamente si corresponden al modo de impresión elegido.

No hardcodees dimensiones incorrectas.

La etiqueta final debe representar físicamente:

53 mm × 84.5 mm
28. ÁREA IMPRIMIBLE

No coloques elementos exactamente en los bordes.

Considera márgenes de seguridad.

El contenido debe quedar completamente dentro de:

53 mm × 84.5 mm

No permitir que:

Logo.
Nombre.
Folio.
Texto.
QR.
Fecha.

se corten.

29. MANEJO DE TEXTO LARGO

Probar especialmente:

Juan Carlos Hernández Rodríguez
Empresa Mexicana de Servicios Industriales
María Fernanda González Hernández

y motivos largos.

El sistema debe adaptar el contenido.

Prioridad:

No salir del área.
Mantener legibilidad.
Mantener jerarquía.
Reducir tamaño únicamente cuando sea necesario.
30. DATOS DINÁMICOS

No hardcodear ningún dato del visitante.

Ejemplo:

folio = "000123"
nombre = "Juan Pérez"
empresa = "Empresa XYZ"
visitaA = "María González"
motivo = "Servicio"
identificacion = "INE"
fechaHora = "2026-08-14T11:32:00"

debe producir una etiqueta completamente diferente si cambian los datos.

31. SEGURIDAD

Escapa correctamente cualquier dato que pueda interferir con el formato de impresión seleccionado.

No permitas que contenido proporcionado por usuarios pueda:

romper comandos de impresión;
inyectar comandos;
modificar la estructura de la etiqueta.

La información del visitante debe tratarse como datos, no como comandos.

32. FLUJO COMPLETO

El flujo final debe quedar:

Nuevo visitante
        ↓
Formulario
        ↓
Seleccionar "A quién visita"
        ↓
Popup de búsqueda
        ↓
Seleccionar VisitHost
        ↓
Registrar visitante
        ↓
Persistir en PostgreSQL
        ↓
Generar folio
        ↓
Generar gafete
        ↓
Preview
        ↓
Enviar a Brother QL-810W
        ↓
Imprimir
33. BASE DE DATOS

No modificar innecesariamente la estructura existente de visitantes.

El gafete debe utilizar los datos ya persistidos.

Especialmente:

Visitor
    ↓
VisitHost

El valor de "A quién visita" debe provenir de la relación existente con VisitHost.

No volver a almacenar únicamente el nombre como string si ya existe la relación.

34. PRUEBAS VISUALES

Probar al menos:

Caso 1
Nombre:
Juan Pérez


Empresa:
Empresa XYZ
Caso 2
Nombre:
Juan Carlos Hernández Rodríguez


Empresa:
Empresa Mexicana de Servicios Industriales
Caso 3

Todos los campos largos.

Verificar:

El contenido cabe.
No existen colores diferentes de blanco/negro.
El logo es legible.
El QR es escaneable.
El folio es legible.
El gafete conserva 53 × 84.5 mm.
No existen cortes.
No existen elementos fuera del área.
35. VERIFICACIÓN DE COLOR

Antes de considerar terminada la tarea, revisa específicamente el componente.

No debe existir dentro del gafete:

bg-slate-*
text-slate-*
border-slate-*
text-gray-*
bg-gray-*
border-gray-*
blue-*
red-*
green-*

ni estilos equivalentes que introduzcan colores adicionales.

Todo debe reducirse a:

#000000
#FFFFFF

La impresora debe recibir una representación monocromática.

36. README

Actualiza README.md con:

Impresión de gafetes

Documentar:

Brother QL-810W.
Resolución utilizada.
Tamaño 53 × 84.5 mm.
Orientación vertical.
Blanco y negro.
Tecnología de impresión utilizada.
Dependencias.
Configuración.
Comunicación con impresora.
USB/Wi-Fi si aplica.
Cómo realizar una prueba.
Cómo solucionar problemas de conexión.
Cómo verificar que la etiqueta tenga las dimensiones correctas.

No documentar ZPL como solución.

37. DOCUMENTACIÓN DEL AGENTE

Actualizar también el contexto para agentes de IA.

Dejar explícito:

Printer:
Brother QL-810W


Badge:
53 mm × 84.5 mm


Orientation:
Portrait


Colors:
Black + White only


Printing:
Brother-compatible implementation


NOT:
Zebra
ZPL

Esto es importante para que futuros agentes no vuelvan a implementar ZPL por error.

38. NO MODIFICAR FUNCIONALIDADES NO RELACIONADAS

No modificar innecesariamente:

Login.
Dashboard.
Usuarios.
Superadmin.
VisitHosts.
Personal.
Registros.
Llaves.
Auditoría.
Base de datos.

El objetivo de esta tarea es exclusivamente:

Actualizar impresión del gafete
+
Cambiar impresora objetivo
+
Cambiar dimensiones
+
Cambiar diseño
+
Cambiar colores
39. VALIDACIÓN FINAL

Ejecutar:

npm run typecheck
npm run lint
npm run build

Corregir cualquier error generado.

Después verificar:

El visitante puede registrarse.
El gafete se genera.
El preview tiene proporción 53 × 84.5 mm.
El preview es exclusivamente blanco y negro.
El logo aparece correctamente.
El QR aparece correctamente.
El QR contiene los datos esperados.
El mecanismo de impresión es compatible con Brother QL-810W.
No existe ningún código ZPL/Zebra activo.
La etiqueta física corresponde a 53 × 84.5 mm.
No se corta ningún contenido.
Los textos largos se manejan correctamente.
CRITERIO DE ÉXITO

La implementación final debe representar este flujo:

                CODA
                  │
                  ▼
          Registro visitante
                  │
                  ▼
          Datos persistidos
                  │
                  ▼
        GafeteVisitante
          ┌───────┴───────┐
          │               │
          ▼               ▼
       Preview       Generador Brother
          │               │
          │               ▼
          │        Brother QL-810W
          │               │
          │               ▼
          │         Etiqueta física
          │
          ▼
      53 × 84.5 mm

El resultado físico debe ser:

┌───────────────────┐
│                   │
│ LOGO    VISITANTE │
│───────────────────│
│                   │
│ NOMBRE            │
│ Empresa           │
│                   │
│ FOLIO #000123     │
│───────────────────│
│                   │
│ VISITA A          │
│ Juan Pérez        │
│                   │
│ MOTIVO            │
│ Servicio          │
│                   │
│ IDENTIFICACIÓN    │
│ INE               │
│───────────────────│
│                   │
│ 14/08/2026    QR  │
│ 11:32             │
│                   │
└───────────────────┘


ANCHO: 53 mm
ALTO: 84.5 mm


COLORES:
████ NEGRO
░░░░ BLANCO


NINGÚN OTRO COLOR.

La solución debe estar específicamente diseñada para la Brother QL-810W, no para Zebra.

Antes de implementar cualquier protocolo de impresión, consulta la documentación oficial de Brother para determinar la tecnología más apropiada para enviar la etiqueta desde nuestra aplicación.



**Una precisión importante:** no le pediría al agente que convierta obligatoriamente el logo a "blanco y neg