# Plan de implementación: SP-158 — Alinear Jest (sin Karma/Jasmine) en Angular

## 1. Resumen

El frontend **ya corre con Jest** (`jest-preset-angular`, `npm test`,
`npm run test:coverage`, ~44 specs). El título del ticket habla de
“Jest Jasmine” por legado; la decisión técnica del repo es **solo Jest**.

Esta historia **no monta Jest desde cero**. Cierra la **alineación** del
entorno de pruebas con OpenSpec y CI:

1. **SP-229** — Entorno Jest canónico (quitar Karma residual en `angular.json`,
   documentar Jest-only).
2. **SP-230** — Cerrar gaps de unit tests en auth y formularios clave
   (base amplia ya existe).
3. **SP-231** — Cobertura usable en local y CI, umbral alineado al estándar
   del stack (**90%**; hoy `jest.config.js` tiene **80%**).

Fuera de alcance: reescribir las 44 specs; reintroducir Karma/Jasmine;
migrar masivamente a Testing Library.

- **Stack activo**: `frontend-angular` (Angular 17.3 standalone, TypeScript
  estricto, Tailwind, Jest).
- **Tipo**: Historia con subtareas SP-229, SP-230, SP-231.

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci).
- **Justificación**: Jest y la mayoría de specs ya existen; el esfuerzo es
  limpieza de tooling, CI Node, umbral 90% y gaps puntuales.
- **Subtareas**:

| Subtarea | Puntos | Nota |
|---|---:|---|
| SP-229 | 2 | Config Jest-only + docs. |
| SP-230 | 3 | Gaps auth/formularios. |
| SP-231 | 2 | Umbral + CI coverage. |

> Nota: la suma de subtareas (7) es mayor que la HU (5) porque se solapan
> (config/CI se tocan en varios pasos). La HU manda: **5**.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

### Estado actual (baseline)

| Pieza | Estado |
|---|---|
| Scripts | `test` / `test:coverage` → Jest `--runInBand` |
| Deps | Jest + `jest-preset-angular`; **sin** Jasmine/Karma |
| Config | `jest.config.js`, `setup-jest.ts`, `tsconfig.spec.json` |
| Specs | ~44 `*.spec.ts` (auth en `nucleo`, formularios en `shared`, features) |
| Auth specs | `servicio-autenticacion`, `guard-autenticacion`, `guard-roles`, `interceptor-autenticacion`, `almacen-tokens`, `resolver-url-retorno` |
| `angular.json` | Target `test` residual con builder **Karma** |
| Umbral | Global **80%** en `jest.config.js` |
| CI | Solo valida OpenSpec CLI + placeholder pytest; **no** corre `npm test` |
| Testing Library | En deps; **casi sin uso** en `src/` |

### Reglas

- Componentes standalone + TestBed; no signal `input()`/`output()` en API
  pública (NG0950 con el toolchain actual).
- Mocks con `jest.fn` / `HttpTestingController`.
- Preferir ampliar specs existentes antes de crear duplicados.

### Mapeo de subtareas

| Clave | Resumen | Pasos |
|---|---|---|
| SP-229 | Entorno Jest canónico | 0–2, 6 |
| SP-230 | Tests auth / formularios | 3–4 |
| SP-231 | Cobertura + CI | 5–6 |

## 3. Pasos de implementación

### Paso 0: Crear la rama

```bash
git checkout develop
git pull --ff-only origin develop
git checkout -b feature/SP-158-frontend
npm install
npm test
```

- No incluir `.env`, `.openspec-cli/.tmp*`, `node_modules/`, ni workspaces ajenos.
- Confirmar baseline verde antes de tocar umbrales/CI.

### Paso 1: Confirmar Jest-only y limpiar Karma (SP-229)

- Auditar `package.json`: no añadir Jasmine/Karma; eliminar restos si aparecen.
- En `angular.json`, target `test` con
  `"builder": "@angular-devkit/build-angular:karma"`:
  - **Preferido**: eliminar el target `test` de Angular CLI **o** dejar un
    comentario/documentación clara de que el runner oficial es npm/Jest
    (no hay builder Jest oficial estable en Angular 17; no inventar Karma).
  - No crear `karma.conf.js`.
- Verificar que `jest.config.js`, `setup-jest.ts` y `tsconfig.spec.json`
  siguen coherentes con `npm test`.
- Opcional: migrar a `jest.config.ts` **solo** si no rompe el preset; si no,
  mantener `.js` y documentar la excepción frente al estándar OpenSpec.

### Paso 2: Documentar runner oficial (SP-229)

Actualizar `ai-specs/specs/development_guide.md` (y README del repo si existe
sección de tests) con:

```bash
npm test
npm run test:coverage
```

Dejar explícito: **Jest es el único runner**; no usar `ng test` con Karma.

### Paso 3: Inventario de gaps auth (SP-230)

Revisar specs en `src/app/nucleo/auth/`:

- `servicio-autenticacion.spec.ts`
- `guard-autenticacion.spec.ts` / `guard-roles.spec.ts`
- `interceptor-autenticacion.spec.ts`
- `almacen-tokens.spec.ts`

Completar **solo** casos faltantes del enriquecimiento:

- Login ok / credenciales inválidas / refresh / inactivo
- Guard con/sin token / rol insuficiente
- Interceptor: adjunta Bearer; propaga o reacciona a 401
- Edge: `HttpErrorResponse`

No reescribir suites verdes.

### Paso 4: Inventario de gaps formularios (SP-230)

En `src/app/shared/` (campos/formulario dinámico):

- Asegurar validación `required` / `pattern`, emit de valor, estado `disabled`
  en los controles principales usados por features SST.
- Opcional: **una** prueba con `@testing-library/angular` en un campo
  representativo (deps ya instaladas); no migrar todo.

### Paso 5: Umbral de cobertura 90% + reporte (SP-231)

En `jest.config.js`:

```js
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
},
```

- Ejecutar `npm run test:coverage` y medir el delta real.
- Si el salto 80→90% rompe el build por deuda previa:
  1. Preferir cerrar huecos fáciles en auth/shared (Paso 3–4).
  2. Solo como excepción temporal documentada: umbral intermedio (p. ej. 85)
     **con** issue/nota en la guía y plan de llegar a 90% en el mismo PR o
     follow-up inmediato. Objetivo del ticket: **90%**.

Asegurar reporters locales útiles (text + lcov/html según config actual).

### Paso 6: CI con Node + Jest (SP-231)

Extender `.github/workflows/ci.yml` (o job paralelo `frontend`) para:

1. `actions/setup-node` (Node 20 LTS alineado al repo).
2. `npm ci`
3. `npm test` (o directamente `npm run test:coverage` con fail-under).
4. Fallar el job si coverage < umbral.

Mantener los pasos actuales de validación OpenSpec CLI si siguen siendo útiles;
no borrar el job sin motivo. El placeholder `pytest` sin `tests/` puede
quedar o reemplazarse por el job Node — preferir **añadir** job `frontend-test`
claro.

### Paso 7: Verificación integral

```bash
npm test
npm run test:coverage
ng build
```

- 0 fallos; coverage ≥ umbral acordado; build OK.
- Confirmar que no existe dependencia operativa de Karma/Jasmine.

### Paso 8: Documentación final

- Guía: comandos de test/coverage + decisión Jest-only.
- Si se tocó CI, una línea en la guía sobre el job de GitHub Actions.
- No tocar `api-spec.yml` (sin API nueva).

## 4. Orden de implementación

1. Paso 0 — rama desde `develop`.
2. Paso 1 — limpiar Karma / Jest-only.
3. Paso 2 — documentar runner.
4. Paso 3 — gaps auth.
5. Paso 4 — gaps formularios.
6. Paso 5 — umbral 90% + reporte.
7. Paso 6 — CI Node/Jest.
8. Paso 7 — verificación.
9. Paso 8 — docs finales.

## 5. Testing Checklist

- [ ] `npm test` — 0 fallos
- [ ] `npm run test:coverage` — umbral (≥ 90% o excepción documentada)
- [ ] Auth: servicio, guards, interceptor cubiertos en escenarios clave
- [ ] Formularios shared: validación + emit + disabled
- [ ] CI ejecuta Jest en PR
- [ ] `ng build` OK
- [ ] Sin Karma/Jasmine en el flujo diario

## 6. Tooling Reference

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Error Response Format

Las pruebas HTTP mockean el contrato del backend (español):

```json
{
  "exito": false,
  "codigo": "CODIGO_DOMINIO_O_VALIDACION",
  "mensaje": "Descripción legible",
  "detalle": null
}
```

No se definen endpoints nuevos en este ticket.

## 8. Dependencies

- Ninguna nueva obligatoria.
- Ya presentes: `jest`, `jest-preset-angular`, `@testing-library/angular`,
  `@testing-library/jest-dom`.
- No instalar Karma/Jasmine.

## 9. Notes

- SP-158 ≠ bootstrap Jest: es **alineación + CI + gaps**.
- Branch: `feature/SP-158-frontend` (nunca `-backend` en este stack).
- No mezclar con cambios OpenSpec CLI ajenos al ticket salvo docs de test.
- Si `feature/SP-192` u otras ramas no están mergeadas, partir de `develop`
  limpio; SP-158 no depende de features de negocio nuevas.
- El mensaje de handoff Cursor (`delivery: file`) aplica: tras `os-develop`,
  ejecutar `@.openspec-cli/.last-prompt.md` en el Agent chat.

## 10. Implementation Verification Checklist

- [ ] Rama `feature/SP-158-frontend` desde `develop`
- [ ] Karma residual eliminado/documentado; Jest-only oficial
- [ ] Gaps auth/formularios cerrados sin reescritura masiva
- [ ] Coverage ≥ 90% (o excepción documentada + plan)
- [ ] CI corre `npm test` / coverage
- [ ] Guía de desarrollo actualizada
- [ ] Commit limitado a SP-158 (+ plan/enriquecimiento)
