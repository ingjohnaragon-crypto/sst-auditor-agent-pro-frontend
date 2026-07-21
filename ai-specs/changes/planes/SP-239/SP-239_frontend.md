# Plan de implementación: SP-239 Creación componentes estandar y compartidos para frontend

## 1. Resumen

Construir la librería mínima de componentes compartidos de `sst-auditor-agent-pro-frontend`:
`BotonComponent`, `ModalComponent` (+ `ServicioModal`), `AlertaComponent`, `TooltipDirective`
y `TablaComponent<T>` genérica, todos bajo `shared/components/`, standalone,
`ChangeDetectionStrategy.OnPush`, con estilos exclusivamente en Tailwind y accesibilidad
básica (roles ARIA, foco gestionado, operables por teclado). Se registran en
`shared/components/index.ts` (hoy `export {}`) y quedan disponibles vía `import { ... } from '@app/shared'`.
Al menos una feature existente (dashboard) se actualiza para consumir uno de los componentes
como prueba de integración real.

Stack activo: `frontend-angular` (Angular 17.3 standalone + Tailwind + `@angular/cdk`).
Idioma: español (identificadores, tests, docs).

**Nota crítica de dependencias** — ver [Sección 8](#8-dependencias): `@angular/cdk` está
declarado en `package-lock.json` (17.3.10, como dependencia transitiva de `@angular/material`)
pero **no existe hoy en `node_modules/@angular/`** (verificado: falta el paquete
`@angular/cdk` completo). El Modal (`@angular/cdk/dialog`) y el Tooltip
(`@angular/cdk/overlay`, `@angular/cdk/a11y`) no compilarán hasta ejecutar `npm install`
para materializarlo. Esto **no** viola el requisito "cero dependencias nuevas" del
enriquecimiento (no se toca `package.json`), pero es un paso obligatorio de Step 0.

## Estimación de puntos de historia

<!-- STORY_POINTS:8 -->
- **HU total**: 8 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 8 SP del enriquecimiento. Cinco piezas de UI independientes,
  dos de ellas (Modal, Tooltip) sobre APIs de CDK nuevas en este repo (`Dialog`, `Overlay`,
  `FocusTrap`, `A11yModule`) que no tienen precedente de uso — mayor incertidumbre y curva de
  aprendizaje que un CRUD típico. Se suma la escritura de 6 `.spec.ts` con cobertura de foco/
  teclado/ARIA (más caro que probar lógica pura) y una integración real en dashboard.
- **Subtasks**:
  | Subtask | Points | Note |
  |---|---|---|
  | SP-240 | 8 | Formulario dinámico — depende solo de convenciones compartidas de SP-239, no de que los 5 componentes existan; se planifica por separado |
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Active stack: `frontend-angular` (Angular)
- Capas y archivos afectados (rutas relativas a `src/app/`):

  - **Boton** (crear):
    - `shared/components/boton/boton.component.ts`
    - `shared/components/boton/boton.component.html`
    - `shared/components/boton/boton.component.css`
    - `shared/components/boton/boton.component.spec.ts`
  - **Modal** (crear):
    - `shared/components/modal/modal.component.ts`
    - `shared/components/modal/modal.component.html`
    - `shared/components/modal/modal.component.css`
    - `shared/components/modal/modal.component.spec.ts`
    - `shared/components/modal/servicio-modal.ts`
    - `shared/components/modal/servicio-modal.spec.ts`
  - **Alerta** (crear):
    - `shared/components/alerta/alerta.component.ts`
    - `shared/components/alerta/alerta.component.html`
    - `shared/components/alerta/alerta.component.css`
    - `shared/components/alerta/alerta.component.spec.ts`
  - **Tooltip** (crear, directiva de atributo, sin plantilla propia):
    - `shared/components/tooltip/tooltip.directive.ts`
    - `shared/components/tooltip/tooltip.directive.spec.ts`
  - **Tabla** (crear):
    - `shared/components/tabla/tabla.component.ts`
    - `shared/components/tabla/tabla.component.html`
    - `shared/components/tabla/tabla.component.css`
    - `shared/components/tabla/tabla.component.spec.ts`
    - `shared/components/tabla/columna-tabla.model.ts`
  - **Barrel** (modificar):
    - `shared/components/index.ts` — reemplazar `export {}` por `export *` de los 6 módulos
    - `shared/index.ts` — sin cambios (ya re-exporta `./components`)
  - **Integración real** (modificar):
    - `features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.ts` (+ `.html`, `.spec.ts`) —
      consumir `BotonComponent` o `AlertaComponent`
  - **Estilos globales** (sin cambios de contenido, solo referencia):
    - `src/styles/design-tokens.css` — reutilizar tokens `--sst-*` existentes en vez de
      colores hardcodeados en los componentes nuevos

### Subtask Mapping

| Subtask key | Summary | Implementation Step(s) |
|---|---|---|
| SP-240 | Creación formulario estandar | No mapeado en este plan — depende solo de convenciones de SP-239 (standalone, OnPush, Tailwind, carpeta `shared/components/`), se implementa y planifica de forma independiente una vez estas convenciones existan |

## 3. Pasos de implementación

### Step 0: Crear rama de feature + verificar CDK
- **Acción**: Crear y cambiar a una nueva rama; materializar `@angular/cdk` en `node_modules`
- **Rama**: `feature/SP-239-frontend`
- **Comandos**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-239-frontend
  npm install   # materializa @angular/cdk@17.3.10 (ya resuelto en package-lock.json)
  ```
- **Verificación**: confirmar que `node_modules/@angular/cdk/dialog`, `node_modules/@angular/cdk/overlay`
  y `node_modules/@angular/cdk/a11y` existen antes de escribir código de Modal/Tooltip.

### Step 1: `ColumnaTabla<T>` (modelo)
- Archivo: `shared/components/tabla/columna-tabla.model.ts`
- Contenido: interfaz `ColumnaTabla<T>` con al menos:
  ```ts
  interface ColumnaTabla<T> {
    clave: string;
    encabezado: string;
    ordenable?: boolean;
    plantilla?: (item: T) => string; // o TemplateRef si se requiere contenido custom
  }
  ```

### Step 2: `BotonComponent` (`app-boton`)
- Archivo: `shared/components/boton/boton.component.ts` (+ `.html`, `.css`)
- Standalone, `OnPush`. Inputs: `variante`, `tamano`, `tipo`, `deshabilitado`, `cargando`.
  Usar `<ng-content>` para el contenido del botón (icono + texto libres) en vez de un
  `@Input() etiqueta` de texto plano — documentar la decisión en un comentario breve.
- Output: `alHacerClic = new EventEmitter<MouseEvent>()`, no emite si `deshabilitado || cargando`.
- Plantilla: `<button [type]="tipo" [disabled]="deshabilitado || cargando" [attr.aria-busy]="cargando">`
  con spinner condicional (`*ngIf="cargando"`) y clases Tailwind por variante/tamano
  (mapa de clases en el `.ts`, no lógica en la plantilla).

### Step 3: `AlertaComponent` (`app-alerta`)
- Archivo: `shared/components/alerta/alerta.component.ts` (+ `.html`, `.css`)
- Standalone, `OnPush`. Inputs: `tipo` (required), `titulo?`, `mensaje` (required), `cerrable`.
- Output: `alCerrar = new EventEmitter<void>()`.
- Plantilla: `role`/`aria-live` calculados vía getter según `tipo`
  (`role="alert"` + `aria-live="assertive"` para `error`/`advertencia`;
  `role="status"` + `aria-live="polite"` para `exito`/`informativa`).
  Botón de cierre solo si `cerrable`.

### Step 4: `TooltipDirective` (`appTooltip`)
- Archivo: `shared/components/tooltip/tooltip.directive.ts`
- Directiva de atributo standalone sobre `@angular/cdk/overlay` (`Overlay`, `OverlayRef`,
  `ConnectedPosition`) — no un componente propio con plantilla en `shared/components/`.
- Inputs: `appTooltip: string` (texto), `posicionTooltip: 'arriba'|'abajo'|'izquierda'|'derecha' = 'arriba'`.
- Listeners de host (`@HostListener`) para `mouseenter`/`focus` (mostrar) y
  `mouseleave`/`blur`/`keydown.escape` (ocultar).
- El overlay creado recibe un `id` único; el host recibe `[attr.aria-describedby]` apuntando a ese `id`.
- Usar `@angular/cdk/a11y` (`AriaDescriber` o gestión manual de `aria-describedby`) según
  lo que resulte más simple de testear con `TestBed` sin Signal inputs (ver nota de
  Signal inputs bloqueados en `frontend-angular-standards.mdc`).

### Step 5: `ModalComponent` (`app-modal`) + `ServicioModal`
- Archivos: `shared/components/modal/modal.component.ts` (+ `.html`, `.css`),
  `shared/components/modal/servicio-modal.ts`
- `ServicioModal` (`providedIn: 'root'`) envuelve `Dialog` de `@angular/cdk/dialog`:
  `abrir<T>(componente: ComponentType<T>, config?: DialogConfig): DialogRef<T>` /
  `cerrar(resultado?)` delega en `dialogRef.close(resultado)`.
- `ModalComponent` es la plantilla de contenido montada dentro del `Dialog` (no usa
  `MatDialog` ni theming de Material): recibe `titulo`, `cerrable = true` vía
  `DIALOG_DATA` o `@Input()` según el patrón de composición elegido; expone
  `alCerrar = new EventEmitter<void>()`.
- `Dialog.open()` ya provee focus trap (CDK `FocusTrap`) y cierre con Esc por defecto
  (`config.disableClose = false`); confirmar en tests que el foco vuelve al elemento
  disparador al cerrarse (comportamiento nativo de `Dialog`, validar explícitamente).
- Estilos y layout del overlay/backdrop en Tailwind puro dentro de `modal.component.css`
  y clases utilitarias en la plantilla.

### Step 6: `TablaComponent<T>` (`app-tabla`)
- Archivo: `shared/components/tabla/tabla.component.ts` (+ `.html`, `.css`)
- Standalone, `OnPush`, componente genérico (`export class TablaComponent<T>`).
- Inputs: `columnas: ColumnaTabla<T>[]` (required), `datos: T[] = []` (required),
  `cargando = false`, `paginacion: { tamanoPagina: number } | null = null`,
  `trackearPor: (item: T) => unknown = (item) => item`, `mensajeVacio = 'No hay datos para mostrar'`.
- Outputs: `alOrdenar = new EventEmitter<{ columna: string; direccion: 'asc' | 'desc' }>()`,
  `alCambiarPagina = new EventEmitter<number>()`.
- Paginación client-side calculada en el propio componente (slice de `datos` por página)
  o delegar el slice al padre — decidir e implementar la opción más simple:
  este componente calcula la página visible internamente a partir de `paginacion.tamanoPagina`
  y solo emite `alCambiarPagina` con el índice de página solicitado.
- Tres estados en la plantilla: filas normales (`*ngFor` con `[ngForTrackBy]="trackearPor"`),
  skeleton de filas si `cargando`, mensaje de `mensajeVacio` si `!cargando && datos.length === 0`.

### Step 7: Barrel `shared/components/index.ts`
- Archivo: `shared/components/index.ts` (modificar)
- Reemplazar `export {}` por:
  ```ts
  export * from './boton/boton.component';
  export * from './modal/modal.component';
  export * from './modal/servicio-modal';
  export * from './alerta/alerta.component';
  export * from './tooltip/tooltip.directive';
  export * from './tabla/tabla.component';
  export * from './tabla/columna-tabla.model';
  ```
- Verificar que `shared/index.ts` (sin cambios) sigue re-exportando `./components` sin
  colisiones de nombres con lo ya exportado desde `shared/directivas`.

### Step 8: Manejo de errores / estados límite
- Ningún componente lanza excepciones de dominio (son de presentación pura); los "errores"
  relevantes son de UX:
  - `TablaComponent`: `datos` vacío o `undefined` no debe romper el `*ngFor` (usar `datos ?? []`
    solo si el tipo lo permite; con `@Input({ required: true })` no debería llegar `undefined`).
  - `ModalComponent`: `ServicioModal.abrir()` no debe permitir abrir dos instancias del mismo
    modal simultáneamente si el CDK `Dialog` ya lo previene por configuración (`hasBackdrop`).
  - `TooltipDirective`: destruir el `OverlayRef` en `ngOnDestroy` para evitar overlays huérfanos.

### Step 9: Integración real en dashboard
- Archivos: `features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.ts`,
  `.html`, `.spec.ts` (modificar)
- Importar `BotonComponent` (o `AlertaComponent`) en los `imports` standalone de
  `PaginaDashboardComponent` y usarlo en la plantilla en un lugar con sentido funcional
  (p. ej. un botón de acción rápida junto a las `TarjetaResumenComponent` existentes).
- Test de integración: renderizar `PaginaDashboardComponent`, verificar que el componente
  compartido aparece sin errores de consola y que su `@Output()` dispara el manejador
  esperado del contenedor.

### Step 10: Tests unitarios (uno por componente, ver Sección 5)
- Archivos: los 6 `.spec.ts` listados en la Sección 2.
- Todos con `TestBed` + Angular Testing Library, patrón AAA, decorator-based
  `@Input()`/`@Output()` (Signal inputs bloqueados en este repo, ver nota en
  `frontend-angular-standards.mdc`).

### Step 11: Actualizar documentación técnica
- `ai-specs/specs/stacks/frontend-angular-standards.mdc` — si se decide un patrón nuevo
  reutilizable (p. ej. convención de mapa de clases Tailwind por variante), documentarlo
  bajo "Key Rules" o "Styling"
- `src/styles/README.md` — si se agrega algún token `--sst-*` nuevo para estados de
  alerta/modal (colores de fondo de overlay, etc.); si se reutilizan tokens existentes,
  no requiere cambios

## 4. Orden de implementación

0. Rama + `npm install` (materializar `@angular/cdk`)
1. `ColumnaTabla<T>` (modelo, sin dependencias)
2. `BotonComponent`
3. `AlertaComponent`
4. `TooltipDirective`
5. `ModalComponent` + `ServicioModal`
6. `TablaComponent<T>`
7. Barrel `shared/components/index.ts`
8. Revisión de estados límite (integrado en cada paso anterior, no es un paso aislado)
9. Integración real en `PaginaDashboardComponent`
10. Tests unitarios (escritos junto a cada componente, no al final — TDD por componente)
11. Documentación técnica

## 5. Checklist de pruebas

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` cumple el umbral configurado en `jest.config.js`
      (actualmente `branches/functions/lines/statements: 80` global — el estándar del
      stack apunta a 90%, confirmar con el equipo si se debe subir el umbral en este ticket
      o queda para un ticket de tooling aparte)
- [ ] `BotonComponent`: emite `alHacerClic` en clic; no emite cuando `deshabilitado` o
      `cargando` es `true`; clases Tailwind correctas por `variante`/`tamano`;
      `aria-busy` refleja `cargando`
- [ ] `ModalComponent` / `ServicioModal`: `abrir()` monta el componente y devuelve una
      referencia con `cerrar()`; Esc cierra el modal; el foco regresa al disparador;
      `cerrable = false` oculta el botón de cierre
- [ ] `AlertaComponent`: renderiza `role`/`aria-live` correctos por `tipo`; emite `alCerrar`
      al hacer clic en cerrar; no muestra botón de cierre si `cerrable = false`
- [ ] `TooltipDirective`: muestra el overlay en `mouseenter`/`focus` y lo destruye en
      `mouseleave`/`blur`; asigna `aria-describedby` al host; respeta `posicionTooltip`
- [ ] `TablaComponent`: renderiza filas desde `datos`; muestra estado vacío cuando
      `datos.length === 0`; muestra skeleton cuando `cargando = true`; emite `alOrdenar`
      al hacer clic en un encabezado ordenable; emite `alCambiarPagina` al paginar
- [ ] Caso de integración: `PaginaDashboardComponent` renderiza el componente compartido
      sin errores de consola y reacciona a su `@Output()`
- [ ] `ng build` compila sin errores de tipos ni de plantilla
- [ ] Ningún componente muestra clases o theming de `@angular/material` en el DOM final
- [ ] Tests existentes no se rompen

## 6. Referencia de herramientas

| Purpose | Command |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de respuesta de error

No aplica: este ticket es exclusivamente frontend (librería de presentación), sin
endpoints HTTP nuevos ni cambios en `openapi.yaml`. Los componentes no hacen llamadas
HTTP propias.

## 8. Dependencias

- **Sin dependencias nuevas en `package.json`**: `@angular/cdk@17.3.10` ya está resuelto
  en `package-lock.json` como dependencia transitiva de `@angular/material@^17.3.0`.
- **Acción requerida igualmente**: `@angular/cdk` **no existe hoy en `node_modules/@angular/`**
  (verificado en preflight de este plan). Ejecutar `npm install` en Step 0 para materializarlo
  antes de escribir `ModalComponent`/`TooltipDirective` — de lo contrario `import { Dialog } from
  '@angular/cdk/dialog'` y `import { Overlay } from '@angular/cdk/overlay'` fallarán en
  compilación y en Jest.
- `@angular/material` en sí **no se importa** en ningún componente nuevo — solo se usa
  `@angular/cdk` como motor de comportamiento sin estilos, tal como exige el enriquecimiento.

## 9. Notas

- Reglas de negocio: ninguna — este ticket es una librería de UI de presentación pura,
  sin lógica de dominio ni llamadas HTTP.
- No usar `input()`/`output()`/`model()` basados en Signals en ninguno de los 5 componentes
  ni en la directiva: están bloqueados en este repo (Angular 17.3.12 + jest-preset-angular
  13.1.6 lanzan `NG0950`/`NG0303` bajo `TestBed`, confirmado 2026-07-21,
  angular/angular#54013). Usar exclusivamente `@Input()`/`@Output()` decorator-based.
- No crear `shared/componentes/` en paralelo — todo vive en `shared/components/` (carpeta
  en inglés ya existente), con nombres de clase/selector en español dentro.
- Nombre de rama: `feature/SP-239-frontend` (nunca `-backend` en este stack).
- El `ModalComponent` debe evitar depender de `MatDialog`/`MatDialogModule` — solo
  `Dialog`/`DialogModule` de `@angular/cdk/dialog`, para no arrastrar el theming visual
  de Material al DOM final.
- La subtarea SP-240 (formulario dinámico) no depende de que estos 5 componentes estén
  terminados; se planifica en un archivo separado cuando corresponda.

## 10. Checklist de verificación de implementación

- [ ] Calidad de código: sin errores de compilación, lint pasa (`npm run lint:eslint`)
- [ ] Arquitectura: sigue el agente y los estándares del stack activo (standalone, OnPush,
      Tailwind puro, sin theming de Material visible)
- [ ] Tests: todos en verde, cobertura cumple el umbral de `jest.config.js`
- [ ] Documentación: `frontend-angular-standards.mdc` y `src/styles/README.md`
      actualizados si se introduce un patrón o token nuevo
- [ ] Rama: `feature/SP-239-frontend`
