# Ticket enriquecido: SP-192 — Crear planilla interactiva editable en Angular

## Descripción original
<!-- jira-skip -->
Subtarea de SP-145 — Crear planilla interactiva editable en Angular

Tipo: Subtask | Estado: Por hacer | Assignee: (sin asignar) | Story points en Jira: 5

Descripción actual en Jira (ya parcialmente enriquecida): construir en el
frontend Angular la planilla editable de matriz GTC 45 consumiendo la API
de SP-191; selector de empresa; filas de proceso/peligro/evaluación/controles;
NP/NR solo lectura; aviso EPP; responsive; rol CONSULTA sin escritura.
<!-- /jira-skip -->

## Descripción mejorada

Implementar en `sst-auditor-agent-pro-frontend` la **planilla interactiva
editable de la matriz de peligros y riesgos GTC 45**, consumiendo la API
REST ya entregada en SP-145 / SP-191 (`/api/v1`, Bearer JWT).

Es la capa de presentación de la HU padre SP-145. Backend, migración y
endpoints están listos; este ticket solo crea UI + servicios HTTP de feature.

### Objetivo de producto

El usuario autenticado elige una empresa, ve la matriz jerárquica
(procesos → peligros → evaluación → controles) y puede crear/editar/eliminar
según su rol. Los índices derivados (NP, NR, interpretación, aceptabilidad)
se muestran **solo lectura** desde la respuesta del backend — el cliente
**no** recalcula con lógica propia.

### Dependencias (ya en develop)

- Backend SP-145 / SP-190 / SP-191: API matriz + `GET .../matriz-riesgos`
- SP-238: shell, auth, guards, `*appSiTieneRol`
- SP-239: `Boton`, `Alerta`, `Modal`/`ServicioModal`, `Tooltip`, `Tabla`
- SP-240: `FormularioDinamico` + campos (crear/editar en modal o panel)
- SP-241: `ServicioLoader` para carga inicial / refresco de matriz
- SP-242: patrón de feature `dashboard` (paginas/servicios/modelos) y nav **Inicio**

### Alcance funcional

1. **Ruta** `/matriz-riesgos` bajo el shell autenticado (lazy `loadComponent`).
2. **Nav lateral**: ítem activo “Matriz GTC 45” (o “Matriz de riesgos”)
   apuntando a esa ruta (hoy el sidebar solo tiene Inicio + Diagnóstico
   deshabilitado).
3. **Selector de empresa**: `GET /api/v1/empresas` → elegir `empresa_id`.
4. **Carga de matriz**: `GET /api/v1/empresas/{empresa_id}/matriz-riesgos`
   con `ServicioLoader` (pasos: “Cargando matriz…”).
5. **Planilla jerárquica editable**:
   - Proceso: `nombre`, `es_rutinaria`, `zona_lugar`
   - Peligro: `clasificacion`, `descripcion`, `efectos_posibles`
   - Evaluación: selectores **solo** ND/NE/NC (valores discretos GTC);
     mostrar NP/NR/interpretación/aceptabilidad en solo lectura
   - Controles: CRUD por `tipo` (jerarquía Anexo B) + `descripcion`;
     **aviso UX** (no bloqueo) si el único control sería EPP
6. **Persistencia** vía endpoints anidados (POST/PATCH/PUT/DELETE); tras
   mutación exitosa refrescar la rama o toda la matriz.
7. **Errores**: mapear `RespuestaError.codigo` / `mensaje` a `AlertaComponent`
   o toast existente (401/403/404/422).
8. **RBAC UI**: rol `CONSULTA` ve la matriz en solo lectura (ocultar botones
   de alta/edición/baja con `*appSiTieneRol` o helper de escritura). La
   autorización real sigue en el backend (`requerir_rol_escritor`).
9. **Responsive (≥ 360 px)**: escritorio = grilla/acordeón por proceso;
   móvil = tarjetas/acordeón por proceso (sin scroll horizontal obligatorio).

### Fuera de alcance

- Cambiar contratos de API o recalcular NP/NR en el cliente
- Catálogos / autoevaluación / planes de mejora
- Offline / sync
- Export Excel/PDF (futuro)

### Arquitectura feature

```
src/app/features/matriz-riesgos/
  paginas/pagina-matriz-riesgos/
  componentes/          # presentacionales: fila-proceso, panel-peligro, etc.
  servicios/
    servicio-matriz-riesgos.ts      # HttpClient → endpoints matriz
    servicio-empresas-matriz.ts     # GET /empresas (si no existe aún un servicio global)
  modelos/              # DTOs tipados alineados a api-spec.yml del backend
```

Importar compartidos: `import { BotonComponent, AlertaComponent, ... } from '@app/shared'`.

Contrato HTTP: `environment.apiBaseUrl` (`http://localhost:8000/api/v1`) +
interceptor Bearer existente (`interceptorAutenticacion`).

## Criterios de aceptación

- [ ] Ruta `/matriz-riesgos` accesible solo autenticado; ítem visible en barra lateral
- [ ] Al seleccionar empresa se carga `GET .../matriz-riesgos` y se renderiza la jerarquía
- [ ] Escritores (ADMINISTRADOR / AUDITOR_SST u otros roles de escritura del producto) pueden crear/editar/eliminar procesos, peligros, evaluación (ND/NE/NC) y controles vía API
- [ ] NP, NR, interpretación y aceptabilidad se muestran desde la respuesta; el body de evaluación **nunca** envía derivados
- [ ] Selectores ND ∈ {10,6,2,0}, NE ∈ {4,3,2,1}, NC ∈ {100,60,25,10}; ND=0 (D1) muestra NP/NR=0 e interpretación IV
- [ ] Aviso visible (no bloqueante) si se intenta dejar EPP como único control
- [ ] Rol CONSULTA: sin controles de escritura; lecturas OK
- [ ] 403/404/422 muestran mensaje de `RespuestaError` al usuario
- [ ] Borrar proceso confirma (modal) y refleja CASCADE (desaparecen peligros/evaluación/controles de esa rama)
- [ ] Usable en viewport ≥ 360 px (acordeón/tarjetas en móvil)
- [ ] Tests unitarios de servicio HTTP (HttpTestingController) y de la página (estados vacío/carga/error + ocultar escritura CONSULTA)
- [ ] `ng build` y `npm test` en verde; sin theming de Material en el DOM de la planilla

## Campos y endpoints

Base: `{apiBaseUrl}` = `/api/v1`. Auth: `Authorization: Bearer <access>`.

**Empresas (selector)**

- `GET /empresas` → lista `{ id, razon_social, nit, ... }[]`

**Vista agregada**

- `GET /empresas/{empresa_id}/matriz-riesgos` → `RespuestaMatrizRiesgos`
  - `procesos[]`: `{ proceso, peligros[]: { peligro, evaluacion?, controles[] } }`

**Procesos**

- `POST /empresas/{empresa_id}/procesos-actividades` body: `{ nombre, es_rutinaria, zona_lugar? }` → 201
- `PATCH /procesos-actividades/{id}` body parcial
- `DELETE /procesos-actividades/{id}` → 204 (CASCADE)

**Peligros**

- `POST /procesos-actividades/{id}/peligros` body: `{ clasificacion, descripcion, efectos_posibles? }`
- `PATCH /peligros/{id}` / `DELETE /peligros/{id}`

**Evaluación (1—1 por peligro; upsert)**

- `PUT /peligros/{id}/evaluacion` body **solo**: `{ nivel_deficiencia, nivel_exposicion, nivel_consecuencia }`
- Respuesta incluye derivados: `nivel_probabilidad`, `nivel_riesgo`, `interpretacion_nr`, `aceptabilidad`
- 201 create / 200 update; 422 `VALOR_GTC_INVALIDO` si ND/NE/NC inválidos o extras

**Controles**

- `POST /evaluaciones-riesgo/{id}/controles` body: `{ tipo, descripcion }`
- `PATCH /controles-riesgo/{id}` / `DELETE /controles-riesgo/{id}`

**Errores comunes** (`RespuestaError`): `codigo`, `mensaje`, `detalle?`

- 401 `TOKEN_INVALIDO` | 403 `ACCESO_DENEGADO` | 404 `EMPRESA_NO_ENCONTRADA` / `PROCESO_NO_ENCONTRADO` / … | 422 `VALOR_GTC_INVALIDO`

**Enums UI (espejo backend)**

- Clasificación peligro: BIOLOGICO, FISICO, QUIMICO, PSICOSOCIAL, BIOMECANICO, CONDICIONES_SEGURIDAD, FENOMENOS_NATURALES
- Tipo control: ELIMINACION, SUSTITUCION, INGENIERIA, ADMINISTRATIVO, EPP
- Interpretación: I–IV | Aceptabilidad: NO_ACEPTABLE, ACEPTABLE_CON_CONTROL, MEJORABLE, ACEPTABLE

Fuente de verdad OpenAPI: repo backend `ai-specs/specs/api-spec.yml` (tag Matriz de riesgos GTC 45).

## Archivos a crear o modificar

- `src/app/features/matriz-riesgos/paginas/pagina-matriz-riesgos/pagina-matriz-riesgos.component.{ts,html,css,spec.ts}` — Create — contenedor OnPush
- `src/app/features/matriz-riesgos/servicios/servicio-matriz-riesgos.ts` (+ `.spec.ts`) — Create — HttpClient CRUD + getMatriz
- `src/app/features/matriz-riesgos/servicios/servicio-empresas.ts` (+ `.spec.ts`) — Create — `GET /empresas` (si no hay servicio global reutilizable)
- `src/app/features/matriz-riesgos/modelos/*.ts` — Create — interfaces alineadas a OpenAPI
- `src/app/features/matriz-riesgos/componentes/...` — Create — presentacionales (acordeón proceso, formulario peligro/evaluación/control) reutilizando `FormularioDinamico` / campos / `Boton` / `Alerta` / `Modal`
- `src/app/features/matriz-riesgos/README.md` — Create — alcance y contrato
- `src/app/app.routes.ts` — Modify — child lazy `/matriz-riesgos`
- `src/app/layout/componentes/barra-lateral/barra-lateral.component.{html,spec.ts}` — Modify — ítem nav Matriz
- Opcional: constantes de roles de escritura en `nucleo/auth/constantes-roles.ts` — Modify

## Casos de prueba unitarios

- Servicio matriz: `getMatriz` arma URL correcta; POST proceso envía body sin extras; PUT evaluación solo ND/NE/NC; DELETE espera 204
- Servicio matriz: propaga error 422 con `codigo === 'VALOR_GTC_INVALIDO'`
- Página: estado vacío sin empresa; skeleton/loader al cargar; renderiza procesos mockados de la respuesta
- Página: usuario CONSULTA no ve botones de escritura (`*appSiTieneRol` / query en DOM)
- Página: aviso EPP cuando controles.length === 1 && tipo === 'EPP' (o al intentar guardar ese caso)
- Página: al 403 muestra alerta con mensaje API
- Barra lateral: enlace “Matriz” apunta a `/matriz-riesgos`
- Regresión: tests de dashboard/auth siguen verdes

## Requisitos no funcionales

- Seguridad: nunca persistir tokens en logs; no enviar derivados en body; UI RBAC no sustituye backend
- Performance: una carga inicial con vista agregada; evitar N+1 de GETs por celda; refrescos locales tras mutación puntuales cuando sea simple
- A11y: botones con nombre accesible; modales con foco (CDK Dialog vía `ServicioModal`); selectores de ND/NE/NC etiquetados
- UX: confirmación antes de DELETE de proceso/peligro; Tailwind + tokens `--sst-*`; cero theming Material en la planilla
- Compat: Angular 17.3 standalone, OnPush, `@Input`/`@Output` decorator-based (no Signal inputs en directivas)
- i18n código: identificadores y mensajes de UI en español

## Puntos de historia

<!-- STORY_POINTS:5 -->
**5** — Coincide con Jira. Feature nueva con grilla jerárquica + HTTP + RBAC UI + responsive; sin cambios de API. Si al planificar surge paginación offline o edición excel-like, revisar a 8.
<!-- /STORY_POINTS -->
