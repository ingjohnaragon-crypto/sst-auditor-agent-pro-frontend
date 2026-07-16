# Autenticación HTTP (JWT)

Módulo de sesión, interceptor Bearer, guards de ruta y autorización UX.

## Storage

- `token_acceso` y `token_refresco` se guardan en **memoria** + **`sessionStorage`**.
- Claves: `sst.token_acceso`, `sst.token_refresco`.
- **No** se usa `localStorage` (persistencia entre sesiones y mayor superficie XSS).
- Los tokens **nunca** se escriben en consola.

## Flujo 401 / refresh

1. El interceptor añade `Authorization: Bearer <token_acceso>` a peticiones hacia `environment.apiBaseUrl`.
2. Excluye `/auth/login` y `/auth/refresh`.
3. Ante `401`, `ServicioAutenticacion.refrescarToken()` ejecuta un único refresh compartido (single-flight).
4. Reintenta la petición original con el nuevo token.
5. Si el refresh falla → limpia sesión y navega a `/login`.

## Guards (UX, no seguridad)

> Los guards y `*appSiTieneRol` solo controlan navegación/UI. La autorización real la impone el backend con `requerir_roles`.

| Guard | Comportamiento |
|---|---|
| `guardAutenticacion` | Sin sesión → `/login?returnUrl=...` |
| `guardRoles` | Lee `data.rolesPermitidos`; rol no permitido → `/acceso-denegado` |

Componer en rutas sensibles: `canActivate: [guardAutenticacion, guardRoles]`.

Roles de auditoría sensible (médica / siniestralidad): `ROLES_AUDITORIA_SENSIBLE` → `ADMINISTRADOR`, `AUDITOR_SST`.

## Archivos

| Archivo | Rol |
|---|---|
| `servicio-autenticacion.ts` | login, refresh, yo, logout |
| `almacen-tokens.ts` | persistencia de tokens |
| `interceptor-autenticacion.ts` | Bearer + refresh automático |
| `guard-autenticacion.ts` | sesión requerida |
| `guard-roles.ts` | rol en `route.data` |
| `resolver-url-retorno.ts` | evita open-redirect en `returnUrl` |
