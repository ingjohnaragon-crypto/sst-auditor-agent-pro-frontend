# Plan de implementación: SP-189 Crear pantalla responsiva de diagnóstico en Angular

## 1. Resumen

Construir en el frontend Angular la feature de **diagnóstico de estándares mínimos** (Res. 0312): selector de empresa, creación de autoevaluación, matriz de 60 ítems agrupados por ciclo PHVA con calificación inmediata (`CUMPLE` | `NO_CUMPLE` | `NO_APLICA`), barra de avance, finalización con resultado, histórico por empresa en solo lectura, responsive (≥ 360 px) y RBAC en UI para rol `CONSULTA`.

Consume la API de SP-188 (`environment.apiBaseUrl` = `/api/v1`) con Bearer JWT ya implementado (SP-176/SP-177). No incluye alta de empresas (solo selección vía `GET /empresas`).

**Diseño UI:** portar el lenguaje visual del mockup de referencia [`sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) (vista `StandardsView` / pestaña «Estándares 0312»), adaptado a Angular + contrato API real. No se copia el código React ni el alcance completo del mockup (GTC 45, chat AI, PDF, plan de mejora, etc.).

Stack activo: `frontend-angular` (Angular 17 standalone + Tailwind + Signals). Idioma: español (identificadores, tests, docs).

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 SP del ticket. Matriz interactiva de 60 ítems con estado local + persistencia, UI alineada al mockup [`sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp), responsive (acordeón PHVA), histórico, RBAC en UI e integración con ~8 operaciones HTTP. Complejidad media-alta de UI/estado; el contrato backend ya existe (SP-188). Incertidumbre baja si el API está disponible en local.
- **Subtasks**: ninguna (SP-189 es subtarea; el plan se deriva de la HU).
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Active stack: `frontend-angular` (Angular)
- Capas / archivos afectados:

  - **Feature `diagnostico`** (nueva):
    - `src/app/features/diagnostico/modelos/` — tipos TS del dominio
    - `src/app/features/diagnostico/servicios/` — HTTP tipado
    - `src/app/features/diagnostico/paginas/` — contenedores (smart)
    - `src/app/features/diagnostico/componentes/` — presentacionales (dumb), UI = mockup `StandardsView`
    - `src/app/features/diagnostico/index.ts` — barrel opcional
  - **Estilos globales** (tokens mockup):
    - `src/styles.css` — fuentes Inter + JetBrains Mono
    - `tailwind.config.cjs` — extensión mínima si se requiere
  - **Auth / RBAC** (reutilizar, sin reescribir):
    - `src/app/nucleo/auth/guard-autenticacion.ts`
    - `src/app/nucleo/auth/guard-roles.ts` (solo autenticación en rutas de diagnóstico; no restringir a `ROLES_AUDITORIA_SENSIBLE`)
    - `src/app/shared/directivas/si-tiene-rol.directive.ts` — ocultar escritura a `CONSULTA`
    - Constante nueva sugerida: `ROLES_ESCRITURA_DIAGNOSTICO` = `ADMINISTRADOR` | `AUDITOR_SST` en `constantes-roles.ts`
  - **Routing**:
    - `src/app/app.routes.ts` — rutas `/diagnostico`, `/diagnostico/:id`, `/diagnostico/historico`
  - **Shared** (mínimo, solo si hace falta toast reutilizable):
    - Preferir componente presentacional `AlertaToastComponent` bajo `features/diagnostico/componentes/` o `shared/components/` si se reutiliza
  - **Tests** colocados junto a cada archivo `.spec.ts`
  - **Docs**:
    - `src/app/features/diagnostico/README.md`
    - Referencia de contrato: backend `ai-specs/specs/api-spec.yml` (el frontend aún no tiene `api-spec.yml` propio)

**Nota de naming:** el código de aplicación usa español (`nucleo`, `paginas`, `servicios`, `modelos`, `componentes`). El esqueleto `core/` / `features/*/containers` en inglés queda como legacy documental; este plan sigue la convención ya usada en auth.

### Diseño de referencia (mockup)

| Ítem | Valor |
|---|---|
| Repo | [`ingjohnaragon-crypto/sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) |
| Descripción | Mockup de sistema de gestión integral (React + Vite + Tailwind) |
| Vista a portar | `StandardsView` en `src/App.tsx` (~líneas 1609–1965) + shell nav |
| Tipos de apoyo | `EstadoCumplimiento`, `Estandar0312`, `getValoracion0312` en `src/types.ts` |
| Tokens CSS | `src/index.css` — Inter + JetBrains Mono |

**Tokens / look & feel a replicar en Angular (Tailwind, sin Material):**

| Token | Uso en mockup | Clases / valor |
|---|---|---|
| Fondo app | canvas | `bg-slate-50 text-slate-800` |
| Superficie | panel principal | `bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10` |
| Acento | títulos / puntaje | `text-indigo-600`, botones activos `bg-indigo-600` |
| Tipografía labels | micro-labels | `text-[10px] font-black uppercase tracking-widest text-slate-400` |
| Tipografía display | títulos | `text-3xl font-black tracking-tight` |
| Fuentes | mockup | Inter (sans) + JetBrains Mono (mono) vía Google Fonts en `styles.css` |
| CUMPLE | estado + botón | borde/fondo `emerald-*`; botón activo `bg-emerald-500` |
| NO_CUMPLE | estado + botón | `red-*` / `bg-red-500` |
| NO_APLICA | estado + botón | `blue-*` / `bg-blue-500` |
| Ítem tarjeta | card por estándar | `p-6 border-2 rounded-[2rem]` + tint según estado |
| Icono estado | círculo 40px | `w-10 h-10 rounded-xl` + Check / Alert / Shield |
| Header PHVA | sección | título uppercase + `h-px bg-slate-200` divisor |
| Puntaje hero | derecha del header | `%` grande (`text-5xl`/`text-6xl`) + badge valoración |
| Shell (mínimo) | sidebar mockup | opcional en este ticket: link en home o barra simple `bg-slate-900`; layout completo de nav puede quedar para un ticket de shell |

**Mapeo mockup → API / alcance SP-189:**

| Mockup | SP-189 (Angular) |
|---|---|
| Catálogo local `ESTANDARES_BASE` + perfiles 7/21/62 | Catálogo API `GET /estandares-minimos` (60 ítems); ciclos `PLANEAR\|HACER\|VERIFICAR\|ACTUAR` |
| Ciclos `RECURSOS` / `I. PLANEAR`… | Agrupar solo por `ciclo_phva` del API (RECURSOS del mockup no existe en backend; no inventar ciclo) |
| Cards de perfil Micro/Pequeña/Gran | **Fuera de alcance funcional** (el API no filtra por perfil). Opcional: badge informativo con `numero_trabajadores` / `nivel_riesgo_arl` de la empresa seleccionada |
| Gráficos Recharts + anillos PHVA | **Opcional / diferido**: priorizar lista de ítems + avance; anillos o barras solo si no comprometen el SP |
| Botones Cumple / No Cumple / No Aplica | Obligatorio; mismo layout `grid-cols-3` |
| Campo observaciones | No está en mockup; **sí** en API → textarea bajo la fila de botones |
| Persistencia local `setEstadoEstandar` | `PUT .../calificaciones/{estandar_id}` |
| `getValoracion0312` (CRÍTICO / MODERADAMENTE ACEPTABLE / ACEPTABLE) | Tras `finalizar`: mostrar `puntaje_total` + alerta si `requiere_plan_mejora` (umbral backend &lt; 85). Se puede reutilizar la misma semántica visual de badges del mockup |
| PDF / AI / GTC 45 / Plan mejora / Chat | **Fuera de alcance** SP-189 |

**Decisión RBAC (alineada con CA del ticket):**

| Rol | Navegación | UI escritura (crear, calificar, finalizar) |
|---|---|---|
| `ADMINISTRADOR`, `AUDITOR_SST` | Sí | Sí |
| `CONSULTA` | Sí (lectura / histórico) | No (`*appSiTieneRol`) |

Rutas: `canActivate: [guardAutenticacion]` únicamente (cualquier autenticado). La autorización real la impone el backend (`403 ACCESO_DENEGADO`).

**Contrato backend** (`apiBaseUrl` = `http://localhost:8000/api/v1`):

| Acción | Método | Path | Request | Response |
|---|---|---|---|---|
| Listar empresas | GET | `/empresas` | — | `Empresa[]` |
| Catálogo | GET | `/estandares-minimos` | `?ciclo_phva` opcional | `EstandarMinimo[]` (60) |
| Crear autoevaluación | POST | `/autoevaluaciones` | `{ empresa_id, fecha }` | `201 Autoevaluacion` |
| Histórico | GET | `/autoevaluaciones?empresa_id=` | query | `Autoevaluacion[]` (sin calificaciones) |
| Detalle | GET | `/autoevaluaciones/{id}` | — | `Autoevaluacion` + `calificaciones` |
| Calificar | PUT | `/autoevaluaciones/{id}/calificaciones/{estandar_id}` | `{ resultado, observaciones? }` | `CalificacionEstandar` |
| Finalizar | POST | `/autoevaluaciones/{id}/finalizar` | — | `Autoevaluacion` finalizada |

Tipos clave (decimales como `string`):

```typescript
type CicloPhva = 'PLANEAR' | 'HACER' | 'VERIFICAR' | 'ACTUAR';
type ResultadoCalificacion = 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA';

interface EstandarMinimo {
  id: string;
  ciclo_phva: CicloPhva;
  numeral: string;
  descripcion: string;
  valor_porcentual: string;
}

interface CalificacionEstandar {
  estandar_id: string;
  resultado: ResultadoCalificacion;
  puntaje: string;
  observaciones: string | null;
}

interface Autoevaluacion {
  id: string;
  empresa_id: string;
  usuario_id: string;
  fecha: string; // YYYY-MM-DD
  puntaje_total: string | null;
  requiere_plan_mejora: boolean;
  calificaciones: CalificacionEstandar[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

Errores: `{ exito, codigo, mensaje, detalle }` (`RespuestaErrorApi` ya en `nucleo/auth/modelos`).

Reglas de negocio (UI):

- Avance = ítems con calificación / 60.
- «Finalizar» deshabilitado hasta avance === 60.
- Tras finalizar (`puntaje_total != null` o flag local `finalizada`): controles de edición deshabilitados; `409 AUTOEVALUACION_FINALIZADA` si el API lo rechaza.
- `requiere_plan_mejora` cuando `puntaje_total < 85` (umbrales los calcula el backend; la UI solo muestra).
- No enviar `puntaje` ni `usuario_id` desde el cliente.

### Mapeo de subtareas

No hay subtareas — el plan se deriva directamente de la HU (SP-189 es subtarea de la épica de diagnóstico).

## 3. Pasos de implementación

#### Paso 0: Crear rama feature

- **Acción**: Crear y cambiar a la rama feature
- **Branch**: `feature/SP-189-frontend`
- **Commands**:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/SP-189-frontend
  ```

#### Paso 1: Modelos / tipos TypeScript

- Directorio: `src/app/features/diagnostico/modelos/`
- Archivos:
  - `ciclo-phva.ts` — union `CicloPhva` + orden de visualización `[PLANEAR, HACER, VERIFICAR, ACTUAR]`
  - `resultado-calificacion.ts` — `CUMPLE` | `NO_CUMPLE` | `NO_APLICA`
  - `empresa.ts` — respuesta de `/empresas`
  - `estandar-minimo.ts`
  - `calificacion-estandar.ts`
  - `autoevaluacion.ts`
  - `solicitud-crear-autoevaluacion.ts` — `{ empresa_id, fecha }`
  - `solicitud-calificar-estandar.ts` — `{ resultado, observaciones?: string | null }`
  - `item-diagnostico-vista.ts` (opcional) — vista fusionada estándar + calificación local para la matriz
  - `index.ts` — barrel
- Reutilizar `RespuestaErrorApi` de `nucleo/auth/modelos` (no duplicar).

#### Paso 2: Constantes de roles de escritura

- File: `src/app/nucleo/auth/constantes-roles.ts`
- Añadir:
  ```typescript
  export const ROLES_ESCRITURA_DIAGNOSTICO: readonly RolUsuario[] = [
    'ADMINISTRADOR',
    'AUDITOR_SST',
  ];
  ```
- Exportar desde `nucleo/auth/index.ts`.

#### Paso 3: Servicios HTTP del feature

- Files:
  - `src/app/features/diagnostico/servicios/servicio-empresas.ts`
  - `src/app/features/diagnostico/servicios/servicio-estandares-minimos.ts`
  - `src/app/features/diagnostico/servicios/servicio-autoevaluaciones.ts`
- `providedIn: 'root'`, `inject(HttpClient)`, base `environment.apiBaseUrl`.
- Métodos:
  - `ServicioEmpresas.listar(): Observable<Empresa[]>`
  - `ServicioEstandaresMinimos.listar(ciclo?: CicloPhva): Observable<EstandarMinimo[]>`
  - `ServicioAutoevaluaciones`:
    - `crear(solicitud): Observable<Autoevaluacion>`
    - `listarPorEmpresa(empresaId): Observable<Autoevaluacion[]>`
    - `obtenerPorId(id): Observable<Autoevaluacion>`
    - `calificar(id, estandarId, solicitud): Observable<CalificacionEstandar>`
    - `finalizar(id): Observable<Autoevaluacion>`
- Nunca llamar `HttpClient` desde componentes.

#### Paso 4: Tokens de diseño (desde mockup)

- File: `src/styles.css` (y/o `tailwind.config.cjs`)
- Importar fuentes Inter + JetBrains Mono (como en mockup `index.css`).
- Extender tema Tailwind si hace falta (radius `2rem` / `2.5rem` ya cubiertos con clases arbitrarias).
- Documentar en README del feature la paleta: slate canvas, indigo accent, emerald/red/blue estados.
- Iconos: SVG inline o componentes mínimos (Check / Alert / Shield) — **no** añadir `lucide-react` ni `recharts` / `motion` salvo decisión explícita posterior. Preferir cero deps nuevas.

#### Paso 5: Componentes presentacionales (UI = `StandardsView`)

Todos standalone, `ChangeDetectionStrategy.OnPush`, Tailwind, `@Input` / `@Output` tipados. **Aspecto visual = mockup**; lógica HTTP = servicios del Paso 3.

| Componente | Responsabilidad | Referencia mockup |
|---|---|---|
| `SelectorEmpresaComponent` | Select de empresas (estilo card/borde `rounded-2xl`); emite `empresaSeleccionada` | Header empresa del shell |
| `CabeceraDiagnosticoComponent` | Título «Estándares Mínimos / Resolución 0312», chip de ítems, puntaje parcial opcional | Header de `StandardsView` |
| `BarraAvanceDiagnosticoComponent` | `calificados / 60` + barra `bg-slate-100` / fill indigo o verde | Barra de progreso del shell |
| `ResumenPhvaComponent` (opcional) | 4 cards con % por ciclo (sin Recharts en v1) | Grid `fasesPHVA` / anillos |
| `GrupoPhvaComponent` | Título ciclo + divisor; en móvil acordeón | Bloque `{faseInfo.nombre}` |
| `ItemCalificacionComponent` | Tarjeta `rounded-[2rem]`: icono estado, `numeral`, `descripcion`, `valor_porcentual`, botones ×3, observaciones; `readonly` | Card ítem ~1850–1914 |
| `ListaHistoricoAutoevaluacionesComponent` | Lista/cards del histórico; emite `verDetalle` | Mismo lenguaje de cards |
| `ResultadoFinalizacionComponent` | `%` grande + badge (aceptable / plan mejora) + CTA | Badge `valoracion` + panel indigo info |
| `AlertaErrorComponent` | Banner `rounded-2xl` amber/red con `mensaje` | Banner `validation` del mockup |
| `BotonFinalizarDiagnosticoComponent` | CTA `bg-slate-900` / hover indigo; disabled hasta 60/60 | Botones CTA del mockup |

Contrato visual del ítem (obligatorio):

```text
[icono] numeral + chip ciclo
        descripción (bold)
        subtítulo / valor % a la derecha
[ Cumple ] [ No Cumple ] [ No Aplica ]   ← grid-cols-3, font-black uppercase
[ observaciones textarea ]              ← solo SP-189 / API
```

Responsive:

- Desktop (`md+`): lista de tarjetas apiladas por PHVA (como mockup `max-w-4xl`).
- Móvil (≥ 360 px): cada ciclo PHVA en acordeón; mismas tarjetas (no tabla).
- Breakpoints Tailwind (`sm:`, `md:`); tipografía/padding reducidos en móvil (`p-4` vs `p-10`).

#### Paso 6: Páginas (contenedores) y estado

- `PaginaDiagnosticoComponent` (`/diagnostico`)
  - Layout contenedor: superficie blanca `rounded-[2.5rem]` centrada (`max-w-4xl mx-auto`), fondo página `bg-slate-50` (como `StandardsView`).
  - Carga empresas + catálogo (forkJoin o signals async).
  - Flujo: seleccionar empresa → «Iniciar» (`POST /autoevaluaciones` con `fecha` = hoy ISO) → matriz.
  - Estado con **signals**: `empresas`, `estandares`, `autoevaluacion`, `calificacionesPorEstandar` (`Map`/`Record`), `cargando`, `error`, `guardandoIds`, `finalizada`.
  - Al calificar: optimistic opcional o disabled del ítem mientras `PUT`; actualizar mapa con respuesta (`puntaje`).
  - Debounce leve (~300–400 ms) solo en `observaciones` para no spamear PUT; el `resultado` dispara PUT inmediato.
  - Botón Finalizar → `POST .../finalizar` → `ResultadoFinalizacionComponent` → `finalizada = true`.
  - `*appSiTieneRol="ROLES_ESCRITURA_DIAGNOSTICO"` en controles de escritura.

- `PaginaDetalleDiagnosticoComponent` (`/diagnostico/:id`)
  - `GET /autoevaluaciones/{id}` + catálogo; modo solo lectura si `puntaje_total != null` **o** query/flag `soloLectura`.
  - Reutilizar los mismos presentacionales con `[readonly]="true"` (botones deshabilitados / sin hover de escritura).

- `PaginaHistoricoDiagnosticoComponent` (`/diagnostico/historico`)
  - Selector empresa → `GET /autoevaluaciones?empresa_id=` → lista de cards → navegar a detalle.

Estado de vista discriminado (patrón similar a login): `cargando` | `listo` | `error` | `vacio`.

#### Paso 7: Rutas

- File: `src/app/app.routes.ts`
- Añadir (preferible `loadComponent` lazy según `ARCHITECTURE.md`):

  ```typescript
  {
    path: 'diagnostico',
    canActivate: [guardAutenticacion],
    children: [
      { path: '', loadComponent: () => import(...).then(m => m.PaginaDiagnosticoComponent) },
      { path: 'historico', loadComponent: () => import(...).then(m => m.PaginaHistoricoDiagnosticoComponent) },
      { path: ':id', loadComponent: () => import(...).then(m => m.PaginaDetalleDiagnosticoComponent) },
    ],
  }
  ```

- Orden: `historico` **antes** de `:id`.
- Actualizar `app.routes.spec.ts`.
- Enlace de navegación mínimo desde `RootComponent` o header simple estilo mockup (`bg-slate-900`, label «Estándares 0312» / «Diagnóstico») si no hay layout de shell aún.

#### Paso 8: Manejo de errores

- Extraer `mensaje` de `HttpErrorResponse.error` tipado como `RespuestaErrorApi`.
- Mostrar banner estilo mockup (`rounded-2xl`, amber/red); no loguear tokens.
- Casos a mapear en UI:
  - `403 ACCESO_DENEGADO` — mensaje + sin reintentar escritura
  - `404 EMPRESA_NO_ENCONTRADA` / `AUTOEVALUACION_NO_ENCONTRADA` / `ESTANDAR_NO_ENCONTRADO`
  - `409 AUTOEVALUACION_INCOMPLETA` / `AUTOEVALUACION_FINALIZADA`
  - `422 ERROR_VALIDACION`
- Ante `401`: lo resuelve el interceptor existente (refresh / login).

#### Paso 9: Tests unitarios

Cobertura ≥ 90% en archivos nuevos. AAA; nombres en español o `should …` según estándar del repo (auth usa `should`).

| Spec | Casos |
|---|---|
| `servicio-empresas.spec.ts` | GET listado OK |
| `servicio-estandares-minimos.spec.ts` | GET catálogo; query `ciclo_phva` |
| `servicio-autoevaluaciones.spec.ts` | crear, listar, detalle, calificar, finalizar; body correcto |
| `item-calificacion.component.spec.ts` | emite resultado; readonly no emite; clases de estado CUMPLE/NO_CUMPLE/NO_APLICA |
| `barra-avance-diagnostico.component.spec.ts` | 0/60, 60/60 |
| `grupo-phva.component.spec.ts` | renderiza ítems del ciclo |
| `cabecera-diagnostico.component.spec.ts` | título Res. 0312 / puntaje visible |
| `pagina-diagnostico.component.spec.ts` | carga; crea AE; califica; finalizar disabled/enabled; CONSULTA sin botones escritura |
| `pagina-historico-diagnostico.component.spec.ts` | lista y navegación |
| `pagina-detalle-diagnostico.component.spec.ts` | solo lectura tras finalizada |
| `app.routes.spec.ts` | rutas protegidas con `guardAutenticacion` |

Usar `provideHttpClientTesting` / `HttpTestingController` (Angular 17+).

#### Paso 10: Documentación técnica

- `src/app/features/diagnostico/README.md`: flujos, rutas, RBAC UI vs backend, responsive, endpoints, **enlace al mockup** y decisiones de port (qué se copió / qué se omitió).
- Actualizar `ARCHITECTURE.md` solo si lista features existentes (entrada breve a `diagnostico`).
- No inventar `api-spec.yml` en frontend salvo que el equipo lo pida; referenciar el del backend.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-189-frontend`
2. Paso 1 — modelos
3. Paso 2 — constante `ROLES_ESCRITURA_DIAGNOSTICO`
4. Paso 3 — servicios HTTP (+ specs TDD)
5. Paso 4 — tokens de diseño (fuentes / paleta mockup)
6. Paso 5 — componentes presentacionales alineados a `StandardsView` (+ specs)
7. Paso 6 — páginas / estado (+ specs)
8. Paso 7 — rutas y navegación
9. Paso 8 — errores / banners
10. Paso 9 — completar cobertura
11. Paso 10 — documentación (incl. referencia al mockup)

## 5. Checklist de pruebas

- [ ] `npm test` pasa con 0 fallos
- [ ] `npm run test:coverage` ≥ 90% en archivos nuevos de `features/diagnostico`
- [ ] Flujo manual: login → diagnóstico → seleccionar empresa → crear AE → calificar varios ítems → avance → finalizar → ver puntaje / alerta plan mejora
- [ ] Histórico por empresa → detalle solo lectura
- [ ] Viewport 360 px: acordeón PHVA usable; tarjetas legibles
- [ ] Paridad visual razonable vs mockup `StandardsView` (colores estado, botones ×3, tipografía, radios de borde)
- [ ] Rol `CONSULTA`: sin botones crear/calificar/finalizar; puede ver histórico/detalle
- [ ] Errores API muestran `mensaje`
- [ ] Tests existentes (auth, salud, rutas) siguen verdes
- [ ] `ng build` OK

## 6. Referencia de tooling

| Purpose | Command |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint:eslint` |
| Mockup (referencia) | clonar/abrir [`sst-audit-pro-mckp`](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) → `npm install` → `npm run dev` |

## 7. Formato de respuesta de error

```json
{
  "exito": false,
  "codigo": "AUTOEVALUACION_INCOMPLETA",
  "mensaje": "Descripción legible",
  "detalle": null
}
```

HTTP relevante: 401 `TOKEN_INVALIDO` · 403 `ACCESO_DENEGADO` · 404 `*_NO_ENCONTRADA` · 409 `AUTOEVALUACION_INCOMPLETA` | `AUTOEVALUACION_FINALIZADA` · 422 `ERROR_VALIDACION` · 500 `ERROR_INTERNO`

## 8. Dependencias

Ninguna dependencia npm nueva obligatoria. Usar Angular 17+ (standalone, signals, `inject`, `HttpClient`) y Tailwind ya configurado.

- Fuentes: Inter + JetBrains Mono (CDN en `styles.css`, como el mockup).
- Iconos: SVG/componentes locales (evitar portar `lucide-react`, `motion`, `recharts` del mockup).
- **No** introducir Angular Material solo para esta pantalla.
- Comparar UI contra el mockup en local mientras se implementa.

## 9. Notas

- Branch: `feature/SP-189-frontend` (side = frontend; nunca `-backend`).
- **Fuente de diseño:** [sst-audit-pro-mckp](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp) — «Mockup Repositorio Fuente» del ticket. Portar look & feel de `StandardsView`; no clonar el monolito React.
- Fuera de alcance del mockup en SP-189: Auditoría GTC 45, Gestor documental, Plan de mejora, Asistente AI, exportación PDF, gráficos Recharts, filtrado por perfil 7/21/62.
- Dependencia: API SP-188 debe estar levantada en local para pruebas manuales.
- Alta de empresas (`POST /empresas`) **fuera de alcance**; si no hay empresas, UI vacía con mensaje orientativo.
- `valor_porcentual` / `puntaje` / `puntaje_total` llegan como string decimal; formatear solo para display.
- Riesgo conocido (auth): tras F5, `guardAutenticacion` exige `usuarioActual` hidratado; si falla en rutas nuevas, mitigar en este ticket con espera a hidratación o `APP_INITIALIZER`/resolver mínimo (solo si se reproduce).
- `environment.prod.ts` sigue apuntando a localhost; no es alcance de SP-189, pero documentar el riesgo.
- Contar «8 endpoints» del ticket vs OpenAPI: el plan cubre las operaciones necesarias de empresas (GET list), estándares, autoevaluaciones (crear/listar/detalle/calificar/finalizar). `GET /empresas/{id}` y `POST /empresas` no son necesarios para la CA.

## 10. Checklist de verificación de implementación

- [ ] Código: lint/build OK, tipado estricto, OnPush
- [ ] Arquitectura: feature standalone + servicios tipados + presentacionales
- [ ] UI alineada al mockup `StandardsView` (paleta, tarjetas, botones ×3, tipografía)
- [ ] Matriz 60 ítems PHVA + persistencia PUT + avance + finalizar
- [ ] Histórico + detalle solo lectura
- [ ] Responsive ≥ 360 px
- [ ] Rol CONSULTA sin escritura en UI
- [ ] Tests verdes, cobertura ≥ 90% en feature
- [ ] Docs README del feature (con link al mockup)
- [ ] Branch: `feature/SP-189-frontend`
