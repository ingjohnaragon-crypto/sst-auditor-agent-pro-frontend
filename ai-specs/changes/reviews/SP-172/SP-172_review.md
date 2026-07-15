# Code Review: PR #3 — [SP-172] feat(app): implement SP-172 Angular init + tooling

## Metadata
- Author: `ingjohnaragon-crypto`
- Branch: `feature/SP-172-backend` → `develop`
- Changes: `+2040` / `-340` across `32` files
- Stack: `frontend-angular` (Angular)
- Date: `2026-07-14`

## Summary
El PR inicializa correctamente el frontend Angular 17 standalone con Tailwind, un servicio de ping tipado (`ServicioSalud`), ESLint/Prettier/husky y endurecimiento de `os-commit` para Windows. La base es coherente con el stack y habilita el arranque local. Sin embargo, no hay tests (`--passWithNoTests`), el manejo de error HTTP del ping deja la UI en “Cargando…” indefinidamente, y `HttpClientModule` se registra de forma redundante (y ya no es el patrón recomendado frente a `provideHttpClient()`).

Overall verdict: **REQUEST CHANGES**

## Architecture & Design
- Estructura `core/` / `shared/` / `layout/` / `nucleo/` alineada con el agent Angular; el servicio HTTP vive fuera del componente (bien).
- Separación razonable para un esqueleto: `RootComponent` (presentación) + `ServicioSalud` (infra HTTP).
- Decisiones a notar:
  - La rama se llama `feature/SP-172-backend` pero el trabajo es frontend; conviene `feature/SP-172-frontend` en tickets futuros.
  - Mixing `HttpClientModule` en `main.ts` **y** en `imports` del componente standalone es redundante; en Angular 17+ preferir `provideHttpClient()` en providers del bootstrap.

## Code Quality
- Naming en español (`ServicioSalud`, `obtenerPing`, `PingRespuesta`) consistente con `language: es`.
- `ChangeDetectionStrategy.OnPush` en root: correcto.
- Template usa `*ngIf="(ping$ | async) as ping; else cargando"` — evita `no-negated-async`: bien.
- Falta manejo de error en el stream de ping: si el backend no responde, el `else` de loading nunca desaparece (el async pipe no emite valor en error sin `catchError`).
- `provideRouter([])` es aceptable en el esqueleto; documentar que las rutas llegan en tickets siguientes.

## Testing
- **No hay archivos `*.spec.ts` / tests en `src/`.**
- `package.json` usa `jest --passWithNoTests`, lo que permite CI “verde” sin cobertura.
- No se encontró `jest.config.*` en el repo; el script de test del stack en `openspec/config.yaml` apunta a `ng test`, desalineado con el script real.
- No se cumple el umbral de cobertura >= 90% del estándar Angular / base (TDD).

## Security
- Sin secretos hardcodeados.
- `environment.apiBaseUrl` apunta a `http://localhost:8000/api/v1` (local OK; en prod asegurar HTTPS y origen controlado).
- No hay logging de datos sensibles.
- CORS/backend quedan fuera de este PR (planeados en backend); el front asume el contrato `{ mensaje: string }`.

## Specific Issues
- **File**: `src/` (sin specs) — **Severity**: MAJOR — **Fix**: Añadir al menos tests unitarios de `ServicioSalud` (HttpClientTestingModule / `provideHttpClientTesting`) y del `RootComponent` (loading vs mensaje). Quitar o acotar `--passWithNoTests` cuando exista cobertura mínima, y alinear config Jest/`ng test` con `openspec/config.yaml`.
- **File**: `src/app/root.component.ts` — **Severity**: MAJOR — **Fix**: Encadenar `catchError` / estado de error (p. ej. `mensajeError$` o `*ngIf` de fallo) para no quedarse en “Cargando ping...” si `/ping` falla.
- **File**: `src/main.ts` + `src/app/root.component.ts` — **Severity**: MINOR — **Fix**: Usar solo `provideHttpClient()` en `bootstrapApplication` providers y quitar `HttpClientModule` de `imports` del root.
- **File**: rama `feature/SP-172-backend` — **Severity**: MINOR — **Fix**: Renombrar convención a `*-frontend` en próximos tickets frontend.
- **File**: `package.json` (`test`) vs `openspec/config.yaml` (`ng test`) — **Severity**: MINOR — **Fix**: Unificar comando de test/coverage del stack con la herramienta real (Jest).

## What's Done Well
1. Esqueleto Angular standalone + Tailwind usable con `ng serve`, incluyendo `zone.js` y providers mínimos de arranque.
2. Tooling de calidad: ESLint con `tsconfig.app.json`, Prettier, husky pre-commit, e ignore de `.angular/`.
3. `os-commit` endurecido para Windows (PATH de Git Bash, exclusiones de cache/planes ajenos) — ataca el fallo real `HCS_E_SERVICE_NOT_AVAILABLE`.

## Final Verdict

**REQUEST CHANGES**
