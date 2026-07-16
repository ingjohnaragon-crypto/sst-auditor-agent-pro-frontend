# Implementation Plan: SP-177 Crear AuthGuard de rutas y directivas estructurales

## 1. Overview

Implementar en el frontend Angular la capa de autorización de rutas y UI: guard de autenticación (`CanActivateFn`), guard de roles parametrizado por `route.data`, página `/acceso-denegado`, y directiva estructural `*appSiTieneRol` reactiva al estado de sesión. Depende de SP-176 (`ServicioAutenticacion`, `RolUsuario`, signal `usuarioActual`).

Stack activo: `frontend-angular` (Angular). Idioma: español (identificadores, tests, docs).

**Nota de seguridad (obligatoria en código):** guards y directivas son control de UX/navegación; la autorización real la impone el backend con `requerir_roles`.

## 2. Architecture Context

- Active stack: `frontend-angular` (Angular)
- Capas / archivos afectados:
  - **Núcleo auth** (extiende SP-176):
    - `src/app/nucleo/auth/guard-autenticacion.ts` — `CanActivateFn`
    - `src/app/nucleo/auth/guard-roles.ts` — `CanActivateFn` con `rolesPermitidos`
    - `src/app/nucleo/auth/index.ts` — reexportar guards
  - **Shared**:
    - `src/app/shared/directivas/si-tiene-rol.directive.ts`
  - **Páginas**:
    - `src/app/features/auth/paginas/pagina-login.component.ts`
    - `src/app/features/auth/paginas/pagina-acceso-denegado.component.ts`
    - `src/app/features/auth/paginas/pagina-ejemplo-sensible.component.ts`
  - **Rutas**:
    - `src/app/app.routes.ts`
    - `src/app/app.component.ts` — shell con `router-outlet`
    - `src/main.ts` — `provideRouter(rutasApp)`

**Roles:** `ADMINISTRADOR` | `AUDITOR_SST` | `CONSULTA`. Sensibles: `ROLES_AUDITORIA_SENSIBLE`.

### Subtask Mapping

No subtasks — plan derived directly from the HU.

## 3. Implementation Steps (completed in os-develop)

#### Step 0: Branch `feature/SP-177-frontend` from `develop` (SP-176 merged)

#### Step 1–8: Implemented

- Guards + `resolverUrlRetorno` (anti open-redirect)
- Directiva `*appSiTieneRol` con `effect()` sobre `usuarioActual`
- Login stub honra `returnUrl`; `/acceso-denegado`; `/ejemplo-sensible` con ambos guards
- Docs en `nucleo/auth/README.md` y `shared/README.md`
- Tests: 47 passed; coverage global ≥ 80%

## 5. Testing Checklist

- [x] `npm test` / `npm run test:coverage`
- [x] Sin sesión → `/login?returnUrl=...`
- [x] `CONSULTA` → `/acceso-denegado`
- [x] `*appSiTieneRol` reactiva
- [x] Sin open-redirect

## 6. Tooling Reference

| Purpose | Command |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 9. Notes

- Branch: `feature/SP-177-frontend`
- No decodificar JWT en guards; usar `usuarioActual()`
- Guards/directiva = UX; backend `requerir_roles` = seguridad real

## 10. Implementation Verification Checklist

- [x] Guards tipados y documentados
- [x] Directiva reactiva
- [x] Rutas `/login`, `/acceso-denegado`, ejemplo restringido
- [x] `returnUrl` seguro
- [x] Tests + cobertura
- [x] Docs
- [x] Branch: `feature/SP-177-frontend`
