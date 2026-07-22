# Plan de implementación: SP-242 Creación pantalla principal usuario

## 1. Resumen

Elevar `/dashboard` de cascarón genérico (SP-238) a **pantalla principal del
usuario autenticado** (home de producto) en `sst-auditor-agent-pro-frontend`,
integrando de forma real la librería compartida:

- SP-239: `Boton`, `Alerta`, `Modal`+`ServicioModal`, `Tooltip`, `Tabla`
- SP-240: `FormularioDinamico` solo fuera del primer viewport (accordion
  “Herramientas” o eliminado)
- SP-241: `ServicioLoader` en un CTA de producto (“Actualizar resumen”)

Sin endpoints nuevos: actividad y métricas siguen mock/placeholder. Ruta
permanece `/dashboard`; la nav lateral muestra **“Inicio”**.

Stack activo: `frontend-angular` (Angular 17.3 standalone + Tailwind + CDK).
Idioma: español.

**Precondiciones:**

- SP-238, SP-239, SP-240 en `develop`
- SP-241 (`ServicioLoader`) mergeado en `develop` **o** rama basada en
  `feature/SP-241-frontend` si el PR #12 aún no está mergeado

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 SP del enriquecimiento. Refactor de UI
  existente + modelo/servicio mock + Tabla/Modal/Loader/Alerta + limpieza de
  demos + specs. Sin API ni módulos de negocio nuevos.
- **Subtasks**: ninguna en Jira (SP-242 es subtarea de SP-239).
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Active stack: `frontend-angular` (Angular)
- Capas / archivos (rutas relativas a `src/app/`):

  - **Modelo** (crear):
    - `features/dashboard/modelos/fila-actividad-home.model.ts`
  - **Servicio mock** (crear):
    - `features/dashboard/servicios/servicio-resumen-home.ts`
    - `features/dashboard/servicios/servicio-resumen-home.spec.ts`
  - **Página home** (modificar):
    - `features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.{ts,html,css,spec.ts}`
  - **Presentacional opcional** (crear solo si la página supera ~200 líneas):
    - `features/dashboard/componentes/saludo-home/` — opcional
    - Preferencia del plan: **mantener en la página** y extraer solo si
      la legibilidad lo exige
  - **Nav** (modificar):
    - `layout/componentes/barra-lateral/barra-lateral.component.html` (+ spec
      si existe/assert de “Inicio”)
  - **Docs** (modificar):
    - `features/dashboard/README.md`

### Layout del primer viewport (orden obligatorio)

```
1. Saludo (Hola, {nombre}) + rol + CTA group (Boton)
2. Alerta informativa (módulos en construcción)
3. Grid 4× TarjetaResumen
4. Grid accesos + panel PHVA (reutilizar/ajustar contenido actual)
5. Actividad reciente (Tabla)
--- fuera del primer viewport ---
6. Accordion "Herramientas" (demos formulario/loader) O eliminar demos
```

### Decisión demos SP-240/241

**Elegida:** accordion `<details>` al final, cerrado por defecto, título
“Herramientas de componentes (QA)”. Alternativa válida: eliminar demos por
completo si el accordion complica tests — documentar en README.

### Mapeo de subtareas

No subtasks — plan derived directly from the HU (SP-242 es la subtarea).

## 3. Pasos de implementación

### Step 0: Rama de feature

- **Acción**: Crear rama desde `develop` actualizado (con SP-241 si ya
  mergeó; si no, desde `feature/SP-241-frontend` o esperar merge)
- **Rama**: `feature/SP-242-frontend`
- **Comandos**:
  ```bash
  git checkout develop && git pull origin develop
  # Si SP-241 aún no está en develop:
  # git merge origin/feature/SP-241-frontend   # o rebase según flujo del equipo
  git checkout -b feature/SP-242-frontend
  ```
- **Verificación**:
  ```ts
  import { ServicioLoader, ServicioModal, TablaComponent, AlertaComponent } from '@app/shared';
  ```
  resuelve sin error.

### Step 1: Modelo `FilaActividadHome`

- Archivo: `features/dashboard/modelos/fila-actividad-home.model.ts`
  ```ts
  export type EstadoActividadHome = 'completado' | 'pendiente' | 'en_curso';

  export interface FilaActividadHome {
    id: string;
    fecha: string;
    evento: string;
    estado: EstadoActividadHome;
  }
  ```

### Step 2: `ServicioResumenHome` (mock, sin HTTP)

- `providedIn: 'root'` o `providedIn` a nivel feature; preferir `root` simple
- API:
  - `obtenerActividad(): FilaActividadHome[]` — copia de constante interna
  - `refrescarActividad(): FilaActividadHome[]` — nueva permutación / timestamp
    en eventos (simula “actualización”)
- Sin `HttpClient`; sin side effects globales
- Spec: retorna ≥ 1 fila; `refrescar` no muta la constante original (inmutable)

### Step 3: Reestructurar `PaginaDashboardComponent`

**Imports `@app/shared`:** `BotonComponent`, `AlertaComponent`,
`TablaComponent`, `ColumnaTabla`, `ServicioModal`, `ModalComponent`,
`DatosModal`, `ServicioLoader`, `PasoEjecucion`, `TooltipDirective`
(formulario solo en accordion).

**Estado de la página:**

```ts
actividad: FilaActividadHome[] = [];
actividadCargando = false;
alertaExitoVisible = false;
mensajeAlerta = '';
mostrarHerramientas = false; // si no se usa <details> nativo

columnasActividad: ColumnaTabla<FilaActividadHome>[] = [
  { clave: 'fecha', encabezado: 'Fecha', ordenable: true },
  { clave: 'evento', encabezado: 'Evento' },
  {
    clave: 'estado',
    encabezado: 'Estado',
    plantilla: (f) => etiquetaEstado(f.estado),
  },
];
trackActividad = (item: FilaActividadHome) => item.id;
```

**Métodos:**

- `ngOnInit` / constructor: cargar `actividad` desde servicio
- `abrirComoEmpezar()` → `ServicioModal.abrir(ModalComponent, { data: { titulo, mensaje, cerrable: true } })`
- `actualizarResumen()` → loader con 3 pasos → `refrescarActividad` →
  `alertaExitoVisible = true` + `markForCheck`; limpiar timers en
  `ngOnDestroy` / `alCancelar$`
- CTA escritura (p. ej. “Nueva autoevaluación”) con `*appSiTieneRol` →
  mensaje local o modal “próximamente” (sin ruta Diagnóstico real)

**Plantilla (hero):**

```html
<header class="…" aria-labelledby="titulo-home">
  <h1 id="titulo-home">Hola, {{ autenticacion.usuarioActual()?.nombre_completo }}</h1>
  <p>Rol: {{ autenticacion.usuarioActual()?.rol }} · SG-SST</p>
  <div class="flex gap-3">
    <app-boton (alHacerClic)="abrirComoEmpezar()">¿Cómo empezar?</app-boton>
    <app-boton variante="secundario" (alHacerClic)="actualizarResumen()">
      Actualizar resumen
    </app-boton>
    <app-boton *appSiTieneRol="['ADMINISTRADOR','AUDITOR_SST']" …>
      Nueva autoevaluación
    </app-boton>
  </div>
</header>

<app-alerta *ngIf="alertaExitoVisible" tipo="exito" … />
<app-alerta tipo="informativa" mensaje="Los módulos de diagnóstico y planes se habilitarán en próximos entregables." />
```

**Tabla:**

```html
<section aria-labelledby="titulo-actividad">
  <h2 id="titulo-actividad">Actividad reciente</h2>
  <app-tabla
    [columnas]="columnasActividad"
    [datos]="actividad"
    [cargando]="actividadCargando"
    [trackearPor]="trackActividad"
    mensajeVacio="Aún no hay actividad registrada"
  />
</section>
```

**Limpieza:**

- Quitar del primer viewport: bloques “Demo formulario dinámico” y
  “Demo loader interactivo”
- Mover a `<details>` final **o** borrar; actualizar specs en consecuencia
- Conservar StatCards + accesos + PHVA (ajustar copy si hace falta)
- `appTooltip` en tarjeta Diagnóstico “próximamente”

### Step 4: Barra lateral → “Inicio”

- En `barra-lateral.component.html`:
  - `aria-label` / texto visible: **Inicio** (antes “Dashboard”)
  - `routerLink="/dashboard"` sin cambio
- Spec de barra (si no hay, smoke en shell o test mínimo de template):
  expect texto “Inicio”

### Step 5: README dashboard

Actualizar alcance:

- Home de producto post-login
- Componentes shared usados
- Demos QA en accordion (o eliminadas)
- Métricas reales = tickets futuros (SP-189, etc.)

### Step 6: Tests

**`pagina-dashboard.component.spec.ts`**

- Saludo con `nombre_completo` / `rol` del usuario mock
- Tabla presente con filas (o mensaje vacío si se fuerza lista `[]`)
- Spy `ServicioModal.abrir` al CTA “¿Cómo empezar?”
- Spy `ServicioLoader.mostrar` + `fakeAsync` hasta `ocultar` en
  “Actualizar resumen”
- `CONSULTA`: no ve botón “Nueva autoevaluación”; `AUDITOR_SST` sí
- Primer viewport / texto: no contiene “Demo formulario dinámico” ni
  “Demo loader interactivo” **antes** de abrir accordion (si accordion:
  query `details` closed; si eliminado: assert ausencia total)
- Alerta informativa visible

**`servicio-resumen-home.spec.ts`**

- `obtenerActividad` / `refrescarActividad` inmutabilidad

**`barra-lateral`:** assert “Inicio”

### Step 7: Verificación final

```bash
npm test
npm run test:coverage
npx ng build
```

- Checklist de criterios de aceptación del enriquecimiento

## 4. Orden de implementación

```
Step 0 rama (+ asegurar SP-241)
  → Step 1 modelo
  → Step 2 servicio mock
  → Step 3 reestructurar página + accordion demos
  → Step 4 nav “Inicio”
  → Step 5 README
  → Step 6–7 tests + verify
```

## 5. Checklist de pruebas

- [ ] `npm test` 0 fallos
- [ ] Cobertura razonable en `features/dashboard/**` (≥ 90 % en archivos
      nuevos/tocados densos)
- [ ] Manual: login → home con saludo; modal; loader; tabla; RBAC
- [ ] Manual: demos no en primer viewport
- [ ] Manual: nav “Inicio”
- [ ] `npx ng build` OK

## 6. Referencia de tooling

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de errores

N/A — sin endpoints. Errores de auth existentes no cambian.

## 8. Dependencias

- **SP-238 / 239 / 240**: en `develop`
- **SP-241**: requerido para CTA loader; mergear PR #12 antes o basar rama
  en esa feature
- **npm**: ninguna nueva
- **Backend / OpenAPI**: no aplica

## 9. Notas / fuera de alcance

- Rutas reales de Diagnóstico / planes / GTC 45
- APIs de métricas o actividad
- Nueva ruta `/inicio` (opcional; no requerida)
- Signal inputs
- Theming Material
- Rediseño del shell (sidebar/cabecera) más allá del label “Inicio”

**Rama**: `feature/SP-242-frontend`

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| SP-241 no mergeado | Mergear #12 primero o branch desde `feature/SP-241-frontend` |
| Página demasiado grande | Extraer `saludo-home` / `panel-actividad` si > ~250 líneas |
| Timers loader en tests | `fakeAsync`/`tick` + `ngOnDestroy` cleanup (patrón SP-241) |
| Demos en primer viewport | Checklist visual + assert de texto en spec |
| `TablaComponent` genérico + plantilla estado | Usar `plantilla` en `ColumnaTabla` |

## 11. Definition of Done

- [ ] Plan ejecutado en `feature/SP-242-frontend`
- [ ] Home de producto cumple AC del enriquecimiento
- [ ] Tests verdes; PR a `develop` listo para `os-review`
