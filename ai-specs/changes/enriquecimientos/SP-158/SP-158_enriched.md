# Ticket enriquecido: SP-158 — Implementar Jest Jasmine en Angular para frontend

## Descripción original
<!-- jira-skip -->
Pruebas de interfaz para controladores y servicios en Angular.
<!-- /jira-skip -->

## Descripción mejorada

El frontend **ya opera con Jest** (`jest-preset-angular`, scripts `npm test` / `npm run test:coverage`, 44 specs). No hay Jasmine/Karma instalados; el título del ticket menciona “Jest Jasmine” por legado, pero la decisión técnica del repo es **solo Jest**.

Esta historia no debe “montar Jest desde cero”. Debe **cerrar la alineación** del entorno de pruebas con el estándar OpenSpec y con CI:

1. **SP-229** — Dejar el entorno Jest canónico (limpiar Karma residual en `angular.json`, documentar decisión Jest-only, alinear config con estándares).
2. **SP-230** — Completar/fortalecer unit tests de auth y formularios clave (ya hay cobertura amplia; cerrar gaps y adoptar Testing Library donde aporte valor).
3. **SP-231** — Reporte de cobertura usable en local y CI, con umbral alineado al estándar del stack (**90%**, hoy el repo tiene **80%** en `jest.config.js`).

Alcance fuera: reescribir las 44 specs existentes sin necesidad; no reintroducir Karma/Jasmine.

## Criterios de aceptación

- [ ] El proyecto documenta y usa **Jest** como único runner (sin depender de Karma/Jasmine).
- [ ] `angular.json` ya no declara un target `test` basado en Karma residual (o queda explícitamente deshabilitado/alineado a Jest).
- [ ] `npm test` y `npm run test:coverage` pasan en local.
- [ ] Hay cobertura unitaria sólida de autenticación (servicio, guards, interceptor) y de formularios compartidos principales.
- [ ] El umbral de cobertura Jest está alineado al estándar OpenSpec del stack (**≥ 90%** global o justificación documentada si se mantiene 80% temporalmente).
- [ ] CI ejecuta `npm test` (y coverage con fail-under) en PRs a `develop`/`main`.
- [ ] README o guía de desarrollo indica cómo correr tests y coverage.

## Campos y endpoints

No aplica API nueva. Las pruebas deben mockear/consumir los contratos HTTP ya existentes del backend vía `HttpTestingController` / `provideHttpClient(Testing)`:

- Auth: login, refresh, perfil (`/api/v1/auth/...`)
- Formularios: componentes en `src/app/shared/...` usados por features SST

## Archivos a crear o modificar

- `angular.json` — Presentación/tooling — Modify (quitar o realinear target `test` Karma)
- `jest.config.js` (o migrar a `jest.config.ts` si se alinea al estándar) — Tooling — Modify (umbral coverage)
- `setup-jest.ts` — Tooling — Modify (opcional: `jest-dom` si se adopta Testing Library)
- `.github/workflows/ci.yml` — CI — Modify (añadir `npm ci` + `npm test` / coverage)
- `ai-specs/specs/development_guide.md` o README — Docs — Modify (cómo correr tests)
- Specs bajo `src/app/nucleo/**` y `src/app/shared/**` — Tests — Modify/Create solo gaps
- **No crear** `karma.conf.js` ni dependencias Jasmine

## Casos de prueba unitarios

- Auth servicio: login ok, credenciales inválidas, refresh, usuario inactivo
- Guards: con/sin token, rol insuficiente
- Interceptor: adjunta Bearer; propaga 401
- Formularios compartidos: validación required/pattern, emit de valor, estado disabled
- Happy path de un componente feature representativo (auth form o matriz) con TestBed standalone
- Edge: HttpErrorResponse; observables que completan vacíos

## Requisitos no funcionales

- Mantener TypeScript strict y standalone components.
- No usar signal `input()`/`output()` en specs hasta que el toolchain lo permita (NG0950).
- Tests en CI sin flakiness: preferir `jest --runInBand` como hoy.
- No subir secretos ni `.env` en fixtures.

## Puntos de historia
<!-- STORY_POINTS:5 -->
**5** — Jest ya está montado; el esfuerzo es alineación (Karma residual, umbral 90%, CI, gaps auth/formularios), no bootstrap completo.
<!-- /STORY_POINTS -->

## Subtareas

<!-- SUBTASK:SP-229 -->
### Subtarea: SP-229 — Configurar entorno de pruebas Jest/Jasmine en el proyecto Angular

#### Descripción original
<!-- jira-skip -->
Instalar y configurar Karma/Jasmine o Jest según el setup del proyecto.
<!-- /jira-skip -->

#### Descripción mejorada

Confirmar **Jest-only** como estándar del repo:

- Auditar `package.json`: deps Jest presentes; eliminar cualquier resto Karma/Jasmine si aparece.
- Corregir `angular.json` target `test` residual (`@angular-devkit/build-angular:karma`) para que no confunda al equipo (eliminar, documentar, o apuntar a un builder coherente con Jest).
- Verificar `jest.config.js`, `setup-jest.ts`, `tsconfig.spec.json` y scripts `test` / `test:coverage`.
- Actualizar docs breves: “correr tests = `npm test`”.
- Opcional: renombrar/migrar a `jest.config.ts` solo si no rompe el setup actual.

#### Criterios de aceptación
- [ ] No queda dependencia operativa de Karma/Jasmine.
- [ ] `npm test` verde tras los cambios de config.
- [ ] Documentación indica Jest como runner oficial.

#### Puntos de historia
<!-- STORY_POINTS:2 -->
**2** — Config ya existe; limpieza y documentación.
<!-- /STORY_POINTS -->
<!-- /SUBTASK:SP-229 -->

<!-- SUBTASK:SP-230 -->
### Subtarea: SP-230 — Escribir pruebas unitarias para componentes y servicios clave

#### Descripción original
<!-- jira-skip -->
Cubrir con pruebas unitarias los servicios de autenticación y componentes de formularios principales.
<!-- /jira-skip -->

#### Descripción mejorada

Hay **44** `*.spec.ts` (auth en `nucleo`, formularios en `shared`, features). El trabajo es **cerrar gaps**, no empezar de cero:

- Inventariar cobertura real de auth (servicio, guards, interceptor, tokens) y formularios compartidos.
- Añadir solo specs faltantes o frágiles.
- Preferir el estilo del repo: TestBed + standalone + `jest.fn` / `HttpTestingController`.
- Introducir `@testing-library/angular` de forma selectiva (ya está en deps pero sin uso) en 1–2 componentes de formulario si mejora legibilidad; no migrar masivamente.

#### Criterios de aceptación
- [ ] Auth crítico cubierto (servicio + al menos un guard + interceptor).
- [ ] Formularios principales de `shared` con specs de validación y emit de valor.
- [ ] `npm test` verde; sin specs skipped permanentes.

#### Puntos de historia
<!-- STORY_POINTS:3 -->
**3** — Base amplia existente; foco en gaps auth/formularios.
<!-- /STORY_POINTS -->
<!-- /SUBTASK:SP-230 -->

<!-- SUBTASK:SP-231 -->
### Subtarea: SP-231 — Configurar reporte de cobertura de pruebas frontend

#### Descripción original
<!-- jira-skip -->
Generar reporte de cobertura y establecer un umbral mínimo aceptado.
<!-- /jira-skip -->

#### Descripción mejorada

- Alinear `coverageThreshold` en Jest al estándar del stack (**90%**) o documentar plan de subida desde 80%.
- Asegurar que `npm run test:coverage` genera reporte local (text/lcov/html según config).
- Integrar en `.github/workflows/ci.yml` un job/paso Node que ejecute tests con coverage y falle bajo el umbral.
- Enlazar en la guía de desarrollo el comando de coverage.

#### Criterios de aceptación
- [ ] `npm run test:coverage` falla si no se cumple el umbral.
- [ ] CI ejecuta coverage en PRs.
- [ ] Umbral documentado (90% objetivo o excepción temporal explícita).

#### Puntos de historia
<!-- STORY_POINTS:2 -->
**2** — Script/threshold parcial; falta CI y alinear 90%.
<!-- /STORY_POINTS -->
<!-- /SUBTASK:SP-231 -->
