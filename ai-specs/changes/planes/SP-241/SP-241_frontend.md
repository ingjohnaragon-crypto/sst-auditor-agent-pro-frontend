# Plan de implementación: SP-241 Creación de loader interactivo en ejecuciones del sistema

## 1. Resumen

Implementar en `sst-auditor-agent-pro-frontend` un **loader interactivo**
reutilizable para ejecuciones largas del sistema (diagnósticos del agente,
autoevaluaciones, generación de planes, cargas masivas, etc.) bajo
`shared/components/loader/`.

Piezas:

1. Modelo `PasoEjecucion` / `ConfiguracionLoader`
2. `LoaderInteractivoComponent` (`app-loader-interactivo`) — UI presentacional
3. `ServicioLoader` (`providedIn: 'root'`) — API programática (un solo loader activo)
4. Host en `ShellComponent` para modo `bloqueante` a nivel app
5. Demo “Simular ejecución” en dashboard
6. Specs con cobertura ≥ 90 % en `loader/**`

No es el spinner de `BotonComponent.cargando` ni el skeleton de tabla: comunica
**pasos** y **progreso** mientras el usuario espera. Sin HTTP propio.

Stack activo: `frontend-angular` (Angular 17.3 standalone + Tailwind + CDK).
Idioma: español (identificadores, tests, docs).

**Precondiciones (SP-239 / SP-240 ya en `develop` o rama actual):**

- Convención carpeta-por-componente, `OnPush`, `templateUrl`/`styleUrls`
- Barrel `@app/shared`
- `BotonComponent` para CTA cancelar
- Tokens `--sst-*` / clases `sst-*`
- `@angular/cdk` materializado (`a11y` FocusTrap)

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 SP del enriquecimiento. Un componente +
  servicio global + host en shell + a11y (focus trap, Esc condicional) +
  demo + specs. Menos superficie que SP-240 (formulario); mayor cuidado en
  modo bloqueante y en el contrato del servicio. Sin endpoints ni jobs reales.
- **Subtasks**: ninguna en Jira (SP-241 es subtarea de SP-239).
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Active stack: `frontend-angular` (Angular)
- Capas y archivos (rutas relativas a `src/app/`):

  - **Modelo** (crear):
    - `shared/components/loader/paso-ejecucion.model.ts`
  - **Presentación** (crear):
    - `shared/components/loader/loader-interactivo.component.{ts,html,css,spec.ts}`
  - **Servicio** (crear):
    - `shared/components/loader/servicio-loader.ts`
    - `shared/components/loader/servicio-loader.spec.ts`
  - **Barrel** (modificar):
    - `shared/components/index.ts` — exportar modelo + componente + servicio
  - **Host bloqueante** (modificar):
    - `layout/shell/shell.component.{ts,html,spec.ts?}` — montar
      `<app-loader-interactivo>` enlazado a `ServicioLoader`
  - **Demo** (modificar):
    - `features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.{ts,html,spec.ts}`

### Decisión de overlay (documentada)

**Elegida: overlay CSS + host en Shell + CDK FocusTrap** (no `Dialog.open`).

| Opción | Pros | Contras |
|---|---|---|
| CDK Dialog (como Modal) | Focus trap / Esc gratis | Confunde loader con modal; un Dialog a la vez ya usado por Modal |
| Overlay CSS en Shell | Simple, un solo host, control total del estado vía servicio | Hay que cablear FocusTrap y Esc a mano |
| Solo Inputs en features | Cero shell | Modo bloqueante no cubre toda la app |

El servicio emite `ConfiguracionLoader | null`. El Shell suscribe (async pipe
o getter + `markForCheck`) y pasa props al componente. Modo `inline`: la
feature usa el componente directamente sin el host global.

### Mapeo de subtareas

No subtasks — plan derived directly from the HU (SP-241 es la subtarea).

## 3. Pasos de implementación

### Step 0: Rama de feature

- **Acción**: Crear y cambiar a la rama de feature
- **Rama**: `feature/SP-241-frontend`
- **Comandos**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-241-frontend
  ```
- **Verificación**: `node_modules/@angular/cdk/a11y` existe;
  `import { BotonComponent } from '@app/shared'` resuelve.
- **Nota**: si SP-240 aún no está mergeado en `develop`, ramificar desde
  `develop` actual (loader no depende del formulario).

### Step 1: Modelo

- Archivo: `shared/components/loader/paso-ejecucion.model.ts`
- Contenido:
  ```ts
  export type EstadoPasoEjecucion =
    | 'pendiente'
    | 'activo'
    | 'completado'
    | 'error';

  export interface PasoEjecucion {
    id: string;
    etiqueta: string;
    detalle?: string;
    estado: EstadoPasoEjecucion;
  }

  export type ModoLoader = 'bloqueante' | 'inline';

  export interface ConfiguracionLoader {
    visible: boolean;
    titulo: string;
    mensaje?: string;
    pasos: PasoEjecucion[];
    /** 0–100; null = indeterminado */
    progreso: number | null;
    modo: ModoLoader;
    cancelable: boolean;
    etiquetaCancelar: string;
  }

  export const CONFIGURACION_LOADER_POR_DEFECTO: ConfiguracionLoader = {
    visible: true,
    titulo: 'Procesando…',
    mensaje: undefined,
    pasos: [],
    progreso: null,
    modo: 'bloqueante',
    cancelable: false,
    etiquetaCancelar: 'Cancelar',
  };
  ```

### Step 2: `ServicioLoader`

- Archivo: `shared/components/loader/servicio-loader.ts`
- `providedIn: 'root'`
- Estado interno: `BehaviorSubject<ConfiguracionLoader | null>` (null = oculto)
- API:
  - `readonly estado$ = this.sujeto.asObservable()`
  - `mostrar(parcial: Partial<ConfiguracionLoader>): void` — merge con
    defaults; si ya hay uno activo, lo **reemplaza** (un solo loader)
  - `actualizar(parcial: Partial<ConfiguracionLoader>): void` — no-op si null
  - `actualizarPaso(id, estado, detalle?): void` — clona `pasos`, muta el id
  - `ocultar(): void` — emite `null`
  - `readonly alCancelar$` o `EventEmitter`/`Subject<void>` para que el Shell
    reenvíe cancelaciones al consumidor (opcional: el dashboard escucha
    `alCancelar$` en la demo)
- Sin HTTP; sin DOM (el Shell/componente renderizan)

### Step 3: `LoaderInteractivoComponent`

- Carpeta: `shared/components/loader/`
- Selector: `app-loader-interactivo`
- Standalone + `OnPush` + `templateUrl` / `styleUrls`
- Imports: `NgIf`, `NgFor`, `NgClass` (si hace falta), `BotonComponent`
- Inputs/Outputs según enriquecimiento (`@Input`/`@Output` — **no** signal inputs)
- Plantilla:
  - `*ngIf="visible"` envuelve todo
  - **bloqueante**: contenedor `fixed inset-0 z-50` + backdrop
    `bg-slate-900/40` + panel centrado `sst-superficie`
  - **inline**: solo el panel, sin fixed/backdrop
  - Spinner (anillo `animate-spin` como en botón)
  - Título (`id` estable p. ej. `loader-titulo`) + mensaje opcional
  - Barra si `progreso !== null` (`role="progressbar"`, `aria-valuenow/min/max`)
  - Lista de pasos (`role="list"`) con `trackBy` por `id`; iconos/estados
  - Región `aria-live="polite"` con el paso activo / mensaje
  - Botón cancelar si `cancelable` → emite `alCancelar`
- a11y bloqueante:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="loader-titulo"`,
    `aria-busy="true"`
  - `CdkTrapFocus` (`@angular/cdk/a11y`) cuando `visible && modo === 'bloqueante'`
  - Listener `keydown.escape` → cancelar solo si `cancelable`
  - Clic en backdrop → igual (solo si `cancelable`)
- Texto plano en etiquetas (sin `innerHTML`)

### Step 4: Host en Shell

- `shell.component.ts`:
  - `inject(ServicioLoader)`
  - Exponer `estado$` (o `async` en plantilla)
  - Importar `LoaderInteractivoComponent`, `AsyncPipe`, `NgIf`
- `shell.component.html` (al final del layout):
  ```html
  <app-loader-interactivo
    *ngIf="loader.estado$ | async as cfg"
    [visible]="cfg.visible"
    [titulo]="cfg.titulo"
    [mensaje]="cfg.mensaje"
    [pasos]="cfg.pasos"
    [progreso]="cfg.progreso"
    [modo]="cfg.modo"
    [cancelable]="cfg.cancelable"
    [etiquetaCancelar]="cfg.etiquetaCancelar"
    (alCancelar)="onCancelarLoader()"
  />
  ```
- `onCancelarLoader()`: emitir en `ServicioLoader` (p. ej. `notificarCancelacion()`)
  y opcionalmente `ocultar()` — en demo, el dashboard decide si oculta al cancelar.
  **Regla**: el componente solo emite; el servicio notifica; el **consumidor**
  (dashboard/feature) llama `ocultar()` tras cancelar, salvo que se documente
  auto-ocultar. Preferencia del plan: **auto-ocultar en cancelación** para UX
  simple, y emitir `alCancelar$` para que features aborten trabajo.

### Step 5: Barrel

- En `shared/components/index.ts` añadir:
  ```ts
  export * from './loader/paso-ejecucion.model';
  export * from './loader/loader-interactivo.component';
  export * from './loader/servicio-loader';
  ```

### Step 6: Demo en dashboard

- Inyectar `ServicioLoader`
- CTA `app-boton`: “Simular ejecución”
- Flujo (timers ~400–600 ms entre pasos; en tests `fakeAsync`/`tick`):
  1. `mostrar({ titulo: 'Ejecutando diagnóstico…', cancelable: true, pasos: [...] })`
  2. `actualizarPaso` secuencial + `actualizar({ progreso: n })`
  3. `ocultar()` al final
- Suscribirse a `alCancelar$` para limpiar timers si el usuario cancela
- Mensaje local opcional: “Ejecución simulada completada / cancelada”

### Step 7: Tests

**`loader-interactivo.component.spec.ts`**

- `visible=false` → no muestra diálogo/panel relevante
- Indeterminado: título + spinner; sin `progressbar`
- `progreso=40` → `aria-valuenow="40"`
- Pasos con los 4 estados visibles en DOM
- `cancelable=true` → clic botón emite `alCancelar`
- `cancelable=true` + Esc emite; `cancelable=false` + Esc no emite
- Backdrop clic solo cancela si `cancelable`
- Modo `inline` no aplica `fixed`/`aria-modal` (o no monta backdrop)

**`servicio-loader.spec.ts`**

- `mostrar` → estado no null con defaults mergeados
- Segundo `mostrar` reemplaza el primero
- `actualizarPaso` solo toca el id indicado
- `ocultar` → null
- Cancelación notifica a suscriptores

**`pagina-dashboard.component.spec.ts`**

- CTA dispara flujo; con `fakeAsync` llega a ocultar (mock del servicio o
  servicio real + spy)

### Step 8: Verificación final

```bash
npm test
npm run test:coverage
npx ng build
```

- Revisar cobertura de `src/app/shared/components/loader/**` ≥ 90 % líneas
- Checklist de criterios de aceptación del enriquecimiento

## 4. Orden de implementación

```
Step 0 rama
  → Step 1 modelo
  → Step 2 ServicioLoader
  → Step 3 LoaderInteractivoComponent
  → Step 4 host Shell
  → Step 5 barrel
  → Step 6 demo dashboard
  → Step 7–8 tests + verify
```

## 5. Checklist de pruebas

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` — `loader/**` ≥ 90 %
- [ ] Demo manual: Simular ejecución (pasos + progreso + completar)
- [ ] Demo manual: cancelar con botón y con Esc
- [ ] Demo manual: sin cancelable no cierra con Esc/backdrop
- [ ] Inline smoke (opcional en spec con host de test)
- [ ] Tests existentes no rotos
- [ ] `npx ng build` OK

## 6. Referencia de tooling

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de errores

N/A — sin endpoints HTTP. Errores de ejecución del agente se modelan como
paso con `estado: 'error'` + `detalle` en tickets futuros; este ticket no
define códigos REST.

## 8. Dependencias

- **SP-239**: convenciones + `BotonComponent` + `@app/shared` (disponibles)
- **npm**: ninguna nueva; usar `@angular/cdk/a11y` (`CdkTrapFocus`) ya presente
- **Backend / OpenAPI**: no aplica
- **Decisión overlay**: CSS fixed + Shell host (ver §2); no `Dialog` de CDK

## 9. Notas / fuera de alcance

- Integración real con jobs/SSE/WebSocket del agente
- Persistencia o reanudación de ejecuciones
- Cola de múltiples loaders (solo uno activo)
- Signal-based `input()`/`output()` (bloqueados — NG0950)
- Theming Material; i18n de literales (español estático)
- Reemplazar spinner del botón o skeleton de tabla

**Rama**: `feature/SP-241-frontend` (nunca `-backend` en este stack).

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Loader + Modal a la vez | Documentar: un solo overlay de app; features no abren Modal durante loader bloqueante |
| Focus trap en Jest | Importar `A11yModule` / `CdkTrapFocus`; smoke a11y sin assert estricto de foco si flaky |
| Timers en demo rompen tests | `fakeAsync`/`tick` o inyectar scheduler; limpiar en `ngOnDestroy` |
| Shell sin spec | Añadir smoke mínimo o cubrir vía dashboard + servicio |
| OnPush no refresca pasos | Servicio inmutable (nuevos arrays); async pipe o `markForCheck` en Shell |

## 11. Definition of Done

- [ ] Plan ejecutado en `feature/SP-241-frontend`
- [ ] Código + tests según este plan
- [ ] Criterios de aceptación del enriquecimiento cumplidos
- [ ] PR a `develop` listo para `os-review` / merge
