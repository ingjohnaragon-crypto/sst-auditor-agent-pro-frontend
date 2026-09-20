# Plan de implementación: SP-204 Crear gráficos dinámicos de cumplimiento en Angular

> **Secuencia HU SP-144:** SP-189 (matriz) ya está en `develop`. Esta rama
> se rearmó sobre ese merge: el panel PHVA se embebe en Inicio, índice y
> detalle; no se recrean rutas chart-only. Detalle de la estrategia:
> `ai-specs/changes/planes/SP-144/SP-144_estrategia_frontend.md`.

## 1. Resumen

Reemplazar el panel PHVA **decorativo** del Inicio (`/dashboard`) por un gráfico
de barras alimentado por el backend, y exponer la misma vista en un **detalle**
de autoevaluación.

El cliente Angular **no recalcula** la normativa Res. 0312: solo pinta
`GET /api/v1/autoevaluaciones/{id}/cumplimiento-phva`. Las barras usan
`fases[].porcentaje_cumplimiento`; la brecha usa `fases[].brecha` y los campos
globales `puntaje_total`, `umbral_plan_mejora` y `requiere_plan_mejora`.

Stack activo: `frontend-angular` (Angular 17.3 standalone + Tailwind + tokens
`--sst-*`). Idioma: español.

**Precondiciones:**

- Backend SP-203 desplegado en local (`http://localhost:8000/api/v1`): el DTO
  `RespuestaCumplimientoPHVA` y la ruta ya existen en
  `sst-auditor-agent-pro-backend`.
- Usuario autenticado (Bearer vía `interceptorAutenticacion`).
- SP-189 (matriz de 60 ítems) **ya está en `develop`**: reutilizar
  `ServicioEmpresas`, `ServicioAutoevaluaciones` y las páginas
  `pagina-diagnostico` / `pagina-detalle-diagnostico` / `historico`.
  No sembrar un recorte chart-only paralelo.

**Decisión de charts:** **no** añadir Chart.js, ng2-charts, ngx-charts ni D3.
Las cuatro barras se implementan con HTML/CSS (ancho porcentual) y SVG mínimo
si hace falta el marcador de umbral, alineadas al panel PHVA actual
(indigo / emerald / amber / sky). Justificación: el design system ya tiene
esas barras; 4 valores estáticos no justifican una librería.

## Estimación de puntos de historia

<!-- STORY_POINTS:3 -->
- **HU total**: 3 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 3 SP del ticket. Alcance acotado: modelos +
  servicio HTTP tipado + componente presentacional OnPush + integración en
  dashboard y una página de detalle. Sin librería de charts, sin matriz 0312
  (SP-189) y sin recálculo normativo. Incertidumbre baja: el contrato OpenAPI
  ya está cerrado en backend. El selector de empresa + última autoevaluación
  en Inicio es el único acoplamiento extra y cabe en 3 SP.
- **Subtareas**: ninguna en Jira (SP-204 es subtarea de la HU de calificación
  ponderada / PHVA).

| Relacionada | Puntos | Nota |
|---|---:|---|
| SP-203 (backend) | 3 | Endpoint `cumplimiento-phva` — prerequisito, no implementar aquí. |
| SP-189 (frontend) | 5 | Matriz 60 ítems — fuera de alcance; reutilizará estos modelos/servicios. |
| SP-204 (esta) | 3 | Barras + servicio + detalle/dashboard. |
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas / archivos (rutas relativas a `src/app/` salvo docs):

| Capa | Archivos | Rol |
|---|---|---|
| Modelos | `features/diagnostico/modelos/ciclo-phva.ts` | Ya en SP-189 (`'PLANEAR' \| 'HACER' \| 'VERIFICAR' \| 'ACTUAR'`) |
| Modelos | `features/diagnostico/modelos/cumplimiento-phva.model.ts` | Espejo del DTO OpenAPI (decimales `string`) |
| Modelos | `features/diagnostico/modelos/index.ts` | Barrel (reexporta el DTO PHVA) |
| HTTP | `features/diagnostico/servicios/servicio-cumplimiento-phva.ts` | `GET .../cumplimiento-phva` |
| HTTP | `features/diagnostico/servicios/servicio-autoevaluaciones.ts` | Reusar SP-189 (`listarPorEmpresa`) |
| HTTP | `features/diagnostico/servicios/servicio-empresas.ts` | Reusar SP-189 (`GET /empresas`); no crear `ServicioEmpresasDiagnostico` |
| Presentacional | `features/diagnostico/componentes/grafico-cumplimiento-phva/` | Barras + brecha + estados UI |
| Contenedor | `features/diagnostico/componentes/panel-cumplimiento-phva/` | Carga HTTP a partir de un `autoevaluacionId` + `recarga` |
| Página índice | `features/diagnostico/paginas/pagina-diagnostico/` | Matriz SP-189 + panel embebido |
| Página detalle | `features/diagnostico/paginas/pagina-detalle-diagnostico/` | Matriz/histórico + panel embebido |
| Dashboard | `features/dashboard/paginas/pagina-dashboard/` | Sustituir aside PHVA decorativo |
| Rutas | `app.routes.ts` | Hijos SP-189: `''`, `historico` (antes de `:id`), `:id` |
| Nav | `layout/componentes/barra-lateral/` | Enlace Diagnóstico (ya activado en SP-189) |
| Docs | `features/diagnostico/README.md`, `features/dashboard/README.md` | Contrato visual SP-189 + SP-204 |

### Contrato HTTP (fuente de verdad)

`apiBaseUrl` = `http://localhost:8000/api/v1` (`environment.ts`).

```
GET /autoevaluaciones/{id}/cumplimiento-phva
Authorization: Bearer <token>
```

Respuesta 200 (`RespuestaCumplimientoPHVA`); **decimales como `string`**:

```ts
type CicloPhva = 'PLANEAR' | 'HACER' | 'VERIFICAR' | 'ACTUAR';

interface CumplimientoFasePhva {
  ciclo_phva: CicloPhva;
  peso_maximo: string;              // p. ej. "25.00"
  puntaje_obtenido: string;
  porcentaje_cumplimiento: string;  // 0–100, 2 decimales
  brecha: string;                   // peso_maximo - puntaje_obtenido (puntos)
}

interface RespuestaCumplimientoPhva {
  autoevaluacion_id: string;
  empresa_id: string;
  perfil: string;                   // p. ej. TABLA_7 | TABLA_21 | TABLA_60
  puntaje_total: string;
  umbral_plan_mejora: string;       // "85.00"
  requiere_plan_mejora: boolean;
  finalizada: boolean;
  fases: CumplimientoFasePhva[];    // siempre 4 fases
}
```

Errores relevantes:

| HTTP | `codigo` | UI |
|---|---|---|
| 401 | (auth) | Flujo existente del interceptor (refresh / login) |
| 403 | `ACCESO_DENEGADO` | Alerta de error con `mensaje` del API |
| 404 | `AUTOEVALUACION_NO_ENCONTRADA` / `EMPRESA_NO_ENCONTRADA` | Alerta de error (no es el estado vacío) |
| 0 | — | «No fue posible conectar con el backend.» |

El estado **vacío** es cuando **no se llama** al endpoint porque la empresa no
tiene autoevaluaciones. Un 404 no se maquilla como vacío.

Endpoints auxiliares (solo lectura, para Inicio / índice):

| Método | Path | Uso en SP-204 |
|---|---|---|
| GET | `/empresas` | Selector de empresa |
| GET | `/autoevaluaciones?empresa_id=` | Elegir la más reciente por `fecha` (luego `fecha_creacion`) |

**No** implementar POST crear, PUT calificar ni POST finalizar (SP-189).

### Superficies UI

```
Dashboard / primer viewport (reemplaza el aside slate-900)
┌─────────────────────────────────────────────────────────┐
│ Ciclo PHVA          Puntaje 72,50 %  ·  Umbral 85,00 % │
│ Brecha al umbral: 12,50 pts  ·  Requiere plan: sí/no   │
│ [==== Planear 80 %] [== Hacer 40 %] …  (4 barras)      │
│ Brecha por fase bajo cada barra (texto del API)        │
└─────────────────────────────────────────────────────────┘

/diagnostico
  selector empresa → última autoevaluación → mismo gráfico
  enlace «Ver detalle» → /diagnostico/{id}

/diagnostico/:autoevaluacionId
  solo el panel (id de ruta); loading / error / vacío no aplica vacío
  si el id es inválido → error 404
```

### Mapeo de subtareas

No subtasks — plan derived directly from the HU (SP-204 es la subtarea).

## 3. Pasos de implementación

### Paso 0: Rama de feature

- **Acción**: Crear y cambiar a la rama de feature desde `develop` actualizado
- **Rama**: `feature/SP-204-frontend`
- **Comandos**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-204-frontend
  ```

### Paso 1: Modelos del feature `diagnostico`

- Archivos (crear):
  - `src/app/features/diagnostico/modelos/ciclo-phva.ts`
  - `src/app/features/diagnostico/modelos/cumplimiento-phva.model.ts`
  - `src/app/features/diagnostico/modelos/autoevaluacion-resumen.model.ts`
  - `src/app/features/diagnostico/modelos/empresa-diagnostico.model.ts`
  - `src/app/features/diagnostico/modelos/index.ts`
- Contenido:
  - `CicloPhva` y constante ordenada `CICLOS_PHVA: readonly CicloPhva[] = ['PLANEAR', 'HACER', 'VERIFICAR', 'ACTUAR']`.
  - Interfaces espejo OpenAPI (nombres de campos en snake_case del JSON).
  - `AutoevaluacionResumen`: `id`, `empresa_id`, `fecha`, `puntaje_total: string | null`, `requiere_plan_mejora`, `fecha_creacion`.
  - `EmpresaDiagnostico`: mismo shape que `EmpresaMatriz` (`id`, `razon_social`, `nit`) — tipo propio del feature para no importar matriz-riesgos.
- Reutilizar `RespuestaErrorApi` de `nucleo/auth/modelos` (no duplicar).

### Paso 2: Servicios HTTP tipados

- Archivos:
  - `src/app/features/diagnostico/servicios/servicio-cumplimiento-phva.ts`
  - `src/app/features/diagnostico/servicios/servicio-cumplimiento-phva.spec.ts`
  - `src/app/features/diagnostico/servicios/servicio-autoevaluaciones.ts`
  - `src/app/features/diagnostico/servicios/servicio-autoevaluaciones.spec.ts`
  - `src/app/features/diagnostico/servicios/servicio-empresas-diagnostico.ts`
  - `src/app/features/diagnostico/servicios/servicio-empresas-diagnostico.spec.ts`
- `providedIn: 'root'`, `inject(HttpClient)`, base `environment.apiBaseUrl`.
- **Nunca** `HttpClient` en componentes. **Nunca** `catchError` en el servicio
  (el interceptor de auth sigue centralizado; el contenedor pinta el error).
- Firmas:
  ```ts
  obtenerCumplimiento(autoevaluacionId: string): Observable<RespuestaCumplimientoPhva>
  // GET `${base}/autoevaluaciones/${encodeURIComponent(id)}/cumplimiento-phva`

  listarPorEmpresa(empresaId: string): Observable<AutoevaluacionResumen[]>
  // GET `${base}/autoevaluaciones?empresa_id=${encodeURIComponent(id)}`

  listarEmpresas(): Observable<EmpresaDiagnostico[]>
  // GET `${base}/empresas`
  ```
- Helper privado `id(valor: string): string` con `encodeURIComponent` (mismo
  patrón que `ServicioMatrizRiesgos`).

### Paso 3: Componente presentacional `GraficoCumplimientoPhvaComponent`

- Carpeta (cuatro archivos, `templateUrl` + `styleUrls`, OnPush, standalone):
  `src/app/features/diagnostico/componentes/grafico-cumplimiento-phva/`
- Selector: `app-grafico-cumplimiento-phva`
- API (solo `@Input` / `@Output` decorators — **prohibido** `input()`/`output()`):

  | Input | Tipo | Rol |
  |---|---|---|
  | `cumplimiento` | `RespuestaCumplimientoPhva \| null` | Datos del API |
  | `estado` | `'cargando' \| 'vacio' \| 'error' \| 'listo'` | Mutuamente excluyente |
  | `mensajeError` | `string` | Solo si `error` |

  Output opcional: `alReintentar` (`EventEmitter<void>`) para el estado error.

- Render:
  1. **cargando**: cuatro placeholders (`animate-pulse` / barras `bg-slate-700/40`)
     + `role="status"` «Cargando cumplimiento PHVA».
  2. **vacio**: texto «No hay autoevaluación para mostrar el cumplimiento PHVA.»
     (`role="status"`). Sin barras inventadas.
  3. **error**: `app-alerta` tipo `error` + botón secundario «Reintentar».
  4. **listo**:
     - Encabezado: puntaje total + umbral (strings del API, con `%` en UI).
     - Chip de perfil (`perfil`) y de `finalizada` (Borrador / Finalizada).
     - Si `requiere_plan_mejora`: `app-alerta` tipo `advertencia` «Requiere plan
       de mejora (umbral {{ umbral_plan_mejora }} %).»
     - Indicador de **brecha global**: distancia al umbral calculada **solo
       para presentación** como
       `max(0, Number(umbral_plan_mejora) - Number(puntaje_total))`,
       formateada a 2 decimales. No es recálculo normativo: el booleano
       `requiere_plan_mejora` del API es la fuente de verdad.
     - Cuatro barras en orden `CICLOS_PHVA` (reordenar si el array llega
       desordenado; **no** interpolar fases faltantes con 0 — si faltara una,
       mostrar hueco accesible «Sin dato»).
     - Ancho CSS: `width: ${clamp(Number(porcentaje_cumplimiento), 0, 100)}%`.
       La etiqueta visible muestra el **string original** (`80.00 %`), no el
       número parseado.
     - Bajo cada barra: `Brecha: {{ brecha }} pts` (campo API).
     - Colores (ya usados en dashboard): Planear indigo, Hacer emerald,
       Verificar amber, Actuar sky.
- Accesibilidad:
  - Cada barra: `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`,
    `aria-valuenow` numérico, `aria-label="Planear: 80.00 por ciento"`.
  - Contenedor: `aria-labelledby` con «Ciclo PHVA».
  - Contraste: panel oscuro actual (`bg-slate-900`) o superficie clara
    `sst-superficie`; preferir **conservar el aside oscuro** del Inicio y
    variante clara en `/diagnostico` vía Input `variante: 'oscuro' | 'claro'`
    (default `claro`).
- Responsive: apiladas en `<sm`, fila/grid 4 columnas desde `md`. Mínimo 360 px.
- Sin lógica HTTP. Sin `NgRx`. Signals internos opcionales solo como estado
  derivado de getters a partir de `@Input` (el patrón de `SemaforoRiesgoComponent`).

### Paso 4: Contenedor `PanelCumplimientoPhvaComponent`

- Carpeta:
  `src/app/features/diagnostico/componentes/panel-cumplimiento-phva/`
- Selector: `app-panel-cumplimiento-phva`
- Inputs: `autoevaluacionId: string | null`, `recarga` (firma de calificaciones),
  `variante` (se reenvía al gráfico).
- Comportamiento:
  - `autoevaluacionId` vacío/null → `estado = 'vacio'` (no HTTP).
  - Cambio de id → `estado = 'cargando'`, llama
    `ServicioCumplimientoPhva.obtenerCumplimiento`, OnPush + `markForCheck`.
  - Cambio de `recarga` (mismo id) → debounce 400 ms y refetch **silencioso**
    (no borrar barras ni pasar a `cargando`).
  - Éxito → `listo` + datos. Error `HttpErrorResponse` → mapear
    `mensajeErrorHttp` (mismo patrón que el resto del feature).
  - Reintento re-dispara la carga (no silenciosa).
  - Cancelar suscripción y timer de debounce en `ngOnDestroy`. Incrementar un
    contador de secuencia para ignorar respuestas tardías.
- Template: solo `<app-grafico-cumplimiento-phva ...>`.

### Paso 5: Integración en dashboard (Inicio)

- Archivos:
  - `features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.{ts,html,spec.ts}`
  - `features/dashboard/README.md`
- Sustituir el aside de barras fijas (`aria-label="Fases PHVA"` con `h-2`
  indigo/emerald/amber/sky al 100 %) por:
  1. `<select>` de empresas (carga `ServicioEmpresas.listar()`
     en `ngOnInit`; cancelar el GET previo al reintentar).
  2. Al elegir empresa: `listarPorEmpresa` → tomar la más reciente
     (`fecha` DESC, empate `fecha_creacion` DESC).
  3. `<app-panel-cumplimiento-phva [autoevaluacionId]="idSeleccionada" variante="oscuro">`.
- Si no hay empresas o el listado de autoevaluaciones está vacío: el panel
  queda en vacío (cumple CA «sin autoevaluación»).
- Opcional acotado (recomendado): cuando hay `cumplimiento` en memoria,
  actualizar `TarjetaResumen` «Puntaje 0312» con `puntaje_total` + sufijo `%`
  y subtítulo según `requiere_plan_mejora`. No inventar el número.
- CTA «Nueva autoevaluación» navega a `/diagnostico` (matriz SP-189).
- RBAC: lectura para cualquier autenticado (incluido `CONSULTA`). No ocultar
  el gráfico.

### Paso 6: Integrar el panel en las páginas de SP-189

- No crear `pagina-detalle-cumplimiento` ni rutas `:autoevaluacionId`.
- Embeber `<app-panel-cumplimiento-phva>` (variante clara) en:
  - `pagina-diagnostico` — encima de la matriz, con `[autoevaluacionId]` y
    `[recarga]="firmaCalificaciones"` (debounce 400 ms, refresco silencioso).
  - `pagina-detalle-diagnostico` — igual, en solo lectura si ya hay puntaje.
- Conservar las rutas anidadas de SP-189 (`historico` **antes** de `:id`).
- La barra lateral ya enlaza a `/diagnostico` (SP-189).

### Paso 7: Errores y estados (sin interceptor nuevo)

- No añadir códigos HTTP ni cambiar `RespuestaErrorApi`.
- Mapeo UI en el contenedor (Paso 4), no en el servicio.
- 401: no-op en el feature (ya lo cubre `interceptorAutenticacion`).
- Formato de error del API (campos en español en el backend actual):

```json
{
  "exito": false,
  "codigo": "AUTOEVALUACION_NO_ENCONTRADA",
  "mensaje": "Descripción legible",
  "detalle": []
}
```

### Paso 8: Pruebas unitarias

- `servicio-cumplimiento-phva.spec.ts` (`HttpClientTestingModule`):
  - GET a la URL correcta con id codificado (`empresa/1` → `%2F`).
  - El body tipado se reemite sin transformar campos.
- Reusar specs de `servicio-autoevaluaciones` / `servicio-empresas` (SP-189).
- `grafico-cumplimiento-phva.component.spec.ts`:
  - `listo`: cuatro etiquetas Planear/Hacer/Verificar/Actuar y los `%` del API
    (p. ej. `"80.00"` visible; **no** un porcentaje calculado en el spec a
    partir de puntaje/peso).
  - `aria-valuenow` coincide con el número parseado del string.
  - Brecha por fase visible (`"4.50"`).
  - Brecha global / alerta de plan de mejora cuando
    `requiere_plan_mejora === true`.
  - `cargando` / `vacio` / `error` (alerta + emit de reintentar).
  - Orden forzado PHVA aunque el API entregue `ACTUAR` primero.
- `panel-cumplimiento-phva.component.spec.ts`:
  - sin id → no HTTP, estado vacío.
  - id → flush 200 → listo.
  - flush 404 → error con mensaje del API.
- `pagina-dashboard.component.spec.ts`:
  - mock de los tres servicios; sin empresas → texto de vacío PHVA.
  - con empresa + autoevaluación + cumplimiento → aparece el `%` de una fase.
  - ya no existen las cuatro barras decorativas a ancho completo sin datos
    (el aside deja de ser solo ornamentación).
- Specs de `pagina-diagnostico` / `pagina-detalle-diagnostico`: mock de
  `ServicioCumplimientoPhva` para no disparar HTTP real al embeber el panel.
- `barra-lateral.component.spec.ts`: Diagnóstico es enlace a `/diagnostico` (SP-189).
- Nombres: `should …` + resto en español (convención del repo).
- AAA. Cobertura ≥ 90 % en archivos nuevos.

### Paso 9: Documentación

- Crear `src/app/features/diagnostico/README.md`: alcance SP-204 vs SP-189,
  contrato del endpoint, decisión de no usar librería de charts, estados UI.
- Actualizar `src/app/features/dashboard/README.md`: el panel PHVA deja de ser
  decorativo; métrica 0312 puede alimentarse del mismo GET.
- No hay `ai-specs/specs/api-spec.yml` ni `data-model.md` en este repo; el
  contrato vive en el backend. No duplicar OpenAPI aquí.

## 4. Orden de implementación

```
Paso 0  rama feature/SP-204-frontend
  → Paso 1  modelos
  → Paso 2  servicios HTTP + specs (TDD: specs del servicio en rojo primero)
  → Paso 3  gráfico presentacional + spec
  → Paso 4  panel contenedor + spec
  → Paso 5  dashboard
  → Paso 6  páginas, rutas, nav
  → Paso 7  mapeo de errores (incluido en 4–6)
  → Paso 8  resto de tests + cobertura
  → Paso 9  README
```

## 5. Checklist de pruebas

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` muestra >= 90 % en archivos nuevos/tocados
- [ ] Manual — Inicio: sin empresa / sin autoevaluación → vacío
- [ ] Manual — Inicio: empresa con autoevaluación → 4 barras = `%` del API
- [ ] Manual — brecha por fase y brecha/umbral 85 % legibles
- [ ] Manual — error (API caído o id inventado en detalle) → alerta + reintentar
- [ ] Manual — `/diagnostico` y `/diagnostico/{id}` coherentes con Inicio

Verificación HTTP de referencia (backend local, sustituir token e id):

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/autoevaluaciones/{id}/cumplimiento-phva
# 200 RespuestaCumplimientoPHVA
# 401 sin token
# 404 AUTOEVALUACION_NO_ENCONTRADA
```
- [ ] Manual — viewport ~360 px: barras apiladas, textos no recortados
- [ ] Manual — rol `CONSULTA` ve el gráfico (solo lectura)
- [ ] Tests existentes (dashboard, barra-lateral, matriz) no rotos
- [ ] `ng build` OK

## 6. Referencia de tooling

Comandos resueltos desde `openspec/config.yaml` para el stack activo:

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de errores

El backend responde (campos actuales del frontend: `exito` / `codigo` /
`mensaje` / `detalle`):

```json
{
  "exito": false,
  "codigo": "AUTOEVALUACION_NO_ENCONTRADA",
  "mensaje": "Descripción legible para el auditor",
  "detalle": []
}
```

Mapeo HTTP de referencia: 400 `ERROR_VALIDACION` | 404 `AUTOEVALUACION_NO_ENCONTRADA` /
`EMPRESA_NO_ENCONTRADA` | 403 `ACCESO_DENEGADO` | 500 `ERROR_INTERNO`.

SP-204 no introduce códigos nuevos.

## 8. Dependencias

- **npm**: ninguna. Prohibido añadir librerías de charts.
- **Backend**: SP-203 (`GET .../cumplimiento-phva`) debe responder 200 en local.
- **Frontend**: SP-242 (home + panel PHVA decorativo) ya en `develop`.
- **No bloquea**: SP-189 (se integrará después reutilizando `features/diagnostico/`).

## 9. Notas

- **Fuente de verdad de las barras**: `porcentaje_cumplimiento` del API. Está
  prohibido calcular `(puntaje_obtenido / peso_maximo) * 100` en el cliente
  para pintar o para tests de CA.
- `brecha` de fase son **puntos de peso**, no puntos porcentuales globales.
  Etiquetar «pts» para no confundir al auditor con el % de la barra.
- Preview en vivo: el endpoint **no** exige `finalizada`. Mostrar chip
  Borrador/Finalizada; las barras aplican igual.
- Component API: solo `@Input()` / `@Output()`. Signal inputs están bloqueados
  (NG0950 / NG0303 con Angular 17.3.12 + jest-preset-angular 13.1.6).
- Un componente por carpeta; cuatro archivos; OnPush; standalone.
- Identificadores de código en español (`GraficoCumplimientoPhvaComponent`,
  `obtenerCumplimiento`, `estado`, `mensajeError`).
- Rama: `feature/SP-204-frontend` (nunca `-backend` en este stack).
- No commitear `.angular/`, `node_modules/`, `dist/`, `.env`.

**Fuera de alcance**

- Reimplementar la matriz SP-189 (ya en `develop`); este ticket solo pinta PHVA.
- Recalcular perfil Res. 0312, umbral o `NO_APLICA` virtual en el cliente.
- PDF, IA, GTC 45, plan de mejora, chat.
- NgRx store para este recorte (signals / campos del componente bastan).
- Cambiar tokens globales salvo que el contraste WCAG del panel lo exija
  (entonces documentar en `src/styles/README.md`).

## 10. Checklist de verificación de implementación

- [ ] Calidad: sin errores de compilación; `npm run lint:eslint` pasa
- [ ] Arquitectura: stack agent Angular (OnPush, smart/dumb, HTTP en servicios)
- [ ] Tests: verdes, cobertura >= 90 % en lo nuevo
- [ ] Documentación: README de `diagnostico` y `dashboard` actualizados
- [ ] Rama: `feature/SP-204-frontend`
- [ ] CA: barras = API; brecha legible; ARIA; responsive; specs verdes
