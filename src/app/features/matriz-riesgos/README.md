# Matriz de riesgos GTC 45

Feature autenticada disponible en `/matriz-riesgos`. Permite seleccionar una
empresa y gestionar la jerarquía:

`proceso/actividad → peligro → evaluación → controles`.

## Contrato

Consume la API del backend bajo `environment.apiBaseUrl`:

- `GET /empresas`
- `GET /empresas/{id}/matriz-riesgos`
- CRUD de `/procesos-actividades`, `/peligros` y `/controles-riesgo`
- `PUT /peligros/{id}/evaluacion`

La fuente de verdad es
`sst-auditor-agent-pro-backend/ai-specs/specs/api-spec.yml`.

## Reglas

- El formulario de evaluación envía únicamente ND, NE y NC.
- NP, NR, interpretación y aceptabilidad siempre se muestran desde la
  respuesta del backend.
- D1: ND bajo es `0`; el backend devuelve NP=0, NR=0 e interpretación IV.
- Una evaluación pertenece a un solo peligro y se guarda mediante upsert.
- EPP como único control muestra una advertencia no bloqueante.
- `CONSULTA` tiene vista de solo lectura. `ADMINISTRADOR` y `AUDITOR_SST`
  ven acciones de escritura; el backend mantiene la autorización real.
- Eliminar un proceso o peligro requiere confirmación y refleja el CASCADE al
  recargar la matriz.

## Presentación

En escritorio se usan secciones compactas dentro de un acordeón por proceso.
En móvil se apilan como tarjetas para evitar que un scroll horizontal sea
necesario para comprender la matriz.
