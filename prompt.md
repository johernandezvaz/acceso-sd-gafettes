# Objetivo: Impresión directa Brother QL-810W por red

Necesito eliminar completamente el diálogo de impresión de Google Chrome para los gafetes de visitantes y enviar directamente el Brother Raster Command Stream a una Brother QL-810W mediante TCP/IP.

## Datos de la impresora

- Modelo: Brother QL-810W
- Nombre: Brother QL-810W
- IP: 10.33.31.94
- Puerto RAW TCP: 9100
- Conectividad verificada desde Windows:
  Test-NetConnection 10.33.31.94 -Port 9100
  TcpTestSucceeded: True

## Restricciones

NO usar:
- window.print()
- diálogo de impresión de Chrome
- impresión HTML/CSS del navegador
- PDF como intermediario
- Windows Print Dialog
- Zebra
- ZPL
- ^XA, ^XZ, ^FO, ^FD, ^PW, ^LL, ^BQN
- ningún comando específico de Zebra

La impresión debe utilizar exclusivamente el Brother QL Raster Command Stream existente en:

lib/printing/brother/

## Estado actual

Ya existe una implementación parcial:

- printer.ts contiene generateBrotherRasterJob()
- printer.ts contiene sendToBrotherNetworkPrinter()
- sendToBrotherNetworkPrinter() genera el Raster y hace POST a:
  /api/print/brother
- El payload se envía como Base64
- El puerto predeterminado es 9100
- También existe printViaBrowserDialog(), que actualmente usa window.print()

No dupliques esta lógica ni crees otro sistema de impresión si la implementación existente puede reutilizarse.

## Dimensiones obligatorias

Mantener exactamente:

- Ancho: 53 mm
- Alto: 84.5 mm
- Orientación: portrait / vertical
- 300 DPI
- Blanco y negro exclusivamente:
  #000000
  #FFFFFF

El generador existente ya define estas dimensiones. No modificar el formato Raster salvo que sea estrictamente necesario para que la QL-810W acepte correctamente el trabajo.

## Tarea

1. Analiza el flujo actual de impresión.
2. Identifica dónde se llama actualmente a printViaBrowserDialog() o window.print().
3. Reemplaza ese flujo por sendToBrotherNetworkPrinter().
4. Completa o corrige el endpoint backend /api/print/brother si es necesario.
5. El backend debe:
   - recibir IP, puerto y payloadBase64;
   - convertir Base64 a bytes;
   - abrir una conexión TCP hacia la impresora;
   - enviar los bytes directamente mediante socket;
   - esperar/validar el cierre o resultado de la conexión;
   - devolver JSON indicando success/error.
6. Por seguridad y simplicidad, considera que la IP de producción debe ser configurable mediante variable de entorno:
   BROTHER_PRINTER_IP=10.33.31.94
   BROTHER_PRINTER_PORT=9100
7. Si el proyecto ya tiene configuración de variables de entorno, reutiliza su patrón existente.
8. Evita enviar el Raster dos veces o regenerarlo innecesariamente.
9. No conviertas el Raster a otra representación.
10. No introduzcas dependencias nuevas si Node.js/Next.js ya permite resolverlo con APIs nativas.
11. Mantén el manejo de errores existente y devuelve mensajes útiles.
12. El frontend debe mostrar claramente:
   - impresión enviada correctamente;
   - impresora no disponible;
   - timeout;
   - error de conexión;
   - error del servidor.

## Eficiencia

Prioriza una implementación pequeña y directa:

Frontend:
VisitorBadgeData
→ generateBrotherRasterJob()
→ Base64
→ POST /api/print/brother

Backend:
POST /api/print/brother
→ Base64 decode
→ TCP socket 10.33.31.94:9100
→ socket.write()
→ respuesta JSON

No agregues abstracciones, servicios, clases o archivos innecesarios.

## Configuración

Idealmente:

BROTHER_PRINTER_IP=10.33.31.94
BROTHER_PRINTER_PORT=9100

Pero conserva la posibilidad de pasar IP/puerto desde el frontend únicamente si el proyecto actual realmente lo necesita.

## Importante

Antes de modificar código:

- Inspecciona los archivos relacionados con impresión.
- Identifica el flujo actual.
- Reutiliza las funciones existentes.
- No cambies generateBrotherRasterJob() si no es necesario.
- No cambies el diseño visual del gafete.
- No cambies dimensiones.
- No cambies el QR.
- No cambies el contenido del gafete.
- No cambies la orientación.

Después de implementar:

1. Ejecuta typecheck/lint/build según los scripts existentes.
2. Verifica que no queden llamadas a window.print() en el flujo de impresión del gafete.
3. Verifica que sendToBrotherNetworkPrinter() sea realmente utilizado.
4. Verifica que /api/print/brother exista y funcione.
5. Si es posible, realiza una prueba real contra:
   10.33.31.94:9100
6. No hagas cambios fuera del alcance de impresión.

## Criterio de éxito

Al presionar "Imprimir gafete":

Usuario
→ botón Imprimir
→ generateBrotherRasterJob()
→ /api/print/brother
→ TCP 10.33.31.94:9100
→ Brother QL-810W
→ gafete impreso

Sin abrir Google Chrome Print Dialog y sin intervención manual del usuario.

Al finalizar, proporciona únicamente:

1. Archivos modificados.
2. Resumen breve de cambios.
3. Cómo configurar la IP/puerto.
4. Resultado de typecheck/build.
5. Si la prueba TCP/impresión fue exitosa.