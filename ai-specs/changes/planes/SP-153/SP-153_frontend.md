# Plan de implementación frontend: SP-153 Subida de Evidencias de Cumplimiento (Documental)

## 1. Resumen

En el frontend Angular, permitir al responsable de SST **adjuntar PDF/JPEG/PNG** a cada estándar ya calificado en el diagnóstico (Res. 0312) y **revisar** esos soportes sin recargar la autoevaluación.

Consume la API ya desplegada en backend:

- Carga: `POST /api/v1/calificaciones-estandar/{calificacion_id}/archivo` (`multipart/form-data`, campo `archivo`) — **SP-214 hecho**.
- Listado: `GET /api/v1/calificaciones-estandar/{calificacion_id}/evidencias`.
- Visor: `POST /api/v1/evidencias/{id}/enlace-descarga` → abrir la `url` (PDF en iframe / imagen en `img`).
- Baja lógica (opcional en UI): `DELETE /api/v1/evidencias/{id}` (contrato SP-151; no borra binario).

- **Stack activo**: `frontend-angular` (Angular 17 standalone, Tailwind, Jest, OnPush).
- **Feature ancla**: `src/app/features/diagnostico/` (ítem de matriz ya existente).
- **Idioma**: español en identificadores, mensajes, tests y docs.

**Alcance en este repositorio**: **SP-215** + **SP-216**.

**Fuera de alcance**:

- SP-214 (Python) — ya en `develop` del backend.
- Reutilizar el POST JSON de metadatos sin binario.
- S3, historias clínicas, Material drag-drop pesado.
- Persistencia del JWT en `localStorage` para el enlace de descarga.

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total (frontend)**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Zona de arrastre + listado + servicio multipart + visor con canje de enlace de corta vida. El API de carga/descarga ya existe; el mayor riesgo es disponer del `calificacion_id` (hoy el modelo frontend no expone `id` de calificación). Coincide con SP-215 (3) + SP-216 (2). La HU backend en Jira suma 8 por SP-214; este plan solo cubre el lado Angular.
- **Subtareas**:
  | Subtarea | Puntos | Nota |
  |---|---|---|
  | SP-214 | 5 | Backend — **no se implementa aquí** |
  | SP-215 | 3 | Drag-and-drop + multipart + lista de evidencias en el ítem |
  | SP-216 | 2 | Visor PDF/imagen vía enlace-descarga |
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas / archivos afectados:

| Área | Archivos |
|---|---|
| Modelos | `features/diagnostico/modelos/calificacion-estandar.ts` (añadir `id`); `evidencia.ts` (nuevo); `respuesta-enlace-descarga.ts` (nuevo) |
| Servicios | `features/diagnostico/servicios/servicio-evidencias.ts` (+ spec) |
| Componentes | `zona-carga-evidencia/` (nuevo); `visor-evidencia/` (nuevo); integrar en `item-calificacion/` |
| Shared (opcional) | Reutilizar patrones de `campo-carga-archivo` (accept, nombres); la zona de arrastre puede ser componente de feature, no hace falta CVA |
| Auth / RBAC | `*appSiTieneRol="ROLES_ESCRITURA_DIAGNOSTICO"`; ocultar carga a `CONSULTA` |
| Utilidades | `mensaje-error-http.ts` (reutilizar) |
| Docs | `features/diagnostico/README.md` (sección evidencias) |
| Tests | specs junto a cada archivo |

### Prerrequisito de contrato

El path de carga exige **`calificacion_id`** (UUID de la fila `calificaciones_estandar`), **no** el `estandar_id`.

Hoy `CalificacionEstandar` solo tiene `estandar_id`. El backend ya puede devolver `id` en `RespuestaCalificacionEstandar`. El plan **debe** mapear `id` en el cliente tras calificar / al cargar el detalle. Sin `id`, no se muestra la zona de carga (o se muestra deshabilitada con mensaje).

### Mapeo de subtareas

| Clave | Resumen | Paso(s) |
|---|---|---|
| `SP-214` | API multipart Python | Fuera de este repo |
| `SP-215` | Drag-and-drop de evidencias | Pasos 1–5, 7 (parcial) |
| `SP-216` | Visor PDF/imagen | Pasos 6–7 |

## 3. Pasos de implementación

### Paso 0: Crear la rama feature

- **Rama**: `feature/SP-153-frontend` (desde `develop`).
- **Comandos**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-153-frontend
  ```
- Confirmar que el backend local (o mock) responde 201 en `POST .../archivo` y 200 en `POST .../enlace-descarga`.

### Paso 1: Modelos TypeScript

- Extender `CalificacionEstandar` con `id: string | null` (o `string` si el API siempre lo envía tras upsert).
- Crear `Evidencia`:
  - `id`, `calificacion_estandar_id`, `usuario_id`, `nombre_archivo`, `tipo_mime`, `tamano_bytes`, `ruta_almacenamiento`, `fecha_carga`, `activo`.
- Crear `RespuestaEnlaceDescarga`: `url`, `expira_en` (o el shape exacto del API SP-152).
- Constantes de cliente (validación previa al HTTP):
  - MIME: `application/pdf`, `image/jpeg`, `image/png`
  - Extensiones: `.pdf`, `.jpg`, `.jpeg`, `.png`
  - Tope: `10 * 1024 * 1024` (10 MiB)

### Paso 2: `ServicioEvidencias`

- Injectable `providedIn: 'root'` (o feature).
- Base: `environment.apiBaseUrl` (`/api/v1`).
- Métodos:
  - `subirArchivo(calificacionId: string, archivo: File): Observable<Evidencia>` — `FormData` con **solo** la clave `archivo`; **no** añadir ruta/tamaño/usuario.
  - `listarPorCalificacion(calificacionId: string): Observable<Evidencia[]>`
  - `obtenerEnlaceDescarga(evidenciaId: string): Observable<RespuestaEnlaceDescarga>`
  - `darDeBaja(evidenciaId: string): Observable<void>` (opcional UI; DELETE lógico)
- El interceptor JWT existente adjunta el Bearer; no duplicar headers.
- Specs con `HttpTestingController`: FormData presente, URL correcta, errores 422/403/503 propagados.

### Paso 3: Componente `zona-carga-evidencia` (SP-215)

- Carpeta: `features/diagnostico/componentes/zona-carga-evidencia/` (ts/html/css/spec).
- Standalone, OnPush, `templateUrl` / `styleUrls`.
- Inputs: `calificacionId: string | null`, `readonly: boolean`, `cargando: boolean`.
- Outputs: `alSubir` / o manejar HTTP interno y emitir `evidenciaCreada`.
- UI:
  - Zona de arrastre (`dragover` / `drop` / `dragleave`) + botón «Seleccionar archivo».
  - `accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"`.
  - Validación **cliente** antes del POST: tipo/extensión y tamaño ≤ 10 MiB → si falla, mensaje en español **sin** llamar al API.
  - Lista de evidencias activas (nombre, tamaño, tipo) cargada con `GET` al tener `calificacionId`.
  - Errores API vía `mensajeErrorHttp` junto al ítem (422/403/503).
- RBAC: el contenedor padre oculta la zona con `*appSiTieneRol="ROLES_ESCRITURA_DIAGNOSTICO"`; en `readonly` (autoevaluación finalizada / detalle histórico) no mostrar controles de escritura.
- No usar el POST JSON de metadatos.

### Paso 4: Integrar en `item-calificacion`

- Mostrar la zona **solo si** hay `calificacion?.id` (ítem ya calificado y persistido).
- Pasar `readonly` / `guardando` existentes.
- Tras 201, refrescar lista local sin recargar toda la autoevaluación.
- Mantener layout de tarjeta actual (Tailwind `rounded-[2rem]`, etc.).

### Paso 5: Asegurar `calificacion.id` en el flujo de diagnóstico

- Al mapear respuesta de `PUT .../calificaciones/{estandar_id}` y del detalle `GET /autoevaluaciones/{id}`, conservar `id`.
- Revisar `mapa-calificaciones` / servicios para no descartar el campo.
- Specs: tras calificar, el mapa incluye `id`.

### Paso 6: Componente `visor-evidencia` (SP-216)

- Carpeta: `features/diagnostico/componentes/visor-evidencia/`.
- Al abrir una evidencia activa:
  1. Llamar `obtenerEnlaceDescarga(id)`.
  2. Si `tipo_mime === application/pdf` → `iframe` (o object) con la `url`.
  3. Si JPEG/PNG → `img` con la `url` (no iframe PDF).
  4. Si `ARCHIVO_NO_DISPONIBLE` / evidencia inactiva → mensaje, sin iframe vacío.
- Al cerrar el modal/panel: **no** reutilizar URL vencida; el próximo open pide enlace nuevo.
- No incrustar el token de sesión en query string inventada; usar la `url` que devolvió el backend.
- No guardar el token ni la URL firmada en `localStorage`.

### Paso 7: Pruebas y documentación

- Specs unitarios:
  - Validación cliente rechaza `.exe` / > 10 MiB sin HTTP.
  - Drag de PDF válido dispara `subirArchivo` con `FormData`.
  - `CONSULTA` / `readonly`: sin controles de carga.
  - Visor PDF vs imagen; error de canje muestra mensaje.
- `npm test` / `npm run test:coverage` verdes.
- Actualizar `features/diagnostico/README.md` con endpoints y flujo.

## 4. Orden de implementación

1. Paso 0 — Rama `feature/SP-153-frontend`
2. Paso 1 — Modelos + constantes MIME/tamaño
3. Paso 5 — Propagar `calificacion.id` en mapa/servicios
4. Paso 2 — `ServicioEvidencias` + specs HTTP
5. Paso 3 — `zona-carga-evidencia`
6. Paso 4 — Cablear en `item-calificacion`
7. Paso 6 — `visor-evidencia`
8. Paso 7 — Cobertura + README

## 5. Checklist de pruebas

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` sin regresión relevante
- [ ] Arrastrar PDF válido → 201 y aparece en la lista del ítem
- [ ] Tipo no permitido no llama al API
- [ ] Rol `CONSULTA` no ve zona de carga
- [ ] PDF se ve tras pedir enlace; JPEG/PNG como imagen
- [ ] Evidencia inactiva / `ARCHIVO_NO_DISPONIBLE` muestra error, no iframe vacío
- [ ] Error 422/503 del API se muestra en español junto al ítem
- [ ] `ng build` OK

## 6. Referencia de tooling

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de error (API)

El frontend muestra `mensaje` del contrato backend:

```json
{
  "exito": false,
  "codigo": "EVIDENCIA_INVALIDA",
  "mensaje": "…",
  "detalle": null
}
```

Códigos relevantes en UI: `EVIDENCIA_INVALIDA` (422), `ACCESO_DENEGADO` (403), `ALMACENAMIENTO_NO_CONFIGURADO` (503), `ARCHIVO_NO_DISPONIBLE` (404 en canje).

## 8. Dependencias

Ninguna librería nueva. Usar APIs nativas de drag-and-drop y `HttpClient` + `FormData`. Evitar SDKs de visor PDF salvo que el design system del repo ya lo exija (por defecto: `iframe` / `img`).

## 9. Notas

- Campo multipart **exacto**: `archivo`. Un solo fichero por operación.
- `calificacion_id` ≠ `estandar_id`.
- No recalcular magic bytes en el cliente más allá de MIME/extensión/tamaño; el servidor valida contenido.
- Conservación documental: la baja en UI es lógica; no prometer borrado de disco.
- Commits en español, p. ej. `feat(diagnostico): carga y visor de evidencias SP-153`.
- PR contra `develop`.

## 10. Checklist de verificación de implementación

- [ ] Componentes en carpeta propia (ts/html/css/spec); standalone + OnPush
- [ ] Sin `template`/`styles` inline en producción
- [ ] Escritura solo con `ROLES_ESCRITURA_DIAGNOSTICO`
- [ ] FormData sin campos de ruta/usuario/tamaño
- [ ] Visor pide enlace fresco en cada apertura
- [ ] Tests del servicio y de zona/visor en verde
- [ ] README de diagnóstico actualizado
