# Plan de implementación: SP-238 Crear pantalla y dashboard genérico de inicio de sesión

## 1. Resumen

Entregar el **cascarón visual y navegable** de la app Angular tras autenticación:

1. **Rediseñar `/login`** (`PaginaLoginComponent`) al lenguaje visual del mockup [`sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) (tarjeta central, logo escudo indigo, Inter, slate/indigo), **sin cambiar** la lógica de `ServicioAutenticacion` / `returnUrl`.
2. **Crear shell autenticado** (barra lateral `bg-slate-900` + cabecera con usuario/rol + cerrar sesión) y **dashboard genérico** (`/dashboard`) con StatCards placeholder y accesos rápidos (p. ej. Diagnóstico cuando exista).

No se portan módulos de negocio del mockup (GTC 45, PDF, IA, plan de mejora). No hay endpoints nuevos: reutiliza auth SP-176/SP-177.

Stack activo: `frontend-angular` (Angular 17 standalone + Tailwind + Signals). Idioma: español (identificadores, tests, docs).

## Estimación de puntos de historia

<!-- STORY_POINTS:3 -->
- **HU total**: 3 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 3 SP del enriquecimiento. Login ya funciona (solo UI); el peso está en shell responsive + dashboard placeholder + rutas + tests. Sin API nueva ni lógica de dominio.
- **Subtasks**: ninguna (SP-238 es subtarea; el plan se deriva de la HU enriquecida).
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Active stack: `frontend-angular` (Angular)
- Capas / archivos afectados:

  - **Auth UI** (modificar):
    - `src/app/features/auth/paginas/pagina-login.component.ts` — rediseño visual
    - `src/app/features/auth/paginas/pagina-login.component.spec.ts` — ajustar assertions de UI si aplica
  - **Layout / shell** (crear; esqueleto vacío en `layout/`):
    - `src/app/layout/shell.component.ts` — contenedor sidebar + cabecera + `<router-outlet>`
    - `src/app/layout/componentes/barra-lateral.component.ts` — nav mockup
    - `src/app/layout/componentes/cabecera.component.ts` — usuario + cerrar sesión
    - `src/app/layout/index.ts` — barrel
  - **Feature dashboard** (nueva):
    - `src/app/features/dashboard/paginas/pagina-dashboard.component.ts`
    - `src/app/features/dashboard/componentes/tarjeta-resumen.component.ts`
    - `src/app/features/dashboard/README.md`
  - **Auth util** (ajuste menor):
    - `src/app/nucleo/auth/resolver-url-retorno.ts` — default post-login → `/dashboard` (hoy `/`)
  - **Routing**:
    - `src/app/app.routes.ts` — shell como padre autenticado; `/login` fuera del shell
    - `src/app/app.routes.spec.ts`
  - **Estilos globales**:
    - `src/styles.css` — Inter (+ JetBrains Mono opcional) como en mockup
  - **Home legacy**:
    - `src/app/root.component.ts` — deja de ser landing autenticada (ping puede quedar fuera o como ruta de depuración opcional; preferible no exponerlo en nav)

**Nota de naming:** el README de `layout/` usa inglés (`header`, `nav`). En implementación seguir español del código real (`cabecera`, `barra-lateral`, `paginas`, `componentes`), alineado a auth y al plan SP-189.

### Diseño de referencia (mockup)

| Ítem | Valor |
|---|---|
| Repo | [`ingjohnaragon-crypto/sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) |
| Shell | Sidebar fija `bg-slate-900`, logo escudo `bg-indigo-600`, brand «SST-Audit Pro», `NavItem` activo indigo |
| Dashboard | `DashboardView` — grid StatCards + paneles; **solo estructura/estilo**, datos placeholder |
| Login | No hay pantalla login dedicada en el mockup → aplicar mismos tokens (slate/indigo, `rounded-[2.5rem]`, Inter) |

**Tokens a replicar:**

| Token | Clases |
|---|---|
| Fondo | `bg-slate-50 text-slate-800` |
| Sidebar | `fixed left-0 top-0 h-full w-20 md:w-64 bg-slate-900` |
| Nav activo | `bg-indigo-600 text-white shadow-xl` |
| Nav inactivo | `text-slate-500 hover:bg-slate-800/80 hover:text-white` |
| Superficie | `bg-white rounded-[2.5rem] border border-slate-100 shadow-sm` |
| Labels | `text-[10px] font-black uppercase tracking-widest` |
| CTA | `bg-slate-900` / hover `bg-indigo-600` o botón primario indigo |
| Fuentes | Inter (sans) en `styles.css` |

**Ítems de navegación v1 (solo módulos existentes o previstos):**

| Label | Ruta | Notas |
|---|---|---|
| Dashboard | `/dashboard` | activo por defecto |
| Diagnóstico / Estándares 0312 | `/diagnostico` | enlace listo; ruta puede no existir aún (SP-189) — si 404, dejar el link documentado o deshabilitado hasta merge |
| Ejemplo sensible | `/ejemplo-sensible` | opcional / ocultar en prod; o no incluir en nav de producto |

No incluir en nav: Auditoría GTC 45, Gestor documental, Plan de mejora, Asistente AI (fuera de alcance).

### Auth / RBAC (reutilizar)

- `ServicioAutenticacion` — `iniciarSesion`, `usuarioActual`, `cerrarSesion`
- `guardAutenticacion` en rutas del shell
- `*appSiTieneRol` en accesos de escritura del dashboard (p. ej. CTA «Nueva autoevaluación» solo `ADMINISTRADOR` | `AUDITOR_SST`)
- Roles lectura: todos autenticados ven dashboard; `CONSULTA` sin CTAs de escritura

### Mapeo de subtareas

No hay subtareas — el plan se deriva de la HU enriquecida (SP-238).

## 3. Pasos de implementación

#### Paso 0: Crear rama feature

- **Acción**: Crear y cambiar a la rama feature
- **Branch**: `feature/SP-238-frontend`
- **Commands**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-238-frontend
  ```

#### Paso 1: Tokens globales (fuentes)

- File: `src/styles.css`
- Importar Inter (y opcional JetBrains Mono) vía Google Fonts, como mockup `index.css`.
- Asegurar `font-sans` / body con Inter.
- Sin dependencias npm nuevas.

#### Paso 2: Default post-login → `/dashboard`

- File: `src/app/nucleo/auth/resolver-url-retorno.ts`
- Cambiar fallback de `'/'` a `'/dashboard'`.
- Actualizar `resolver-url-retorno.spec.ts` (si existe) o crear assertions.
- Login sigue usando `resolverUrlRetorno(returnUrl)`.

#### Paso 3: Rediseñar `PaginaLoginComponent`

- File: `src/app/features/auth/paginas/pagina-login.component.ts`
- **Conservar**: `FormBuilder.nonNullable`, validators, signals `enviando`/`error`, `iniciarSesion`, navegación post-login.
- **UI**:
  - Fondo página `min-h-screen bg-slate-50`
  - Card centrada `max-w-md mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10`
  - Logo: bloque `bg-indigo-600 rounded-2xl` + SVG escudo + título «SST-Audit **Pro**»
  - Inputs con borde slate, labels tipografía mockup
  - Botón submit `w-full bg-slate-900 … rounded-2xl font-black uppercase tracking-widest`
  - Error `role="alert"` en rojo accesible
- Actualizar spec: happy path / error / invalid form siguen verdes; opcional snapshot de clases clave.

#### Paso 4: Componentes de layout (shell)

Standalone, `OnPush`, Tailwind, SVG locales (no lucide):

| Componente | Responsabilidad |
|---|---|
| `BarraLateralComponent` | Brand + lista de `routerLink` + `routerLinkActive`; colapsa a íconos en `< md` |
| `CabeceraComponent` | Título de sección opcional; muestra `usuarioActual().nombre_completo` y `rol`; botón «Cerrar sesión» → `cerrarSesion()` |
| `ShellComponent` | `barra-lateral` + área `pl-20 md:pl-64` + `cabecera` + `<router-outlet>` |

Estructura sugerida:

```text
src/app/layout/
├── shell.component.ts
├── shell.component.spec.ts
├── componentes/
│   ├── barra-lateral.component.ts
│   ├── barra-lateral.component.spec.ts
│   ├── cabecera.component.ts
│   └── cabecera.component.spec.ts
├── index.ts
└── README.md  (actualizar: naming español + mockup)
```

#### Paso 5: Feature dashboard

| Componente | Responsabilidad |
|---|---|
| `TarjetaResumenComponent` | Presentacional: `@Input() titulo`, `valor`, `subtitulo?`, `colorBorde?`; card blanca `rounded-[2rem]` |
| `PaginaDashboardComponent` | Contenedor: saludo con nombre; grid 1–4 StatCards placeholder (p. ej. «Puntaje 0312 — —», «Empresas — —»); panel «Accesos rápidos» con links; CTAs escritura con `*appSiTieneRol` |

Datos: **placeholder** (`'—'`, `0`, textos fijos). No llamar APIs de diagnóstico/empresas en este ticket.

#### Paso 6: Rutas

- File: `src/app/app.routes.ts`

```typescript
export const rutasApp: Routes = [
  { path: 'login', component: PaginaLoginComponent },
  { path: 'acceso-denegado', component: PaginaAccesoDenegadoComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [guardAutenticacion],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/paginas/pagina-dashboard.component').then(
            (m) => m.PaginaDashboardComponent,
          ),
      },
      {
        path: 'ejemplo-sensible',
        component: PaginaEjemploSensibleComponent,
        canActivate: [guardRoles],
        data: { rolesPermitidos: [...ROLES_AUDITORIA_SENSIBLE] },
      },
      // /diagnostico se añadirá en SP-189 bajo el mismo shell
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
```

- Actualizar `app.routes.spec.ts`: shell + `guardAutenticacion`; login sin guard; redirect `''` → dashboard.
- `RootComponent` (ping): dejar de ser ruta `''`; opcional ruta `/salud` solo dev o eliminar de rutas públicas.

#### Paso 7: Manejo de errores / UX

- Login: mantener mensaje genérico (no filtrar códigos de API en UI salvo `mensaje` si se mejora en el futuro).
- Sin sesión en rutas shell → `guardAutenticacion` → `/login?returnUrl=...`.
- Cerrar sesión → limpia tokens + `/login`.

#### Paso 8: Tests unitarios

Cobertura ≥ 90% en archivos nuevos/modificados del shell y dashboard.

| Spec | Casos |
|---|---|
| `pagina-login.component.spec.ts` | UI + happy path / error / invalid |
| `resolver-url-retorno.spec.ts` | default `/dashboard`; open-redirect bloqueado |
| `barra-lateral.component.spec.ts` | links presentes; `routerLinkActive` |
| `cabecera.component.spec.ts` | muestra nombre/rol; click cierra sesión (spy) |
| `shell.component.spec.ts` | renderiza outlet / hijos |
| `tarjeta-resumen.component.spec.ts` | inputs visibles |
| `pagina-dashboard.component.spec.ts` | saludo; CONSULTA sin CTA escritura |
| `app.routes.spec.ts` | guards y redirects |

#### Paso 9: Documentación

- `src/app/features/dashboard/README.md` — alcance genérico, link mockup, qué queda para tickets posteriores.
- Actualizar `src/app/layout/README.md` — naming español + estructura real.
- Mencionar en ARCHITECTURE.md solo si lista features (entrada breve shell/dashboard).

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-238-frontend`
2. Paso 1 — fuentes / tokens
3. Paso 2 — `resolverUrlRetorno` → `/dashboard`
4. Paso 3 — rediseño login (+ specs)
5. Paso 4 — shell / barra / cabecera (+ specs)
6. Paso 5 — dashboard + StatCards (+ specs)
7. Paso 6 — rutas
8. Paso 7 — UX errores / sesión
9. Paso 8 — cobertura
10. Paso 9 — docs

## 5. Checklist de pruebas

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` ≥ 90% en layout + dashboard + login tocado
- [ ] Manual: login → dashboard; `returnUrl` a ruta interna funciona
- [ ] Manual: cerrar sesión → `/login`; tokens limpios
- [ ] Manual: sin token, `/dashboard` → `/login?returnUrl=...`
- [ ] Viewport 360 px: sidebar colapsada (`w-20`), dashboard usable
- [ ] Paridad visual razonable vs mockup (sidebar slate-900, indigo, cards)
- [ ] Rol `CONSULTA`: dashboard visible; sin CTAs de escritura
- [ ] Tests auth existentes verdes
- [ ] `ng build` OK

## 6. Referencia de tooling

| Purpose | Command |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint:eslint` |
| Mockup | [`sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) → `npm run dev` |

## 7. Formato de respuesta de error

```json
{
  "exito": false,
  "codigo": "CREDENCIALES_INVALIDAS",
  "mensaje": "Descripción legible",
  "detalle": null
}
```

HTTP relevante login: 401 `CREDENCIALES_INVALIDAS` · 422 `ERROR_VALIDACION` · 500 `ERROR_INTERNO`. El interceptor maneja 401 en rutas autenticadas (refresh).

## 8. Dependencias

Ninguna dependencia npm nueva. SVG/íconos locales. No portar `lucide-react`, `motion`, `recharts`. No usar Angular Material para este ticket.

## 9. Notas

- Branch: `feature/SP-238-frontend`.
- **Fuente de diseño:** [sst-audit-pro-mckp](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) — shell + dashboard; login inventado con mismos tokens.
- Coordinación con **SP-189**: el shell de SP-238 es el contenedor; diagnóstico debe montarse como hijo del shell (`path: 'diagnostico'`). Si SP-189 se implementa antes, migrar su ruta bajo shell en este ticket o en un follow-up mínimo.
- `RootComponent` ping deja de ser home; no exponerlo en la nav de producto.
- Fuera de alcance: gráficos reales, multas, hallazgos GTC, PDF, chat AI, alta de empresas.
- Open-redirect: `resolverUrlRetorno` ya valida rutas relativas; mantener esa regla.

## 10. Checklist de verificación de implementación

- [ ] Código: lint/build OK, tipado estricto, OnPush
- [ ] Login rediseñado; lógica auth intacta
- [ ] Shell + dashboard genérico alineados al mockup
- [ ] `/` → `/dashboard` autenticado; login default post-auth → dashboard
- [ ] Cerrar sesión funciona
- [ ] Responsive ≥ 360 px
- [ ] RBAC UI en CTAs de escritura
- [ ] Tests verdes, cobertura ≥ 90% en archivos nuevos
- [ ] Docs README layout + dashboard
- [ ] Branch: `feature/SP-238-frontend`
