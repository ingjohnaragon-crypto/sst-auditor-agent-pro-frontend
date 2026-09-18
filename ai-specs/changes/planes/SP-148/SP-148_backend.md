# Plan de verificación: SP-148 / SP-199 / SP-200 — Motor GTC 45 (backend)

## 1. Resumen

SP-199 y SP-200 son subtareas de **dominio backend**. El cálculo ya está
implementado en la matriz GTC 45 (línea SP-192):

- SP-199: `nivel_probabilidad = nd * ne`
- SP-200: `nivel_riesgo`, `interpretar_nr`, `aceptabilidad`

Este plan **no pide reimplementar**: verificar tests, confirmar contrato PUT y
cerrar las subtareas en Jira. El trabajo Angular (preview + semáforo) está en
`SP-148_frontend.md` / SP-201.

- **Stack**: `python-fastapi`
- **Repo**: `sst-auditor-agent-pro-backend`

## Estimación de puntos de historia

<!-- STORY_POINTS:0 -->
- **Esfuerzo restante**: 0–1 (solo verificación).
- **SP-199**: 2 (ya entregados).
- **SP-200**: 3 (ya entregados).
<!-- /STORY_POINTS -->

## 2. Archivos de referencia

- `src/domain/models/evaluacion_riesgo.py` — `crear`, `recalcular`, `interpretar_nr`
- `src/domain/models/gtc45.py` — sets ND/NE/NC, mapa de aceptabilidad
- `src/presentation/routers/matriz_riesgos_router.py` — PUT evaluación
- `tests/integration/test_matriz_riesgos.py`

## 3. Pasos

1. Correr `pytest tests/integration/test_matriz_riesgos.py -q` (y unitarios de dominio si hay).
2. Confirmar casos: (10,4,100)→ NP40 NR4000 I; ND=0 → IV.
3. Confirmar que el body de escritura solo usa ND/NE/NC.
4. `os-transition SP-199 "Done"` y `os-transition SP-200 "Done"` (o equivalente).
5. No abrir `feature/*-backend` salvo bug real vs tabla A.3.

## 4. Relación con el frontend

El FE espeja las mismas reglas en `ServicioCalculoRiesgoGtc45` solo para preview.
Cualquier cambio de rangos A.3 debe hacerse primero en dominio BE y luego en el espejo FE.
