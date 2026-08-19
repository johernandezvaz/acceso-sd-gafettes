# Rediseño visual del gafete de visitante — orientación tipo identificación

Necesitamos modificar ÚNICAMENTE el diseño visual del componente del gafete de visitante.

NO modificar el sistema de impresión Brother, el Raster Command Stream, TCP, dimensiones del soporte, generación del bitmap ni el flujo de impresión.

El objetivo es que el gafete deje de verse como un gafete vertical tradicional y tenga una apariencia más cercana a una identificación.

---

## Estado actual

Actualmente el diseño se presenta de forma vertical:

```text
┌─────────────────────────┐
│ LOGO          VISITANTE │
├─────────────────────────┤
│ NOMBRE                  │
│ EMPRESA                 │
│ FOLIO                   │
├─────────────────────────┤
│                         │
│ VISITA A                │
│ MOTIVO                  │
│ IDENTIFICACIÓN          │
│                         │
├─────────────────────────┤
│ FECHA              QR   │
└─────────────────────────┘
```

El resultado actual se ve demasiado parecido a un gafete vertical.

Queremos que visualmente se comporte más como una identificación.

---

# Objetivo visual

Rotar la COMPOSICIÓN DE LA INFORMACIÓN 90° para aprovechar mejor el formato físico.

IMPORTANTE:

No rotar físicamente la impresión mediante comandos Brother.

No modificar `rotateBitmap90CW()` salvo que sea estrictamente necesario.

La modificación debe hacerse principalmente en:

```text
components/GafeteVisitante.tsx
```

El objetivo es que el contenido visual tenga una orientación de identificación.

---

# Concepto visual deseado

Queremos algo conceptualmente parecido a:

```text
┌──────────────────────────────────────────────┐
│                                              │
│  LOGO                         VISITANTE       │
│                                              │
│  ┌─────────────┐  ┌───────────────────────┐ │
│  │             │  │ JOSÉ HERNÁNDEZ       │ │
│  │             │  │ DEMO TECHNIC          │ │
│  │     QR      │  │                       │ │
│  │             │  │ FOLIO #904178         │ │
│  │             │  │                       │ │
│  └─────────────┘  └───────────────────────┘ │
│                                              │
│  VISITA A                                    │
│  HERNANDEZ, VAZQUEZ, JOSE DE JESUS          │
│                                              │
│  MOTIVO              IDENTIFICACIÓN          │
│  Prueba de sistema   Gafete de empresa       │
│                                              │
│  19/08/2026          11:51                    │
│                                              │
└──────────────────────────────────────────────┘
```

La distribución exacta puede adaptarse al espacio disponible, pero debe transmitir claramente una estética de:

* identificación;
* tarjeta de acceso;
* badge corporativo;
* información compacta;
* lectura rápida.

---

# Reglas de diseño

## 1. Mantener toda la información actual

NO eliminar datos.

Debe continuar mostrando:

* Logo Safe Demo
* VISITANTE
* Nombre
* Empresa
* Folio
* Visita a
* Motivo
* Identificación
* Fecha
* Hora
* QR

El QR debe seguir utilizando exactamente los mismos datos actuales.

---

## 2. Cambiar la jerarquía visual

Dar mayor importancia a:

1. Nombre del visitante
2. Empresa
3. Folio
4. VISITANTE
5. QR

Los datos secundarios:

* Visita a
* Motivo
* Identificación
* Fecha
* Hora

deben ocupar menos espacio visual.

El nombre debe continuar siendo el elemento tipográfico más importante.

---

## 3. Apariencia de identificación

El diseño debe sentirse como una tarjeta de identificación y NO como un documento.

Usar:

* bordes definidos;
* divisiones limpias;
* espacios compactos;
* tipografía sans-serif;
* jerarquía clara;
* pocos elementos decorativos;
* alto contraste;
* apariencia corporativa.

Mantener estrictamente:

```text
#000000
#FFFFFF
```

No introducir colores adicionales.

---

# 4. Distribución recomendada

Utilizar una estructura aproximadamente así:

### Header

Parte superior:

```text
LOGO                              VISITANTE
```

Mantener el logo y el badge `VISITANTE`.

### Información principal

Crear una sección donde:

```text
QR + información principal
```

estén visualmente relacionados.

Por ejemplo:

```text
┌───────────┐
│           │    JOSÉ HERNÁNDEZ
│    QR     │    DEMO TECHNIC
│           │    FOLIO #904178
└───────────┘
```

El QR debe seguir siendo suficientemente grande para poder escanearse.

---

### Información secundaria

Debajo o al costado de la información principal:

```text
VISITA A
HERNANDEZ, VAZQUEZ, JOSE DE JESUS

MOTIVO                 IDENTIFICACIÓN
Prueba de sistema     Gafete de empresa
```

Evitar que estos campos ocupen una gran sección vertical vacía como ocurre actualmente.

---

### Footer

Fecha y hora pueden ir en una zona compacta:

```text
19/08/2026    11:51
```

No necesitan ocupar una sección completa del diseño.

---

# 5. Aprovechamiento del espacio

El diseño actual tiene una gran cantidad de espacio vacío en la sección central.

Eliminar ese espacio desperdiciado.

La información debe distribuirse de forma mucho más compacta.

La prioridad es:

```text
más información útil
menos espacio vacío
mejor jerarquía
apariencia de identificación
```

---

# 6. No cambiar las dimensiones de impresión

MUY IMPORTANTE:

Este cambio es exclusivamente visual.

NO modificar:

* Brother QL-810W
* DK-4205
* Media Width = 62 mm
* Continuous Length
* TCP 10.33.31.94:9100
* Brother Raster
* resolución
* generación del bitmap
* ancho físico de la cinta
* longitud de corte
* orientación del Raster
* `generateBrotherRasterJob()`
* `sendToBrotherNetworkPrinter()`
* `/api/print/brother`

NO cambiar:

```text
62 mm
```

porque representa el soporte físico.

El nuevo diseño visual debe adaptarse al espacio que ya utiliza el sistema de impresión.

---

# 7. No modificar datos

Mantener exactamente:

```ts
qrData
```

y la estructura actual:

```ts
{
  folio,
  nombre,
  empresa,
  fecha
}
```

No cambiar el contenido del QR.

Mantener:

```ts
formatBadgeDate()
MOTIVOS_MAP
IDENTIFICACIONES_MAP
```

---

# 8. Responsive / impresión

El componente debe seguir funcionando correctamente cuando:

* se visualiza en pantalla;
* se genera el bitmap;
* se imprime mediante Brother Raster.

No depender de:

* transformaciones CSS que puedan alterar incorrectamente el bitmap;
* `rotate()` sobre todo el componente;
* elementos que desaparezcan al rasterizar;
* fuentes externas;
* colores no soportados.

Preferir una nueva composición mediante:

```text
flex
grid
position
padding
gap
```

en lugar de simplemente hacer:

```css
transform: rotate(90deg)
```

a todo el gafete.

Queremos **rediseñar la composición**, no simplemente girar la imagen completa.

---

# 9. Mantener blanco y negro

Todo el componente debe seguir usando únicamente:

```text
background: #FFFFFF
color: #000000
border: #000000
```

El QR:

```text
fgColor="#000000"
bgColor="#FFFFFF"
```

Debe mantenerse.

---

# 10. Implementación

Antes de modificar:

1. Lee completamente `components/GafeteVisitante.tsx`.
2. Identifica todos los elementos actuales.
3. Mantén todos los datos y props.
4. Rediseña únicamente el JSX/layout/style.
5. No cambies la lógica de negocio.

Después:

1. Ejecuta typecheck.
2. Ejecuta lint si existe.
3. Ejecuta build si existe.
4. Verifica visualmente el componente.
5. Verifica que el QR continúe apareciendo.
6. Verifica que todos los campos continúen apareciendo.
7. Verifica que no se haya modificado el flujo de impresión.

---

# Criterio de éxito

El resultado debe verse claramente como una:

**IDENTIFICACIÓN CORPORATIVA DE VISITANTE**

y no como un:

**GAFETE VERTICAL TRADICIONAL**.

Debe aprovechar mucho mejor el espacio, eliminar el gran vacío central y colocar la información principal en una composición compacta y equilibrada.

La impresión Brother debe continuar funcionando exactamente igual que antes.

Al finalizar reportar únicamente:

1. Archivo modificado.
2. Resumen de la nueva composición.
3. Resultado de typecheck/lint/build.
4. Confirmación de que el flujo de impresión Brother no fue modificado.
