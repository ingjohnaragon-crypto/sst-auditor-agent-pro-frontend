# Plan de implementación frontend: SP-267 Crear pantalla de gestor documental por fases

## 1. Resumen

Subtarea de la épica **SP-245** en `sst-auditor-agent-pro-frontend`. Entrega la feature `documentos` (gestor PHVA) dentro del shell autenticado: cuatro pestañas de fase (`PLANEAR` / `HACER` / `VERIFICAR` / `ACTUAR`), tarjetas por tipo con estado y acciones de carga/descarga, avance `(no_PENDIENTE / total) * 100` calculado con el GET de empresa, y marcado `REVISADO` para escritores. El navegador **no** usa SDK de Cloudflare ni recibe `clave_objeto`/URL de bucket; descarga = Bearer + blob vía FastAPI.

**Dependencia:** API de SP-266 en backend (`catalogo-documentos` + `empresas/{id}/documentos…`) ya en `develop` / PR mergeado de SP-245. Reutilizar patrones de SP-286 (`archivos`): selector de empresa, `ROLES_ESCRITURA_SST`, validación PDF/JPEG/PNG 10 MiB, `mensajeErrorHttp`, descarga blob.

**No** forma parte de esta historia: cambios de backend, repositorio libre `/archivos` (SP-286), evidencias de diagnóstico, ni cliente R2.

Stack activo: `frontend-angular` (Angular 17+, standalone).

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 de Jira. Pantalla nueva (ruta, nav, feature, servicio HTTP, pestañas PHVA, avance %, RBAC UI, descarga blob, PATCH REVISADO y pruebas). El API ya está definido; el esfuerzo es Angular y no filtrar secretos R2. Complejidad similar a SP-286, con UI tabbed + estados por tipo en lugar de listado libre.
- **Subtareas**: ninguna. SP-267 es la subtarea de pantalla.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Repo: `sst-auditor-agent-pro-frontend`
- Prefijo API:
  - `{apiBaseUrl}/catalogo-documentos`
  - `{apiBaseUrl}/empresas/{empresa_id}/documentos`
- Contrato backend (SP-245 / SP-266):

  | Método | Ruta | Uso UI |
  |---|---|---|
  | `GET` | `/catalogo-documentos` | Tipos (id, codigo, nombre, fase, obligatorio, descripcion, `estandares_ids`) — opcional si el GET empresa ya trae tipo_codigo/nombre/fase |
  | `GET` | `/empresas/{id}/documentos` | Un ítem por tipo: estado, fecha_carga, nombre_original, … **sin** `clave_objeto` |
  | `POST` | `/empresas/{id}/documentos/{tipo_id}/archivo` | multipart campo `archivo` → 201 `CARGADO` |
  | `GET` | `/empresas/{id}/documentos/{tipo_id}/archivo` | binario Bearer |
  | `PATCH` | `/empresas/{id}/documentos/{tipo_id}` | `{ "estado": "REVISADO" }` solo desde `CARGADO` |

- Avance UI: `Math.round((items.filter(d => d.estado !== 'PENDIENTE').length / items.length) * 100)` (o 0 si total = 0). Debe coincidir con el conteo del GET tras recargar.
- RBAC: `CONSULTA` lista/descarga; `ADMINISTRADOR` / `AUDITOR_SST` cargan y marcan `REVISADO` (`ROLES_ESCRITURA_SST`).
- Empresa activa: selector local en página (como `PaginaArchivosComponent`); sin NgRx.
- Component API: solo `@Input()` / `@Output()` (signals `input()`/`output()` bloqueados en este repo).

| Capa | Archivos previstos |
|---|---|
| Feature | `src/app/features/documentos/` (modelos, servicio, página, componentes, utilidades) |
| Rutas / nav | `app.routes.ts`, `barra-lateral.component.html` (+ spec del sidebar) |
| Shared | Reutilizar validación MIME/10 MiB de `archivos` o duplicar fina en feature; `ServicioModal` si hace falta confirmación |
| Docs | README corto de feature; no tocar api-spec del backend |

### Mapeo de subtareas

No hay subtareas: el plan sale directamente de SP-267.

## 3. Pasos de implementación

### Paso 0: Crear la rama

```bash
git checkout develop
git pull origin develop
git checkout -b feature/SP-267-frontend
```

Prerrequisito de prueba: backend con migración/semilla PHVA y endpoints de SP-245 disponibles (local o `develop`).

### Paso 1: Modelos TypeScript

`src/app/features/documentos/modelos/`:

```ts
export type FaseDocumentoPhva = 'PLANEAR' | 'HACER' | 'VERIFICAR' | 'ACTUAR';
export type EstadoDocumentoEmpresa = 'PENDIENTE' | 'CARGADO' | 'REVISADO';

export interface DocumentoEmpresa {
  id: string | null;
  empresa_id: string;
  tipo_id: string;
  tipo_codigo: string;
  tipo_nombre: string;
  fase: FaseDocumentoPhva;
  estado: EstadoDocumentoEmpresa;
  fecha_carga: string | null;
  nombre_original: string | null;
  tipo_mime: string | null;
  tamano_bytes: number | null;
  usuario_nombre: string | null;
}

export interface TipoDocumentoSst {
  id: string;
  codigo: string;
  nombre: string;
  fase: FaseDocumentoPhva;
  descripcion: string;
  obligatorio: boolean;
  estandares_ids: string[];
}
```

Sin `clave_objeto`. Preferir el GET de documentos de empresa como fuente única de la UI de tarjetas (ya incluye fase/nombre/código); el catálogo solo si se necesita descripción u obligatorio y no vinieran en el listado (el DTO backend sí trae fase/tipo_nombre; `obligatorio` puede requerir join con catálogo o enriquecer en cliente con `GET /catalogo-documentos`).

**Decisión:** cargar ambos al seleccionar empresa (o catálogo una vez + documentos por empresa) y fusionar por `tipo_id` para mostrar `obligatorio` / `descripcion` en la tarjeta.

### Paso 2: Validación de archivo (cliente)

- Reutilizar `validarArchivoDocumental` de `features/archivos/utilidades` (o copiar a `documentos/utilidades` si se quiere desacoplar features).
- PDF / JPEG / PNG, tope 10 MiB. El API sigue siendo la fuente de verdad (422 magic).

### Paso 3: Servicio HTTP

`ServicioDocumentosEmpresa` (`providedIn: 'root'`):

| Método | HTTP | Notas |
|---|---|---|
| `listarCatalogo()` | `GET /catalogo-documentos` | `Observable<TipoDocumentoSst[]>` |
| `listarPorEmpresa(empresaId)` | `GET /empresas/{id}/documentos` | ítems con estado |
| `cargar(empresaId, tipoId, archivo)` | `POST .../{tipoId}/archivo` + `FormData` campo `archivo` | 201 |
| `descargar(empresaId, tipoId)` | `GET .../{tipoId}/archivo` `responseType: 'blob'` | Bearer vía interceptor |
| `marcarRevisado(empresaId, tipoId)` | `PATCH .../{tipoId}` body `{ estado: 'REVISADO' }` | 200 / 409 |

Helpers: `codificarIdRuta` (reutilizar de archivos), `dispararDescargaBlob` con `nombre_original`. Nunca URL de R2.

Mapear errores: `DOCUMENTO_INVALIDO` 422, `CONFLICTO_ESTADO_DOCUMENTO` 409, `ALMACENAMIENTO_NO_CONFIGURADO` 503, 401/403/404 — adaptar `mensajeErrorHttp` (extender o crear `mensaje-error-http` en la feature).

### Paso 4: Utilidad de avance

```ts
export function calcularAvanceDocumentos(docs: DocumentoEmpresa[]): number {
  if (docs.length === 0) return 0;
  const hechos = docs.filter((d) => d.estado !== 'PENDIENTE').length;
  return Math.round((hechos / docs.length) * 100);
}
```

Unit test: 0/10 → 0; 3 no-pendientes/10 → 30; todos CARGADO/REVISADO → 100.

### Paso 5: Página y componentes

Standalone, OnPush, `templateUrl` / `styleUrls`, `@Input`/`@Output` decorators:

```text
features/documentos/
├── modelos/
├── servicios/
├── utilidades/          # avance, mensaje-error, validación (si local)
├── paginas/
│   └── pagina-documentos/
└── componentes/
    ├── pestanas-fase-phva/       # 4 pestañas; emite fase activa
    ├── tarjeta-documento/        # nombre, obligatorio, estado, acciones
    ├── lista-documentos-fase/    # filtra por fase + *ngFor de tarjetas
    └── (opcional) barra-avance/  # % + texto "X de Y"
```

**Página smart** `PaginaDocumentosComponent`:

1. Cargar empresas (`ServicioEmpresas`).
2. Al seleccionar empresa: `listarCatalogo` (cacheable en la sesión de página) + `listarPorEmpresa`.
3. Fusionar catálogo + documentos; calcular avance global (y opcional por fase).
4. Pestaña activa (default `PLANEAR`); lista filtrada por `fase`.
5. Cargar archivo (solo escritores): input file / zona; tras 201, refrescar listado (criterio CA: al recargar sigue CARGADO y se puede descargar).
6. Descargar: blob + nombre.
7. Marcar REVISADO: solo si estado `CARGADO` y `puedeEscribir`; 409 → mensaje.
8. Estados UI: loading, vacío (sin empresa / sin tipos), error, 503.

Badge de estado: colores discretos alineados al design system existente (PENDIENTE / CARGADO / REVISADO). No inventar dashboard genérico: una composición clara — avance + pestañas + lista de tarjetas.

### Paso 6: Rutas y navegación

- `app.routes.ts` (hijo del shell, `guardAutenticacion`):

  `{ path: 'documentos', loadComponent: () => import('...PaginaDocumentosComponent') }`

- `barra-lateral.component.html`: enlace “Documentos” o “Gestor PHVA” → `/documentos`, visible a cualquier autenticado.
- Actualizar `barra-lateral.component.spec.ts` (como se hizo con Archivos).
- Diferenciar visualmente de “Archivos” (repositorio libre SP-286): labels distintos.

### Paso 7: RBAC en UI

- `puedeEscribir` con `ROLES_ESCRITURA_SST` (mismo patrón que archivos/matriz).
- `CONSULTA`: ve pestañas, avance, descarga; **no** botón de carga ni “Marcar revisado”.
- API 403 → mensaje usable; no confiar solo en ocultar botones.

### Paso 8: Pruebas

| Tipo | Casos |
|---|---|
| Utilidad avance | 0%, parcial, 100% |
| Servicio (HttpClientTesting) | listar catálogo/empresa, FormData, blob, PATCH body, URLs con ids codificados |
| Página / componentes | selector empresa lista docs; filtro por pestaña; carga mock → estado CARGADO y avance sube; CONSULTA sin botones escritura; descarga; PATCH REVISADO; 409/422/503 |
| Regresión | shell, login, `/archivos` intacto |

Cobertura: `npm run test:coverage` (umbral del repo ≥ 90 %).

### Paso 9: Documentación

- `features/documentos/README.md`: contrato API, fórmula de avance, RBAC, sin R2 en cliente.
- No modificar `api-spec.yml` / `data-model.md` del backend desde este repo.
- No añadir `R2_*` al frontend.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-267-frontend`
2. Paso 1 — modelos
3. Paso 3 — servicio HTTP (+ tests)
4. Paso 2 + 4 — validación y avance (+ tests)
5. Paso 5 — página y componentes
6. Paso 6 — ruta + sidebar
7. Paso 7 — RBAC UI
8. Paso 8 — tests UI
9. Paso 9 — README
10. `npm test` / `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` con 0 fallos
- [ ] `npm run test:coverage` cumple el umbral
- [ ] Tras carga, el documento queda `CARGADO`; al recargar la página sigue `CARGADO` y se descarga
- [ ] Avance UI = `(no_PENDIENTE / total) * 100` con los datos del GET
- [ ] Cuatro pestañas filtran por fase
- [ ] `CONSULTA` no ve carga ni marcar revisado; sí descarga
- [ ] 409 / 422 / 503 muestran mensaje usable
- [ ] Sin SDK S3/R2 ni `clave_objeto` en modelos/UI
- [ ] `/archivos` (SP-286) no se rompe

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
  "codigo": "DOCUMENTO_INVALIDO",
  "mensaje": "…",
  "detalle": null
}
```

Mapear en UI al menos: `DOCUMENTO_INVALIDO` (422), `CONFLICTO_ESTADO_DOCUMENTO` (409), `ACCESO_DENEGADO` (403), `ALMACENAMIENTO_NO_CONFIGURADO` (503), `EMPRESA_NO_ENCONTRADA` / `DOCUMENTO_NO_ENCONTRADO` / `TIPO_DOCUMENTO_NO_ENCONTRADO` (404).

## 8. Dependencias

Ninguna nueva. Reutilizar `HttpClient`, interceptor Bearer, `ROLES_ESCRITURA_SST`, utilidades de `archivos` donde encaje, componentes shared (`AlertaComponent`, `BotonComponent`).

## 9. Notas

- Rama: `feature/SP-267-frontend` (nunca `-backend` en este stack).
- Distinguir del listado libre SP-286: aquí el archivo cuelga del **tipo** PHVA, no de un id de archivo libre.
- Campo multipart: `archivo`.
- Preferir GET documentos de empresa como fuente de tarjetas; catálogo para `obligatorio`/`descripcion`.
- No calcular ni mostrar `clave_objeto`.
- OnPush + `markForCheck` / `async` pipe; sin `input()`/`output()` signal.
- Si el backend aún no está en el entorno local: documentar dependencia; no mockear R2 en el browser.

## 10. Lista de verificación de la implementación

- [ ] Lint / build sin errores
- [ ] Arquitectura: feature standalone OnPush, servicio tipado, sin secretos R2
- [ ] Tests verdes, cobertura ≥ 90 %
- [ ] README de feature
- [ ] Rama `feature/SP-267-frontend`
- [ ] CA: recarga mantiene CARGADO + descarga; avance = conteo API
