# Diagnóstico (estándares mínimos Res. 0312)

Pantalla SP-189: crear, calificar y finalizar autoevaluaciones. SP-204 pinta
el cumplimiento PHVA (`GET .../cumplimiento-phva`) en Inicio y junto a la matriz.

Diseño de referencia: mockup
[sst-audit-pro-mckp](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp)
(`StandardsView`). Se portan paleta slate/indigo, tarjetas `rounded-[2rem]`,
botones Cumple / No cumple / No aplica y tipografía Inter + JetBrains Mono.
No se portan Recharts, PDF, chat IA, GTC 45 ni plan de mejora.

## Rutas

| Ruta | Contenido |
|---|---|
| `/diagnostico` | Selector de empresa + iniciar + matriz |
| `/diagnostico/historico` | Histórico por empresa |
| `/diagnostico/:id` | Detalle; solo lectura si ya tiene `puntaje_total` |

Cualquier autenticado navega. Escritura (`Iniciar`, calificar, `Finalizar`)
solo `ADMINISTRADOR` y `AUDITOR_SST` vía `*appSiTieneRol`. El backend impone
`403 ACCESO_DENEGADO`.

## Endpoints

- `GET /empresas`
- `GET /estandares-minimos`
- `POST /autoevaluaciones` `{ empresa_id, fecha }`
- `GET /autoevaluaciones?empresa_id=`
- `GET /autoevaluaciones/{id}`
- `PUT /autoevaluaciones/{id}/calificaciones/{estandar_id}`
- `POST /autoevaluaciones/{id}/finalizar`
- `GET /autoevaluaciones/{id}/cumplimiento-phva`

## Evidencias (SP-153)

Sobre un ítem ya calificado (`calificacion.id`, no el id del estándar):

- `POST /calificaciones-estandar/{calificacion_id}/archivo` — `FormData` con un solo campo `archivo` (PDF, JPEG o PNG, máx. 10 MB).
- `GET /calificaciones-estandar/{calificacion_id}/evidencias` — lista activas.
- `POST /evidencias/{id}/enlace-descarga` — URL de corta vida. PDF en iframe, imagen en `img`. Cada apertura pide un enlace nuevo; no se guarda en `localStorage`.

La zona de carga solo se muestra a `ADMINISTRADOR` y `AUDITOR_SST`. El cliente valida tipo y tamaño antes de llamar. El servidor valida el contenido.

Decimales como `string`. El cliente no recalcula el puntaje 0312.

## UI

- Avance = ítems calificados / 60. Finalizar se habilita en 60/60, solo en la última fase.
- La matriz se recorre por fases PHVA (Planear → Hacer → Verificar → Actuar): una etapa a la vez, con stepper y Continuar / Fase anterior.
- Observaciones: debounce 400 ms; el resultado dispara PUT inmediato.
- Vacío de empresas: mensaje orientativo (alta de empresas fuera de alcance).
- Cumplimiento PHVA: 4 barras CSS (`porcentaje_cumplimiento` del API), brecha por fase y al umbral 85 %. Sin librería de charts. Estados carga / vacío (sin HTTP) / error / listo.
