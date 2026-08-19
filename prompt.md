# Corrección definitiva — Brother QL-810W imprime blanco

Tenemos un problema confirmado en el flujo de impresión.

## Estado actual

La Brother QL-810W:

* recibe correctamente el trabajo;
* tiene comunicación TCP funcionando;
* reconoce correctamente el soporte DK-4205;
* imprime la longitud correcta;
* realiza el corte correctamente;

PERO:

**el diseño sale completamente blanco.**

## Causa probable ya identificada

`generateBrotherRasterJob()` recibe opcionalmente:

```ts
customBitmapBuffer?: Uint8Array
```

y el contenido negro del Raster solamente se genera cuando:

```ts
if (customBitmapBuffer) {
   ...
}
```

Actualmente `sendToBrotherNetworkPrinter()` llama:

```ts
const binaryJob = generateBrotherRasterJob(data, options);
```

sin proporcionar `customBitmapBuffer`.

Por lo tanto, el Raster se está generando sin píxeles negros.

Esto debe corregirse.

---

# OBJETIVO

Conectar correctamente el diseño visual del gafete con la generación del Brother Raster.

El flujo debe ser:

```text
GafeteVisitante
        ↓
Diseño visual
        ↓
Bitmap 1bpp
        ↓
customBitmapBuffer
        ↓
generateBrotherRasterJob()
        ↓
Brother Raster Command Stream
        ↓
TCP 10.33.31.94:9100
        ↓
Brother QL-810W
```

NO queremos simplemente enviar el componente HTML a la impresora.

La QL-810W necesita recibir el bitmap convertido al formato Brother Raster.

---

# IMPORTANTE: NO modificar lo que ya funciona

NO modificar:

* IP 10.33.31.94
* Puerto 9100
* comunicación TCP
* endpoint `/api/print/brother`
* tipo de soporte
* DK-4205
* Continuous Length
* media width = 62 mm
* `mediaInfo[3] = 0x8E`
* `mediaInfo[4] = 0x0A`
* `mediaInfo[5] = 62`
* `mediaInfo[6] = 0`
* comando de corte que ya funciona
* longitud física que ya funciona

La impresora ya acepta el trabajo y corta correctamente.

El problema ahora es exclusivamente:

**el bitmap que llega al Raster está vacío/no contiene los píxeles del diseño.**

---

# GEOMETRÍA

Recordar la diferencia:

## Soporte físico

```text
62 mm de ancho
DK-4205 continuous
```

## Diseño útil

```text
52 mm de ancho
```

## Longitud de corte

```text
54 mm
```

NO interpretar 52 × 54 mm como el tamaño del soporte.

El Raster debe continuar trabajando sobre el ancho físico que requiere la QL-810W.

---

# TAREA 1 — Encontrar dónde se genera actualmente el bitmap

Buscar en todo el proyecto:

```text
customBitmapBuffer
```

y también:

```text
canvas
getImageData
ImageData
Uint8Array
1bpp
bitmap
raster
```

Determinar si ya existe alguna función que convierta el diseño del gafete a bitmap 1bpp.

Si existe:

* reutilizarla;
* no crear otra implementación;
* conectar su resultado con `generateBrotherRasterJob()`.

Si NO existe:

crear una función pequeña y aislada para convertir el diseño del gafete a un bitmap 1bpp.

---

# TAREA 2 — El diseño visual debe convertirse a bitmap

El diseño actual está en:

```text
components/GafeteVisitante.tsx
```

Ese componente contiene:

* logo;
* VISITANTE;
* nombre;
* empresa;
* folio;
* visita A;
* motivo;
* identificación;
* fecha;
* hora;
* QR.

El HTML/React NO puede enviarse directamente a la Brother.

Necesitamos rasterizar ese diseño.

La solución debe producir:

```text
Uint8Array
```

donde:

```text
1 = píxel negro
0 = píxel blanco
```

en formato 1bpp MSB-first, compatible con `generateBrotherRasterJob()`.

---

# TAREA 3 — NO utilizar una captura visual del navegador si puede evitarse

Antes de agregar una dependencia como:

* html2canvas
* puppeteer
* playwright
* chromium
* screenshot tools

revisar si el proyecto ya tiene una forma de generar el bitmap.

Preferir una implementación determinística para impresión.

Si el diseño visual actual necesita ser rasterizado desde React/HTML, evaluar la solución mínima compatible con la arquitectura existente.

NO introducir dependencias pesadas innecesariamente.

---

# TAREA 4 — Validar las dimensiones del bitmap

El bitmap debe representar:

```text
Ancho útil: 52 mm
Longitud: 54 mm
Resolución: 300 DPI
```

Pero recordar:

```text
MEDIA WIDTH = 62 mm
```

El diseño de 52 mm debe posicionarse dentro del ancho físico del Raster.

No reemplazar el ancho físico de 62 mm por 52 mm.

---

# TAREA 5 — Verificar el problema con una prueba de diagnóstico

Antes de conectar el diseño completo, realizar una prueba temporal.

Crear un bitmap de prueba con:

* un rectángulo negro claramente visible;
* ocupando aproximadamente el área útil de 52 × 54 mm;
* centrado dentro del ancho físico de 62 mm.

Enviar ese bitmap a:

```text
generateBrotherRasterJob()
```

Si el rectángulo aparece físicamente:

```text
Raster ✅
TCP ✅
Soporte ✅
Bitmap → Raster ✅
```

entonces conectar el diseño real.

NO dejar el rectángulo de prueba en producción.

---

# TAREA 6 — Validar el bitmap real

Antes de enviar el Raster, registrar temporalmente:

```text
bitmap width
bitmap height
bitmap length
black pixel count
```

Queremos comprobar que:

```text
black pixel count > 0
```

Si:

```text
black pixel count = 0
```

la conversión del diseño sigue fallando.

---

# TAREA 7 — Mantener el formato esperado por generateBrotherRasterJob()

Actualmente la función hace:

```ts
const bytesPerBadgeRow = Math.ceil(dims.widthDots / 8);
```

y luego interpreta el buffer como:

```text
1 bit por píxel
MSB first
```

No cambiar esta convención sin necesidad.

Si el bitmap generado utiliza otra convención, convertirlo antes de pasarlo a:

```ts
generateBrotherRasterJob()
```

---

# TAREA 8 — Revisar el flujo completo

El resultado final debe ser:

```text
handleImprimirBrother()
        ↓
getVisitorData()
        ↓
generar/renderizar diseño
        ↓
crear bitmap 1bpp
        ↓
customBitmapBuffer
        ↓
sendToBrotherNetworkPrinter()
        ↓
generateBrotherRasterJob(data, options, customBitmapBuffer)
        ↓
Base64
        ↓
POST /api/print/brother
        ↓
TCP 10.33.31.94:9100
        ↓
Brother QL-810W
```

Actualmente el punto sospechoso es:

```ts
generateBrotherRasterJob(data, options)
```

que debe terminar recibiendo también el bitmap real:

```ts
generateBrotherRasterJob(
    data,
    options,
    customBitmapBuffer
)
```

Pero NO agregues simplemente un buffer vacío.

Debe ser el bitmap real del diseño.

---

# TAREA 9 — Mantener el diseño actual

El diseño visual puede continuar modificándose independientemente del protocolo Brother.

Mantener:

* logo;
* nombre;
* empresa;
* folio;
* visita;
* motivo;
* identificación;
* fecha;
* hora;
* QR.

El rediseño visual debe reflejarse en el bitmap que se imprime.

IMPORTANTE:

Si el diseño cambia en `GafeteVisitante.tsx`, el bitmap de impresión debe reflejar ese cambio.

No queremos tener:

```text
Pantalla → diseño A
Impresora → diseño B
```

Queremos:

```text
Pantalla → diseño actual
Impresora → mismo diseño actual
```

---

# TAREA 10 — Blanco y negro

El bitmap final debe ser estrictamente 1bpp:

```text
#000000
#FFFFFF
```

No utilizar:

* grayscale;
* antialiasing gris;
* colores;
* transparencias.

Si la rasterización produce grises, convertirlos mediante threshold a blanco/negro.

---

# CRITERIO DE ÉXITO

La prueba debe terminar mostrando:

```text
┌──────────────────────────────┐
│                              │
│       DISEÑO DEL GAFETE      │
│                              │
│     Nombre                  │
│     Empresa                 │
│     Folio                   │
│     Información             │
│     QR                      │
│                              │
└──────────────────────────────┘
```

en la cinta DK-4205.

La impresora debe:

* aceptar el trabajo;
* imprimir el diseño;
* cortar correctamente a la longitud configurada.

---

# RESTRICCIONES

NO:

* Zebra;
* ZPL;
* window.print();
* Chrome Print Dialog;
* PDF;
* Windows Print Spooler;
* cambiar media width de 62 mm;
* cambiar el tipo de soporte;
* cambiar `0x8E`;
* cambiar `0x0A`;
* crear un segundo sistema de impresión;
* introducir dependencias pesadas sin justificación.

SÍ:

* reutilizar `generateBrotherRasterJob()`;
* proporcionar un `customBitmapBuffer` real;
* conservar Brother Raster;
* conservar TCP;
* conservar DK-4205;
* conservar media width = 62 mm.

---

# VALIDACIÓN FINAL

Ejecutar:

1. Typecheck.
2. Lint.
3. Build.
4. Prueba del bitmap.
5. Verificar `black pixel count > 0`.
6. Prueba real de impresión.
7. Confirmar que el diseño aparece.
8. Confirmar que el corte sigue funcionando.

Al finalizar reportar únicamente:

1. Causa raíz.
2. Cómo se generó el bitmap.
3. Archivos modificados.
4. Resultado de typecheck/lint/build.
5. Resultado de impresión física.

No hacer refactors fuera de este problema.
