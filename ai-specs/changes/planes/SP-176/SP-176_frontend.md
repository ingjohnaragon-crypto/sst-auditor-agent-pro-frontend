# Implementation Plan: SP-176 Implementar Interceptor HTTP de JWT en Angular

## 1. Overview

Implementar en el frontend Angular la capa de autenticación HTTP: servicio de sesión JWT, interceptor funcional que inyecta `Authorization: Bearer`, y refresh automático ante 401 con una sola petición compartida (single-flight). Alcance limitado a core de auth e interceptor; no incluye UI de login (solo redirección a `/login` si el refresh falla).

Stack activo: `frontend-angular` (Angular). Idioma: español (identificadores, tests, docs).

## 2. Architecture Context

- Active stack: `frontend-angular` (Angular)
- Capas / archivos afectados:
  - **Core / Núcleo (auth)**:
    - `src/app/nucleo/auth/modelos/credenciales-login.ts`
    - `src/app/nucleo/auth/modelos/respuesta-tokens.ts`
    - `src/app/nucleo/auth/modelos/respuesta-token-acceso.ts`
    - `src/app/nucleo/auth/modelos/usuario-autenticado.ts`
    - `src/app/nucleo/auth/servicio-autenticacion.ts`
    - `src/app/nucleo/auth/almacen-tokens.ts` (memoria + `sessionStorage`)
    - `src/app/nucleo/auth/interceptor-autenticacion.ts`
  - **Bootstrap**:
    - `src/main.ts` — `provideHttpClient(withInterceptors([interceptorAutenticacion]))`
  - **Tests**:
    - `src/app/nucleo/auth/servicio-autenticacion.spec.ts`
    - `src/app/nucleo/auth/interceptor-autenticacion.spec.ts`
    - `src/app/nucleo/auth/almacen-tokens.spec.ts`
  - **Docs**:
    - `ai-specs/specs/api-spec.yml` (referencia; sin cambios de contrato)
    - `src/app/nucleo/auth/README.md` (decisión de storage)

**Nota de naming:** el enriquecimiento Jira cita rutas en inglés (`core/auth/auth.service.ts`). En este repo el código de aplicación vive en `nucleo/` con identificadores en español (p. ej. `ServicioSalud`). El plan sigue esa convención; el comportamiento cubre exactamente el alcance de SP-176.

**Contrato backend** (`apiBaseUrl` = `http://localhost:8000/api/v1`):

| Acción | Método | Path | Request | Response 200 |
|---|---|---|---|---|
| Login | POST | `/auth/login` | `{ correo, contrasena }` | `{ token_acceso, token_refresco, tipo_token, expira_en_segundos }` |
| Refresh | POST | `/auth/refresh` | `{ token_refresco }` | `{ token_acceso, tipo_token, expira_en_segundos }` |
| Yo | GET | `/auth/yo` | Bearer | `{ id, nombre_completo, correo, rol }` |

Errores: `{ exito, codigo, mensaje, detalle }`.

### Subtask Mapping

No subtasks — plan derived directly from the HU.

## 3. Implementation Steps

#### Step 0: Create Feature Branch

- **Action**: Crear y cambiar a la rama feature
- **Branch**: `feature/SP-176-frontend`
- **Commands**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-176-frontend
  ```

#### Step 1: Modelos / tipos TypeScript

- Files:
  - `src/app/nucleo/auth/modelos/credenciales-login.ts` — `{ correo: string; contrasena: string }`
  - `src/app/nucleo/auth/modelos/respuesta-tokens.ts` — login
  - `src/app/nucleo/auth/modelos/respuesta-token-acceso.ts` — refresh (sin `token_refresco`)
  - `src/app/nucleo/auth/modelos/usuario-autenticado.ts` — perfil de `/auth/yo`
  - `src/app/nucleo/auth/modelos/respuesta-error-api.ts` — `{ exito, codigo, mensaje, detalle }`
- Barrel opcional: `src/app/nucleo/auth/modelos/index.ts`

#### Step 2: Almacén de tokens

- File: `src/app/nucleo/auth/almacen-tokens.ts`
- **Decisión de storage** (documentar en README del módulo):
  - `token_acceso` y `token_refresco` en memoria (privado) + `sessionStorage` (sobrevive F5, se limpia al cerrar pestaña).
  - **No** usar `localStorage` (persistencia entre sesiones / mayor riesgo XSS).
  - Claves: `sst.token_acceso`, `sst.token_refresco`.
- API: `obtenerTokenAcceso()`, `obtenerTokenRefresco()`, `guardarPar(...)`, `actualizarTokenAcceso(...)`, `limpiar()`.
- **Nunca** loguear tokens en consola.

#### Step 3: Servicio de autenticación

- File: `src/app/nucleo/auth/servicio-autenticacion.ts`
- `providedIn: 'root'`
- Métodos:
  - `iniciarSesion(credenciales)` → `POST ${apiBaseUrl}/auth/login` → guardar tokens → `obtenerYo()` → actualizar signal de usuario
  - `refrescarToken()` → `POST ${apiBaseUrl}/auth/refresh` con `{ token_refresco }` → actualizar solo `token_acceso`
  - `cerrarSesion()` → limpiar almacén + signal usuario → `Router.navigateByUrl('/login')`
  - `obtenerYo()` → `GET ${apiBaseUrl}/auth/yo`
  - `estaAutenticado()` / `usuarioActual` (signal readonly)
- Estado: `signal<UsuarioAutenticado | null>(null)` (preferido sobre `BehaviorSubject`).
- Hidratación opcional al construir: si hay tokens en `sessionStorage`, llamar `obtenerYo()` (fallo → limpiar).

#### Step 4: Interceptor funcional

- File: `src/app/nucleo/auth/interceptor-autenticacion.ts`
- Firma: `export const interceptorAutenticacion: HttpInterceptorFn = (req, next) => { ... }`
- Reglas:
  1. Solo tocar URLs que empiecen por `environment.apiBaseUrl`.
  2. **Excluir** paths que terminen en `/auth/login` o `/auth/refresh` (sin header Bearer).
  3. Si hay `token_acceso`, clonar request con `Authorization: Bearer <token>`.
  4. Ante `401` en petición autenticada:
     - Ejecutar refresh **una sola vez** compartido (`shareReplay` / subject de refresh en curso en el servicio).
     - Reintentar la petición original con el nuevo token.
     - Si el refresh falla → `cerrarSesion()` (limpia + redirect `/login`) y propagar error.
  5. No reintentar si la petición fallida ya era un retry tras refresh (flag/contexto HTTP o contador).

#### Step 5: Registro en bootstrap

- File: `src/main.ts`
- Cambiar:
  ```ts
  provideHttpClient(withInterceptors([interceptorAutenticacion]))
  ```
- Asegurar `provideRouter` preparado para navegar a `/login` (ruta stub mínima si aún no existe feature de login: `{ path: 'login', component: ... }` o placeholder; si no hay componente, documentar dependencia con ticket de UI login y usar `navigateByUrl('/login')` igual).

#### Step 6: Unit tests (TDD)

- `almacen-tokens.spec.ts`: guardar/leer/limpiar; no deja residuos entre tests.
- `servicio-autenticacion.spec.ts` (`provideHttpClientTesting`):
  - login guarda tokens y llama `/auth/yo`
  - refresh actualiza solo acceso
  - cerrarSesion limpia y navega
  - nunca `console.log` de tokens (spy opcional)
- `interceptor-autenticacion.spec.ts`:
  - inyecta `Authorization` en GET a `apiBaseUrl` (p. ej. ping)
  - **no** inyecta en `/auth/login` ni `/auth/refresh`
  - 401 → un solo POST refresh → retry de la original
  - N 401 concurrentes → un solo refresh
  - refresh 401 → limpia sesión + navega a `/login`

#### Step 7: Update Technical Documentation

- `src/app/nucleo/auth/README.md` — decisión de storage + flujo 401/refresh.
- `ai-specs/specs/stacks/frontend-angular-standards.mdc` — si se introduce patrón de interceptor funcional JWT, una línea en Key Rules / HTTP.
- No cambiar contrato OpenAPI (ya existe en backend); opcionalmente copiar/reflejar endpoints auth en `ai-specs/specs/api-spec.yml` del frontend si el archivo existe y está vacío de auth.

## 4. Implementation Order

1. Step 0 — rama `feature/SP-176-frontend`
2. Step 1 — modelos tipados
3. Step 2 — almacén de tokens (+ tests)
4. Step 3 — `ServicioAutenticacion` (+ tests TDD)
5. Step 4 — interceptor (+ tests TDD, incl. single-flight)
6. Step 5 — registrar en `main.ts`
7. Step 6 — cobertura ≥ 90% del módulo auth
8. Step 7 — documentación

## 5. Testing Checklist

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` ≥ 90% en archivos nuevos de auth
- [ ] Header Bearer en peticiones a `apiBaseUrl` excepto login/refresh
- [ ] Un solo refresh ante 401 concurrentes
- [ ] Refresh fallido → sesión limpia + `/login`
- [ ] Tokens nunca en logs de consola
- [ ] Tests existentes de ping (`ServicioSalud`, `RootComponent`) siguen verdes

## 6. Tooling Reference

| Purpose | Command |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Error Response Format

```json
{
  "exito": false,
  "codigo": "TOKEN_EXPIRADO",
  "mensaje": "Descripción legible",
  "detalle": []
}
```

HTTP relevante: 401 `CREDENCIALES_INVALIDAS` | `TOKEN_INVALIDO` | `TOKEN_EXPIRADO` · 422 `ERROR_VALIDACION` · 500 `ERROR_INTERNO`

## 8. Dependencies

Ninguna dependencia npm nueva. Usar APIs de Angular 17+: `HttpInterceptorFn`, `withInterceptors`, `signal`, `inject()`, `Router`.

## 9. Notes

- Branch naming: `feature/SP-176-frontend` (stack side = frontend).
- Refresh **no** rota el `token_refresco` en el contrato actual; solo actualiza `token_acceso`.
- Evitar dependencia circular: el interceptor usa `inject(ServicioAutenticacion)`; el refresh debe marcarse para no re-entrar al interceptor en bucle (excluir `/auth/refresh`).
- La ruta `/login` puede no existir aún; el interceptor/servicio solo redirige. La pantalla de login es fuera de alcance de SP-176.
- Preferir `provideHttpClientTesting` en tests nuevos (alineado con Angular 17+); los specs legacy con `HttpClientTestingModule` pueden quedar hasta un refactor aparte.

## 10. Implementation Verification Checklist

- [ ] Código: lint/build OK, tipado estricto
- [ ] Auth: login / refresh / yo / logout
- [ ] Interceptor: Bearer + 401 single-flight + logout forzado
- [ ] Storage: memoria + sessionStorage documentado
- [ ] Tests verdes, cobertura ≥ 90% en módulo auth
- [ ] Docs actualizadas
- [ ] Branch: `feature/SP-176-frontend`
