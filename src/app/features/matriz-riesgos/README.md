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
- NP, NR, interpretación y aceptabilidad **persistidos** siempre vienen de la
  respuesta del backend.
- En el diálogo hay **vista previa local** (`ServicioCalculoRiesgoGtc45`) que
  espeja las reglas de dominio mientras el usuario elige ND/NE/NC. Si al
  guardar la API devolviera valores distintos, gana la API.
- Fórmulas: NP = ND × NE; NR = NP × NC.
- Interpretación (tabla A.3): I 600–4000; II 150–500; III 40–120; IV 0–20.
- Aceptabilidad: I→NO_ACEPTABLE; II→ACEPTABLE_CON_CONTROL; III→MEJORABLE;
  IV→ACEPTABLE.
- D1: ND bajo es `0`; preview y backend producen NP=0, NR=0 e interpretación IV.
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

El componente `app-semaforo-riesgo` muestra el nivel I–IV con color y etiqueta
de aceptabilidad (diálogo de preview y tarjeta de evaluación).
