# Plan de implementación: SP-240 Creación formulario estandar

## 1. Resumen

Construir un **formulario dinámico configurable** en
`sst-auditor-agent-pro-frontend` bajo `shared/components/formulario/`:
nueve componentes de campo con `ControlValueAccessor`, un helper de errores,
un compositor `FormularioDinamicoComponent` que arma un `FormGroup` a partir de
`CampoFormulario[]`, y exportación vía `@app/shared`. Sin HTTP propio: las
features consumen `alEnviar` / el `FormGroup` expuesto.

Stack activo: `frontend-angular` (Angular 17.3 standalone + Tailwind + CDK).
Idioma: español (identificadores, tests, docs).

**Precondiciones (SP-239 ya entregado):**
- Convención carpeta-por-componente, `OnPush`, `templateUrl`/`styleUrls`
- Barrel `@app/shared` (`tsconfig` paths + `jest` `moduleNameMapper`)
- `BotonComponent` disponible para el CTA de envío
- Tokens `sst-*` / `sst-campo` en `design-tokens.css`
- `@angular/cdk` materializado (chips puede usar a11y si hace falta; **sin**
  Material chips)

## Estimación de puntos de historia

<!-- STORY_POINTS:8 -->
- **HU total**: 8 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 8 SP del enriquecimiento. Nueve CVA
  independientes + compositor dinámico + mensajes de error + tests por campo
  e integración; incertidumbre en chips/carga-archivo y en el patrón de
  proyección (`NgComponentOutlet` vs mapa explícito). Sin endpoints ni pantallas
  de negocio nuevas.
- **Subtasks**: ninguna en Jira (SP-240 es subtarea de SP-239).
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Active stack: `frontend-angular` (Angular)
- Capas y archivos afectados (rutas relativas a `src/app/`):

  - **Modelo** (crear):
    - `shared/components/formulario/campo-formulario.model.ts`
  - **Errores** (crear):
    - `shared/components/formulario/mensaje-error-campo/mensaje-error-campo.component.{ts,html,css,spec.ts}`
  - **Campos CVA** (crear, uno por carpeta):
    - `campo-texto/`
    - `campo-area-texto/`
    - `campo-numero/`
    - `campo-selector/`
    - `campo-radio/`
    - `campo-checkbox/`
    - `campo-chips/`
    - `campo-selector-multiple/`
    - `campo-carga-archivo/`
  - **Compositor** (crear):
    - `shared/components/formulario/formulario-dinamico/formulario-dinamico.component.{ts,html,css,spec.ts}`
  - **Barrel** (modificar):
    - `shared/components/index.ts` — exportar modelo + campos + compositor
  - **Demo opcional** (modificar, recomendado smoke visual):
    - `features/dashboard/paginas/pagina-dashboard/...` — sección colapsable o
      panel con ≥ 3 tipos; si se omite, el spec de integración basta
  - **Estilos** (solo si hace falta):
    - `src/styles/design-tokens.css`, `src/styles/README.md`

### Mapeo de subtareas

No subtasks — plan derived directly from the HU (SP-240 es la subtarea).

## 3. Pasos de implementación

### Step 0: Rama de feature
- **Acción**: Crear y cambiar a la rama de feature
- **Rama**: `feature/SP-240-frontend`
- **Comandos**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-240-frontend
  ```
- **Verificación**: `node_modules/@angular/cdk` existe; `import { BotonComponent } from '@app/shared'` resuelve.

### Step 1: Modelo `CampoFormulario`
- Archivo: `shared/components/formulario/campo-formulario.model.ts`
- Contenido:
  ```ts
  export type TipoCampoFormulario =
    | 'texto' | 'area-texto' | 'numero' | 'selector' | 'radio'
    | 'checkbox' | 'chips' | 'selector-multiple' | 'carga-archivo';

  export interface OpcionCampo {
    valor: string;
    etiqueta: string;
  }

  export interface CampoFormulario {
    nombre: string;
    tipo: TipoCampoFormulario;
    etiqueta: string;
    requerido?: boolean;
    opciones?: OpcionCampo[];
    validadores?: ValidatorFn[];
    placeholder?: string;
    ayuda?: string;
    deshabilitado?: boolean;
    min?: number;
    max?: number;
    step?: number;
    filas?: number;
    aceptar?: string;
    multiple?: boolean;
    valorInicial?: unknown;
  }
  ```
- Importar `ValidatorFn` desde `@angular/forms`.

### Step 2: `MensajeErrorCampoComponent`
- Carpeta: `mensaje-error-campo/`
- `@Input({ required: true }) control!: AbstractControl`
- `@Input() idDescripcion?: string` (para `aria-describedby`)
- Muestra el primer error cuando `invalid && (touched || dirty)`
- Mapa de claves → mensaje en español: `required`, `email`, `min`, `max`,
  `minlength`, `maxlength`, fallback genérico
- `role="alert"`, clases de texto error (`text-red-700` / token error)

### Step 3: Base CVA (patrón obligatorio, sin archivo abstracto forzado)
Para cada campo:
- `standalone: true`, `OnPush`, `templateUrl`/`styleUrls`
- `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => X), multi: true }]`
- Implementar `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`
- **No** Signal inputs/outputs (NG0950)
- Etiqueta con `for="campo-{{nombre}}"` e `id` del control alineado
- Usar `sst-campo`, `rounded-control`, `focus:ring-marca`
- Incluir `<app-mensaje-error-campo>` cuando el control del padre esté disponible
  **o** dejar el error solo en el compositor (preferible: error en el compositor
  junto a cada fila para no duplicar inyección de `NgControl` en todos los CVA)

**Decisión de diseño (fijar en Step 3):**
- Los CVA son “tontos”: solo valor/disabled/placeholder/opciones vía `@Input`.
- El compositor pone `<label>`, ayuda, `mensaje-error-campo` y
  `[formControlName]="campo.nombre"` alrededor del CVA.
- Así se evita acoplar cada CVA a `NgControl` y se simplifican los tests.

### Step 4: Campos simples (texto, area-texto, numero)
- `campo-texto`: `<input type="text">`
- `campo-area-texto`: `<textarea [rows]="filas || 3">`
- `campo-numero`: `<input type="number" [min] [max] [step]>` — valor `number | null`
- Specs: write/read vía `FormControl`, disabled, placeholder

### Step 5: Campos de opciones (selector, radio, checkbox, selector-multiple)
- `campo-selector`: `<select>` + `opciones`; valor `string | null`
- `campo-radio`: grupo con mismo `name`; valor `string | null`
- `campo-checkbox`:
  - sin `opciones` → boolean
  - con `opciones` → `string[]` (grupo)
- `campo-selector-multiple`: selección múltiple → `string[]`
- Specs: cambio de valor, opciones renderizadas, a11y básica (labels)

### Step 6: Campos compuestos (chips, carga-archivo)
- `campo-chips` (`string[]`):
  - input + lista de chips; `Enter` agrega; `Backspace` en vacío quita el último
  - botón/aria-label para quitar chip
  - sin `MatChipsModule`
- `campo-carga-archivo`:
  - `<input type="file" [accept] [multiple]>`
  - valor `File | File[] | null`; **no** subir; mostrar nombre(s) seleccionado(s)
  - reset visual al `writeValue(null)`
- Specs: teclado chips; file change → valor; cleanup

### Step 7: `FormularioDinamicoComponent` (compositor)
- Inputs:
  - `campos: CampoFormulario[]` (required)
  - `etiquetaEnviar = 'Enviar'`
  - `mostrarBotonEnviar = true`
- Outputs:
  - `alEnviar: EventEmitter<Record<string, unknown>>` — solo si válido
  - `alCambiar?: EventEmitter<Record<string, unknown>>` — opcional (valueChanges)
- API: getter/propiedad pública `formulario: FormGroup`
- Construcción:
  ```ts
  // por cada campo:
  const validators = [
    ...(campo.requerido ? [Validators.required] : []),
    ...(campo.validadores ?? []),
  ];
  group[campo.nombre] = new FormControl(
    { value: campo.valorInicial ?? valorPorDefecto(campo.tipo), disabled: !!campo.deshabilitado },
    validators
  );
  ```
- `ngOnChanges` / setter: si cambia la **referencia** de `campos`, recrear el grupo
  (no en cada CD)
- Plantilla: `*ngFor` de campos; `ngSwitch` / mapa **solo para elegir el
  componente CVA** (permitido); **prohibido** meter el markup HTML de los 9
  tipos inline en el compositor
- Opción recomendada de proyección:
  ```ts
  readonly mapaCampos: Record<TipoCampoFormulario, Type<unknown>> = { ... };
  ```
  + `*ngComponentOutlet` con `inputs` (Angular 17.3) **o** `ngSwitchCase` con
  un tag por tipo (más explícito y fácil de testear — **preferir ngSwitchCase
  con selectores** si `NgComponentOutlet` inputs resultan frágiles en tests)
- Submit:
  - si inválido → `markAllAsTouched()` y no emitir
  - si válido → `alEnviar.emit(this.formulario.getRawValue())`
- Botón: `<app-boton tipo="submit">{{ etiquetaEnviar }}</app-boton>`
- Política de botón: **habilitado siempre**; la validación ocurre al enviar
  (documentado en el enriquecimiento)

### Step 8: Barrel `@app/shared`
- Actualizar `shared/components/index.ts`:
  ```ts
  export * from './formulario/campo-formulario.model';
  export * from './formulario/mensaje-error-campo/mensaje-error-campo.component';
  export * from './formulario/campo-texto/campo-texto.component';
  // ... resto de campos
  export * from './formulario/formulario-dinamico/formulario-dinamico.component';
  ```
- Verificar que no hay colisiones de nombres.

### Step 9: Demo / integración visual (opcional pero recomendada)
- En `pagina-dashboard`: bloque “Demo formulario” con 3+ campos
  (texto+email, selector, checkbox) y `(alEnviar)` que muestre un mensaje
  local (sin HTTP)
- Import: `import { FormularioDinamicoComponent, CampoFormulario } from '@app/shared'`
- Spec del dashboard: smoke de que el formulario aparece / emite

### Step 10: Tests (cobertura ≥ 90 % en `formulario/**`)
- Por cada CVA: render, writeValue/onChange, disabled
- `mensaje-error-campo`: pristine vs touched+invalid; claves known
- `formulario-dinamico`:
  - ≥ 3 tipos combinados
  - inválido no emite + marca touched
  - válido emite mapa de valores
  - cambio de referencia `campos` reconstruye controles
  - labels `for`/`id` presentes
- Usar `componentRef.setInput(...)` con OnPush
- Host de test solo para CVA dentro de `FormGroup`/`formControlName`

### Step 11: Verificación final
```bash
npm test
npm run test:coverage
npx ng build
```
- Checklist del enriquecimiento marcado mentalmente antes de PR

## 4. Casos de prueba (resumen)

| Área | Escenarios |
|---|---|
| CVA simples | valor, disabled, placeholder |
| CVA opciones | selección, multi, radio group |
| chips | Enter agrega, Backspace quita, quitar chip |
| archivo | File / File[], accept, reset |
| errores | required/email visibles tras touch |
| compositor | emit / no-emit, rebuild, a11y labels |

## 5. Requisitos no funcionales

- Sin `innerHTML` con datos de usuario; sin upload real de archivos
- WCAG AA en contraste; teclado en chips/radio/checkbox
- `OnPush`; recrear `FormGroup` solo al cambiar referencia de `campos`
- Cero deps npm nuevas; sin theming Material
- Decorator `@Input`/`@Output` (no Signal inputs)

## 6. Criterios de aceptación (verificación)

- [ ] 9 tipos renderizados desde `CampoFormulario[]`
- [ ] CVA independientes (sin markup monolítico de los 9 en el compositor)
- [ ] Validaciones + errores tras touched
- [ ] Labels asociados
- [ ] `alEnviar` solo si válido
- [ ] Estructura carpeta + barrel `@app/shared`
- [ ] Standalone + OnPush + templateUrl/styleUrls
- [ ] Tests por campo + integración ≥ 3 tipos
- [ ] `npm test` / build verdes

## 7. Orden de implementación sugerido

```
Step 0 rama
  → Step 1 modelo
  → Step 2 errores
  → Step 4 campos simples
  → Step 5 opciones
  → Step 6 chips + archivo
  → Step 7 compositor
  → Step 8 barrel
  → Step 9 demo (opc.)
  → Step 10–11 tests + verify
```

## 8. Dependencias

- **SP-239**: convenciones + `BotonComponent` + `@app/shared` (ya disponibles)
- **npm**: ninguna nueva; CDK solo si chips necesita a11y helpers
- **Backend / OpenAPI**: no aplica

## 9. Fuera de alcance

- Formularios de negocio concretos (login ya existe; no migrar login en este ticket)
- Persistencia / upload de archivos al API
- Formly / librerías de schema-form de terceros
- Signal-based inputs/outputs
- Traducción i18n de mensajes de error (mapa estático en español basta)

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `NgComponentOutlet` + inputs frágil en Jest | Preferir `ngSwitchCase` con tags `app-campo-*` |
| checkbox dual (bool vs array) confunde API | Documentar en modelo: `opciones` ⇒ grupo `string[]` |
| File en tests jsdom | Mock `File` / `DataTransfer` o disparar `change` sintético |
| Rebuild excesivo del FormGroup | Comparar por referencia de `campos`; no deep-watch |
| Cobertura < 90 % por 9 specs densos | Priorizar happy path + disabled + error touched; no UI pixel |

## 11. Definition of Done

- Plan ejecutado en `feature/SP-240-frontend`
- Código + tests según este plan
- PR a `develop` con checklist OpenSpec
- Listo para `os-review` / merge
