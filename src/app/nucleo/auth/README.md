# Autenticación HTTP (JWT)

Módulo de sesión e interceptor Bearer para el backend FastAPI.

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

## Archivos

| Archivo | Rol |
|---|---|
| `servicio-autenticacion.ts` | login, refresh, yo, logout |
| `almacen-tokens.ts` | persistencia de tokens |
| `interceptor-autenticacion.ts` | Bearer + refresh automático |
