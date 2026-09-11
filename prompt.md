# Prompt: Edición inline de horas + módulo de reportes de pago

## Contexto

Plataforma existente de control de asistencia que genera un documento "Solicitud de Transferencia" (ver plantilla adjunta) usado actualmente para pagar becas de prácticas profesionales. Se requieren dos cambios mayores.

Antes de escribir código: **inspeccionar el esquema actual** de la base de datos y los componentes existentes relacionados con registros de entrada/salida, roles de usuario y generación de PDF. No asumir que estas piezas no existen — reutilizar lo que ya haya.

---

## CAMBIO 1 — Edición inline de horas (rol admin)

**Objetivo:** un usuario con rol admin debe poder corregir directamente, desde la tabla/vista de asistencia, cualquier campo relacionado con hora de entrada u hora de salida de un empleado, para los casos en que el registro biométrico/checador no se generó.

**Requisitos:**
- Edición inline (sin modal separado si la UX actual lo permite; si no, evaluar la opción más simple compatible con la arquitectura existente).
- Solo el rol admin puede editar. Verificar en el proyecto si ese rol ya existe; si no, señalarlo como bloqueante antes de continuar.
- **Auditoría obligatoria**: cada edición debe registrar valor anterior, valor nuevo, usuario que hizo el cambio, y timestamp del cambio. Esto es un requisito no negociable por tratarse de datos que alimentan pagos.
- Integrar este registro en el **sistema de logs ya existente en la plataforma** (no crear un sistema de logs paralelo). Verificar el mecanismo de logging actual y reutilizarlo.
- La visibilidad/monitoreo de esta sección específica de logs (ediciones de horas e importes) debe quedar restringida al rol **superadmin** únicamente — el rol admin puede editar, pero no necesariamente puede auditar sus propios cambios ni los de otros admins. Confirmar si el rol superadmin ya existe en el sistema de permisos; si no, señalarlo como bloqueante.
- Validación: no permitir que hora de salida sea anterior a hora de entrada; no permitir horas fuera de un rango razonable (ej. 00:00–23:59).

---

## CAMBIO 2 — Módulo de reportes (nueva pestaña)

Hay **dos tipos de reporte con plantillas distintas**. No compartir la misma plantilla entre ambos.

### 2.1 Reporte de practicantes (pago por hora)

**Periodo de cálculo:** quincenal fijo — del 1 al 15, y del 16 al último día de cada mes (el "último día" varía según el mes, calcularlo dinámicamente, no hardcodear 30/31).

**Flujo:**
1. El usuario debe seleccionar primero un practicante específico. Sin selección, no se muestran cálculos de horas ni de pago (deshabilitar la sección de cálculo hasta que haya selección).
2. Con el practicante y el rango de quincena seleccionados, calcular horas trabajadas por día usando los registros de entrada/salida (incluyendo cualquier corrección hecha vía Cambio 1).

**Regla de redondeo (CONFIRMADA):**
- Si un día se trabajó entre X y X.49 horas, redondear hacia abajo a X; si se trabajó X.5 horas o más, redondear hacia arriba a X+1. Esta lógica aplica de manera uniforme a **cualquier** número de horas del día, no solo al límite 7/8 — incluyendo casos borde poco frecuentes (ej. jornadas muy cortas o registros parciales).
- Implementar como función aislada `redondearHoras(horasDecimal)` con pruebas unitarias que cubran múltiples rangos de hora (no solo 7/8), para poder ajustarla fácilmente si el negocio la corrige más adelante.

**Cálculo de pago:**
- Tarifa por hora: aplica **únicamente a practicantes**. Valor por defecto $45 MXN.
- La tarifa es **configurable por reporte** en el momento de generarlo — no es un valor global del sistema ni un valor fijo por practicante individual. Cada vez que se genera un reporte, el usuario puede ajustar la tarifa usada para ese cálculo específico.
- Importe total = suma de horas redondeadas de todos los días del periodo × tarifa por hora.
- Generar también el importe en letras (formato "SON [CANTIDAD EN LETRAS] PESOS XX/100 M.N.") de forma dinámica — no como texto fijo.

**Campos del documento (rellenables):**
- Beneficiario (texto libre)
- Importe (número y letras, calculado automáticamente por defecto). **Puede ser sobreescrito manualmente** en caso de mal cálculo o confusión, pero cualquier sobreescritura debe quedar registrada en los logs del sistema (valor calculado original, valor final usado, usuario, timestamp) — mismo mecanismo de auditoría que el Cambio 1.
- Solicitado por (texto libre)
- Autorizado por (texto libre)
- Concepto (texto libre, default sugerido "BECA PRACTICAS PROFESIONALES")
- Alumno (automático, según practicante seleccionado)
- Desglose de horas por día del periodo (fecha, hora entrada, hora salida, horas redondeadas del día)
- Total de horas del periodo

**Exportación:**
- PDF, una sola hoja.
- Debe incluir el logo `safe-demo_logo-blc-Photoroom.png` junto con el siguiente encabezado de empresa (texto obligatorio, no modificar redacción):
  ```
  DEMO TECHNIC S. DE R.L. DE C.V.
  AVE LUIS G. URBINA 11527 COMPLEJO INDUSTRIAL CHIHUAHUA
  C.P 31109 TEL(614) 442-21-00 FAX. (614) 442-21-09

  SOLICITUD DE TRANSFERENCIA
  ```
- Este título ("SOLICITUD DE TRANSFERENCIA") aplica a este reporte porque es, efectivamente, una solicitud de transferencia de pago.
- Mejorar estéticamente respecto a la plantilla actual (adjunta como referencia) — tipografía, espaciado y jerarquía visual más cuidados, manteniendo todos los campos obligatorios.
- Si el periodo tiene tantos días que no cabe cómodamente en una hoja con buena legibilidad, priorizar legibilidad sobre forzar que quepa todo — definir un tamaño de fuente mínimo aceptable y, si aun así no cabe, usar una segunda página solo para el desglose (no para el encabezado/firma).

### 2.2 Reporte general (limpieza, transportistas, seguridad, etc.)

**Diferencias clave respecto al 2.1 — NO es la misma plantilla:**
- Mismo periodo quincenal (1–15 / 16–fin de mes).
- No incluye Beneficiario, Importe, ni cálculo de pago — es un reporte informativo de horas, no una solicitud de transferencia.
- Incluye múltiples empleados en un mismo reporte (no se selecciona uno solo).
- Para cada empleado: total de horas del periodo + su propio desglose de horas, presentado de forma claramente separada por empleado para evitar confusión entre personas.
- Debe incluir el mismo logo `safe-demo_logo-blc-Photoroom.png`, junto con el mismo encabezado de empresa que el reporte 2.1:
  ```
  DEMO TECHNIC S. DE R.L. DE C.V.
  AVE LUIS G. URBINA 11527 COMPLEJO INDUSTRIAL CHIHUAHUA
  C.P 31109 TEL(614) 442-21-00 FAX. (614) 442-21-09
  ```
  **PENDIENTE DE CONFIRMAR:** el título "SOLICITUD DE TRANSFERENCIA" no aplica literalmente a este reporte, ya que no es una solicitud de pago (no tiene beneficiario ni importe). Título sugerido por defecto: "REPORTE DE HORAS" (indicando la quincena correspondiente). Confirmar con negocio si debe usarse este título genérico o si de todas formas debe decir "SOLICITUD DE TRANSFERENCIA" aunque no aplique técnicamente.
- Igual exportable a PDF.
- **Manejo de escala (CONFIRMADO):** la paginación a múltiples hojas es aceptable si el número de empleados/días no permite mantener buena legibilidad en una sola página. Priorizar legibilidad sobre forzar todo en una hoja. Mantener el logo y encabezado consistentes en cada página adicional.

---

## Regla general — manejo de ausencias

**CONFIRMADO:** un día sin ningún registro de entrada/salida cuenta como **0 horas** en el desglose y en el total del periodo — no se excluye de la tabla, simplemente aparece con 0 horas trabajadas (y, por lo tanto, sin pago para ese día). Esto aplica tanto al reporte de practicantes (2.1) como al general (2.2).

---

## Validación final requerida

1. Typecheck.
2. Lint.
3. Build.
4. Prueba con un practicante con datos reales/de prueba, verificando que el redondeo y el importe calculado coincidan con un cálculo manual de control.
5. Prueba del reporte general con al menos 3 empleados para verificar que el desglose no se confunda entre personas.
6. Exportación real a PDF de ambos reportes, revisando que quepan legiblemente y que el logo aparezca correctamente.
7. Confirmar que la edición inline de horas registra correctamente la auditoría (valor anterior, nuevo, usuario, timestamp).

Reportar al finalizar: causa de cualquier decisión de diseño tomada por ambigüedad, archivos modificados, resultado de typecheck/lint/build, y capturas o descripción del PDF resultante de ambos reportes.