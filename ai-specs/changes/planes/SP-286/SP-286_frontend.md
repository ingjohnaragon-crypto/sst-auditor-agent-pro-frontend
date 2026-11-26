# Plan de implementación frontend: SP-286 Crear el listado de archivos de la empresa

## 1. Resumen

Subtarea de SP-249 en `sst-auditor-agent-pro-frontend`. Entrega la feature `archivos` dentro del shell autenticado: listar, cargar, descargar y eliminar documentos de la empresa activa contra el API de SP-284 (`/api/v1/empresas/{empresa_id}/archivos`). El navegador **no** usa SDK de Cloudflare ni recibe credenciales/URL del bucket; todo pasa por FastAPI con Bearer de sesión.

**No** forma parte de esta historia: cambios de backend (SP-284/285), catálogo PHVA (SP-245), suite exhaustiva sin red (SP-287), ni unificar evidencias de diagnóstico en esta pantalla.

Stack activo: `frontend-angular` (Angular 17+, standalone).

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 de Jira y del enriquecimiento. Es una pantalla nueva (ruta, nav, feature completa, servicio HTTP, RBAC UI, confirmación de borrado, descarga blob autenticada y pruebas). El API ya existe; el esfuerzo está en Angular y en no filtrar secretos R2 al cliente.
- **Subtareas**: ninguna. SP-286 es la subtarea.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Repo: `sst-auditor-agent-pro-frontend`
- Prefijo API: `{environment.apiBaseUrl}/empresas/{empresa_id}/archivos`
- Contrato backend (SP-284):
  - `GET ''` → lista `RespuestaArchivoDocumental` (`nombre_original`, `tipo_mime`, `tamano_bytes`, `fecha_carga`, `usuario_id`, `usuario_nombre`, …; **sin** `clave_objeto`)
  - `POST ''` → `multipart/form-data`, campo `archivo` → 201
  - `GET /{archivo_id}` → binario con Bearer (no URL R2)
  - `DELETE /{archivo_id}` → 204
- RBAC: `CONSULTA` lista y descarga; solo `ADMINISTRADOR` / `AUDITOR_SST` cargan y borran (`ROLES_ESCRITURA_SST` + `*appSiTieneRol` / `puedeEscribir`)
- Empresa activa: patrón local de página (selector + `empresaSeleccionadaId`), como matriz/diagnóstico; no hay store global

| Capa | Archivos previstos |
|---|---|
| Feature | `src/app/features/archivos/` (modelos, servicio, página, componentes) |
| Rutas / nav | `app.routes.ts`, `barra-lateral.component.html` |
| Shared (opcional) | reutilizar o extraer validación MIME/10 MiB; confirmación vía `ServicioModal` |
| Docs | nota mínima si aplica; no tocar api-spec del backend |

### Mapeo de subtareas

No hay subtareas: el plan sale de SP-286.

## 3. Pasos de implementación

### Paso 0: Crear la rama

```bash
git checkout develop
git pull origin develop
git checkout -b feature/SP-286-frontend
```

Depende de que el API de SP-284 esté disponible en el entorno contra el que se prueba (backend en `develop` o local).

### Paso 1: Modelos TypeScript

Crear `src/app/features/archivos/modelos/archivo-documental.ts` (y `index.ts`):

```ts
export interface ArchivoDocumental {
  id: string;
  empresa_id: string;
  nombre_original: string;
  tipo_mime: string;
  tamano_bytes: number;
  fecha_carga: string;
  usuario_id: string;
  usuario_nombre: string | null;
}
```

Sin campo `clave_objeto` ni URL de R2.

### Paso 2: Validación de archivo (cliente)

- Reutilizar la lógica de `validarArchivoEvidencia` (PDF/JPEG/PNG, 10 MiB) o extraer a `shared` / `features/archivos/utilidades/validar-archivo-documental.ts` con el mismo contrato.
- El rechazo definitivo sigue siendo del API (422 / magic); la UI evita subidas obviamente inválidas.

### Paso 3: Servicio HTTP

`src/app/features/archivos/servicios/servicio-archivos-documentales.ts` (`providedIn: 'root'`):

| Método | HTTP | Notas |
|---|---|---|
| `listar(empresaId)` | `GET .../empresas/{id}/archivos` | `Observable<ArchivoDocumental[]>` |
| `cargar(empresaId, archivo: File)` | `POST` + `FormData` campo `archivo` | 201 → metadatos |
| `descargar(empresaId, archivoId)` | `GET .../{archivoId}` con `responseType: 'blob'` | El interceptor añade Bearer |
| `eliminar(empresaId, archivoId)` | `DELETE` | 204 |

Helpers de UI: disparar descarga del blob (`URL.createObjectURL` + `<a download>` o equivalente) usando `nombre_original` del listado. **Nunca** construir URL del bucket ni pedir firmas R2.

Tratar `503` (`ALMACENAMIENTO_NO_CONFIGURADO`) como servicio no disponible (mensaje claro).

### Paso 4: Página y componentes

Estructura (una carpeta por componente, standalone, OnPush, `templateUrl`/`styleUrls`):

```text
features/archivos/
├── modelos/
├── servicios/
├── utilidades/          # validación (si no se mueve a shared)
├── paginas/
│   └── pagina-archivos/
└── componentes/
    ├── lista-archivos/          # tabla: nombre, fecha, tamaño, quién cargó + acciones
    ├── zona-carga-archivo/      # input file + feedback (solo escritura)
    └── (opcional) fila / vacío
```

**Página smart** `PaginaArchivosComponent`:

1. Cargar empresas (`ServicioEmpresas.listar` del feature diagnóstico o servicio compartido equivalente).
2. Selector de empresa → al cambiar, `listar(empresaId)`.
3. Tras carga exitosa: refrescar listado (criterio: recargar/refrescar muestra el archivo subido).
4. Descargar: llamar servicio blob + guardar localmente.
5. Eliminar: abrir confirmación; si acepta, `DELETE` y quitar de la lista / refrescar.

Estados: loading, vacío, error API, 503.

### Paso 5: Rutas y navegación

- En `app.routes.ts`, hijo del shell (solo `guardAutenticacion`):

  `{ path: 'archivos', loadComponent: () => import('...PaginaArchivosComponent') }`

- En `barra-lateral.component.html`, enlace “Archivos” (o “Documentos”) a `/archivos`, visible para cualquier autenticado (incluido `CONSULTA`).

No hace falta `guardRoles` en la ruta: el RBAC de escritura es solo de UI + API.

### Paso 6: RBAC en UI

- `puedeEscribir` / `*appSiTieneRol="ROLES_ESCRITURA_SST"`:
  - mostrar zona de carga y botón eliminar solo a escritores;
  - `CONSULTA` ve listado y puede descargar.
- No confiar solo en ocultar botones: el API ya responde 403; mostrar mensaje si ocurre.

### Paso 7: Confirmación de borrado

- Usar `ServicioModal` + diálogo de confirmación.
- Preferir **reutilizar** `DialogoConfirmacionComponent` de matriz o **moverlo a `shared`** si se quiere evitar acoplar features; no inventar un segundo patrón.
- Texto: nombre del archivo + consecuencia (se elimina del repositorio).

### Paso 8: Pruebas

| Tipo | Casos |
|---|---|
| Servicio (HttpClientTesting) | listar, FormData en cargar, DELETE, GET blob, URL correcta |
| Página / componentes | al seleccionar empresa lista; tras carga mockeada aparece en lista; confirmar borrado llama DELETE y actualiza; cancelar no borra; `CONSULTA` no ve carga/eliminar; validación cliente rechaza tipo/tamaño |
| Regresión | shell, login, otras features verdes |

Cobertura del proyecto: `npm run test:coverage` (umbral del repo).

### Paso 9: Documentación

- README corto en `features/archivos/README.md` (contrato API, RBAC, sin R2 en cliente) — opcional pero útil.
- No modificar `api-spec.yml` del backend desde este repo.
- No añadir variables `R2_*` al frontend ni a `.env` del cliente.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-286-frontend`
2. Paso 1 — modelos
3. Paso 3 — servicio HTTP (+ tests)
4. Paso 2 — validación cliente
5. Paso 4 — página y componentes
6. Paso 5 — ruta + sidebar
7. Paso 6–7 — RBAC + confirmación
8. Paso 8 — tests UI
9. Paso 9 — README / notas
10. `npm test` y `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` con 0 fallos
- [ ] `npm run test:coverage` cumple el umbral del proyecto
- [ ] Tras subir, el listado (o refresh) muestra el archivo
- [ ] Confirmar borrado lo quita de la lista; cancelar no
- [ ] Descarga obtiene el binario vía API autenticado (sin URL de bucket)
- [ ] `CONSULTA` lista/descarga; no carga ni borra
- [ ] 503 / 422 muestran mensaje usable
- [ ] No hay imports de SDK S3/R2 en el cliente

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint` / `npm run lint:eslint` |

## 7. Formato de respuesta de error

El backend usa:

```json
{
  "exito": false,
  "codigo": "ARCHIVO_INVALIDO",
  "mensaje": "…",
  "detalle": null
}
```

Mapear en UI al menos: `ARCHIVO_INVALIDO` (422), `ACCESO_DENEGADO` (403), `ALMACENAMIENTO_NO_CONFIGURADO` (503), `EMPRESA_NO_ENCONTRADA` / `ARCHIVO_NO_ENCONTRADO` (404).

## 8. Dependencias

Ninguna nueva. Reutilizar `HttpClient`, interceptor de auth, `ServicioModal` / CDK Dialog, directiva `appSiTieneRol`.

## 9. Notas

- Rama: `feature/SP-286-frontend` (nunca `-backend` en este stack).
- Campo multipart: `archivo` (igual espíritu que evidencias).
- Descarga de archivos de empresa ≠ flujo `enlace-descarga` de evidencias: aquí es GET binario con sesión.
- No calcular `clave_objeto` en Angular.
- Selector de empresa en la propia página (sin NgRx).
- Diseño: tokens `sst-*` / Tailwind del proyecto; no inventar paleta púrpura genérica.

## 10. Lista de verificación de la implementación

- [ ] Feature `archivos` bajo el shell con ruta y entrada de menú
- [ ] Listado: nombre, fecha, tamaño, quién cargó
- [ ] Carga / descarga / borrado vía API; sin R2 en el navegador
- [ ] Confirmación antes de eliminar
- [ ] RBAC UI alineado con `CONSULTA` vs escritores
- [ ] Tests verdes y cobertura del umbral
- [ ] Rama desde `develop`
