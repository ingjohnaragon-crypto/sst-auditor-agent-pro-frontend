# Plan de implementación: SP-148 — Motor de cálculo automatizado GTC 45 (frontend)

## 1. Resumen

SP-148 es una HU con **subtareas en dos capas**:

| Subtarea | Capa | Estado / plan |
|---|---|---|
| **SP-199** | Backend — NP = ND × NE | **Ya implementado** en dominio (SP-192). Solo verificar/cerrar. |
| **SP-200** | Backend — NR + interpretación + aceptabilidad | **Ya implementado** en dominio. Solo verificar/cerrar. |
| **SP-201** | Frontend — semáforo + preview | Alcance de **este** plan (`feature/SP-148-frontend`). |

Este documento es el plan **frontend**. El motor de persistencia no se reescribe: vive en
`evaluacion_riesgo.py` / `gtc45.py`. El FE añade:

1. Espejo local `ServicioCalculoRiesgoGtc45` (preview UX, no fuente de verdad).
2. `SemaforoRiesgoComponent` en diálogo (y opcionalmente en la página).

- **Stack activo**: `frontend-angular`.
- **Fuera de alcance FE**: endpoints nuevos; lógica de dominio Python; signal inputs.

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci) — incluye BE ya entregado + FE.
- **Justificación**: SP-199/SP-200 aportan la mayor parte de la lógica pero ya están
  en el backend; el esfuerzo pendiente de implementación es FE (preview + semáforo ≈ 3).
- **Subtareas**:

| Subtarea | Puntos | Capa | Nota |
|---|---:|---|---|
| SP-199 | 2 | Backend | Ya hecho — verificar tests y cerrar Jira. |
| SP-200 | 3 | Backend | Ya hecho — verificar tests y cerrar Jira. |
| SP-201 | 2 | Frontend | Semáforo + wiring; este plan. |

> FE no “implementa” SP-199/SP-200; solo espeja sus reglas para preview.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

### Backend (referencia — no modificar en este plan FE)

| Pieza | Ubicación |
|---|---|
| NP / NR / recalcular | `src/domain/models/evaluacion_riesgo.py` |
| Sets + aceptabilidad | `src/domain/models/gtc45.py` |
| PUT evaluación | `matriz_riesgos_router` → solo ND/NE/NC |
| Tests | `tests/integration/test_matriz_riesgos.py` (+ unitarios de dominio) |

### Frontend (baseline → objetivo)

| Pieza | Antes | Objetivo |
|---|---|---|
| Diálogo evaluación | Solo selects + aviso “backend calcula” | Preview en vivo + semáforo |
| Cálculo local | No existía | `ServicioCalculoRiesgoGtc45` |
| Color en lista | `claseInterpretacion()` inline | Semáforo reutilizable |

### Mapeo de subtareas

| Clave | Resumen | Pasos en este plan FE |
|---|---|---|
| SP-199 | NP en backend | Ninguno (verificar en repo backend) |
| SP-200 | NR/aceptabilidad en backend | Ninguno (verificar en repo backend) |
| SP-201 | Semáforo + preview Angular | Pasos 1–8 |

### Verificación backend sugerida (fuera de rama FE)

En `sst-auditor-agent-pro-backend`:

```bash
pytest tests/integration/test_matriz_riesgos.py -q
# y/o tests unitarios de EvaluacionRiesgo / interpretar_nr si existen
```

Confirmar casos: (10,4,100)→ NP40 NR4000 I; ND=0 → IV. Luego `os-transition SP-199 Done` / `SP-200 Done`.

## 3. Pasos de implementación (frontend)

### Paso 0: Rama FE

```bash
git checkout develop && git pull --ff-only origin develop
git checkout -b feature/SP-148-frontend
npm test
```

### Paso 1: Tipo `ResultadoCalculoGtc45`

- `modelos/matriz-riesgos.model.ts` — solo preview; no cambia `SolicitudEvaluacion`.

### Paso 2: Servicio espejo (soporte de SP-201, no cumple SP-199/200)

- `servicios/servicio-calculo-riesgo-gtc45.ts` + `.spec.ts`
- Misma tabla A.3 / sets que el backend; `null` si input inválido.
- Documentar en README: “espejo UX; persistencia = API”.

### Paso 3: `SemaforoRiesgoComponent` (SP-201)

- Carpeta completa con OnPush, `@Input()`, etiqueta + color I–IV.

### Paso 4: Wiring del diálogo

- `valueChanges` → preview + semáforo.
- `guardar()` solo ND/NE/NC.

### Paso 5: Tests FE

- Servicio espejo, semáforo, diálogo (preview + contrato de guardado).

### Paso 6: Página (opcional)

- Reutilizar semáforo en tarjeta de evaluación.

### Paso 7: README feature

- Preview local vs persistencia backend; apuntar a SP-199/SP-200 como dominio BE.

### Paso 8: Verificación FE

```bash
npm test && npm run test:coverage && ng build
```

## 4. Orden de implementación

1. (Opcional, otro repo) Verificar SP-199/SP-200 en backend y cerrar en Jira.
2. Paso 0 — rama FE.
3. Pasos 1–2 — modelo + servicio espejo.
4. Pasos 3–4 — semáforo + diálogo (SP-201).
5. Pasos 5–8 — tests, docs, verificación.

## 5. Testing Checklist

### Backend (SP-199 / SP-200)
- [ ] Tests de matriz/dominio verdes
- [ ] Casos NP/NR/I–IV documentados
- [ ] Subtareas cerradas en Jira

### Frontend (SP-201 + preview)
- [ ] `npm test` — 0 fallos
- [ ] `npm run test:coverage` ≥ 90 %
- [ ] Preview en vivo; `guardar()` solo ND/NE/NC
- [ ] Semáforo I–IV + vacío
- [ ] `ng build` OK

## 6. Tooling Reference

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |
| Backend verify | `pytest tests/integration/test_matriz_riesgos.py` |

## 7. Error Response Format

Sin API nueva. Contrato backend existente (español):

```json
{
  "exito": false,
  "codigo": "VALOR_GTC_INVALIDO",
  "mensaje": "Descripción legible",
  "detalle": null
}
```

Preview FE: input inválido → `null` (UI neutra), sin HTTP.

## 8. Dependencies

Ninguna nueva en FE. Backend sin dependencias nuevas.

## 9. Notes

- Branch FE: `feature/SP-148-frontend`.
- **No** tratar SP-199/SP-200 como tareas Angular en reviews/commits FE.
- Si se detecta divergencia FE↔BE en fórmulas, corregir el espejo FE o abrir bug de dominio; la API manda en persistencia.
- Tras FE: `os-commit SP-148`. Cierre de SP-199/SP-200 vía transición Jira tras verify BE.

## 10. Implementation Verification Checklist

- [ ] SP-199/SP-200: verificados en backend / cerrados en Jira
- [ ] SP-201: semáforo + preview en `feature/SP-148-frontend`
- [ ] PUT sin campos derivados desde el cliente
- [ ] Coverage FE ≥ 90 %
- [ ] Docs de feature actualizadas (capa BE vs FE)
