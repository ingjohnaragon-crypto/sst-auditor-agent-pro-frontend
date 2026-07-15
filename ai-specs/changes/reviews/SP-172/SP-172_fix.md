# Review Fix Report: PR #3 — [SP-172] feat(app): implement SP-172 Angular init + tooling

## Original Verdict
REQUEST CHANGES
Review file: `ai-specs/changes/reviews/SP-172/SP-172_review.md`

## Issues Addressed

| Severity | File | Original issue | Fix applied |
|---|---|---|---|
| MAJOR | `src/` (sin specs) | Sin tests / `--passWithNoTests` | Jest config + `setup-jest.ts`; specs de `ServicioSalud` y `RootComponent`; scripts `test` / `test:coverage` sin passWithNoTests; cobertura 100% en código de app |
| MAJOR | `src/app/root.component.ts` | Sin manejo de error en ping | `vista$` con `startWith`/`map`/`catchError` y UI de error |
| MINOR | `src/main.ts` + root | `HttpClientModule` duplicado | Solo `provideHttpClient()` en bootstrap; root sin `HttpClientModule` |
| MINOR | `package.json` vs `openspec/config.yaml` | Comandos de test desalineados | Stack Angular usa `npm test` / `npm run test:coverage` / `npm run lint:eslint` |

## Issues Deferred

| Severity | Issue | Reason deferred | Planned resolution |
|---|---|---|---|
| MINOR | Rama `feature/SP-172-backend` debería ser `*-frontend` | Renombrar la rama remota a mitad del PR añade fricción innecesaria | Aplicar convención `feature/<ticket>-frontend` en tickets siguientes |

## Verification
- Tests passing: Yes — `npm test` (4 tests)
- Coverage: 100% statements/branches/functions/lines — `npm run test:coverage`
- Linting clean: Yes — `npm run lint:eslint`

## Verdict After Fixes
**READY FOR RE-REVIEW**

Los bloqueantes MAJOR del review previo están resueltos; el único MINOR diferido es el nombre de rama.
