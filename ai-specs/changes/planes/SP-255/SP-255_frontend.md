# Plan de implementación: SP-255 Mostrar distribución de riesgos I-IV en el inicio

## 1. Resumen

En `/dashboard`, debajo de las cuatro tarjetas, se muestran siempre las barras de nivel I, II, III y IV. Los números salen de `distribucion_riesgos` en la misma respuesta que SP-254 ya pide con `ServicioResumenEjecutivo.obtener`. No hay un segundo `GET`. El cliente no llama a `ServicioCalculoRiesgoGtc45` ni interpreta ND, NE o NC.

El ancho es escala visual: `conteo / máximo de los cuatro`. Si el máximo es 0, el relleno es 0 %. Un nivel en 0 sigue visible, con el número 0. El semáforo copia la paleta de la matriz en el relleno de la barra: I rojo, II naranja, III ámbar, IV esmeralda. No se importa `claseInterpretacion`.

Sin empresa, o si el resumen falla, las cuatro barras muestran 0. `cantidad_autoevaluaciones` no las oculta.

Stack activo: `frontend-angular` (Angular 17.3, componentes standalone, OnPush, `@Input()` / `@Output()`).

**Precondición:** SP-254 está en la base. El modelo `DistribucionRiesgos` y el `GET` en `seleccionarEmpresa` ya existen. Si el PR #22 no está en `develop`, la rama sale de `feature/SP-254-frontend`.

## Estimación de puntos de historia

<!-- STORY_POINTS:3 -->
- **HU total**: 3 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 3 del enriquecimiento. Un componente de barras y el enlace al resumen ya cargado. Sin endpoint ni librería de gráficas.
- **Subtareas**: ninguna. SP-255 es la tarea.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas: solo presentación. Sin dominio, repositorio ni migración.

Archivos:

- Crear `src/app/features/dashboard/componentes/barras-distribucion-riesgos/barras-distribucion-riesgos.component.ts`
- Crear `src/app/features/dashboard/componentes/barras-distribucion-riesgos/barras-distribucion-riesgos.component.html`
- Crear `src/app/features/dashboard/componentes/barras-distribucion-riesgos/barras-distribucion-riesgos.component.css`
- Crear `src/app/features/dashboard/componentes/barras-distribucion-riesgos/barras-distribucion-riesgos.component.spec.ts`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.ts`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.html`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.spec.ts`
- Modificar `src/app/features/dashboard/README.md`

No se modifica `servicio-resumen-ejecutivo.ts` ni `resumen-ejecutivo.model.ts`. No se toca `claseInterpretacion` en la matriz. No entra SP-256.

### Mapeo de subtareas

No hay subtareas: el plan sale directamente de la tarea.

## 3. Pasos de implementación

### Paso 0: Crear la rama

- **Acción**: partir de `develop` si ya incluye SP-254. Si no, partir de `feature/SP-254-frontend`.
- **Rama**: `feature/SP-255-frontend`

```bash
git checkout develop && git pull origin develop
git checkout -b feature/SP-255-frontend
```

### Paso 1: Componente de barras

Carpeta `src/app/features/dashboard/componentes/barras-distribucion-riesgos/`.

- Standalone, OnPush, `templateUrl` y `styleUrls`.
- `@Input() distribucion: DistribucionRiesgos | null = null`. Sin `input()`.
- Orden fijo, no un `*ngFor` que filtre ceros:

| Clave | Etiqueta | Relleno |
|---|---|---|
| `I` | Nivel I | `bg-red-500` |
| `II` | Nivel II | `bg-orange-500` |
| `III` | Nivel III | `bg-amber-400` |
| `IV` | Nivel IV | `bg-emerald-500` |

- Si `distribucion` es `null`, los cuatro conteos son 0.
- `maximo` es el mayor de los cuatro. `ancho(conteo) = maximo > 0 ? (conteo / maximo) * 100 : 0`.
- Cada fila muestra la etiqueta y el número en texto.
- La pista es `h-2 overflow-hidden rounded-full`. El relleno es un `span` con `[style.width.%]` y la clase de color.
- `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax` igual al máximo, `aria-valuenow` igual al conteo, `aria-label` con el nivel y el número (por ejemplo `Nivel II: 0`).
- El patrón de pista y `role="progressbar"` es el de `grafico-cumplimiento-phva`. No se reutiliza ese componente: sus datos son fases PHVA.

### Paso 2: Enlazar el resumen ya cargado

En `PaginaDashboardComponent`:

- Campo `distribucionRiesgos: DistribucionRiesgos = { I: 0, II: 0, III: 0, IV: 0 }`.
- `restaurarTarjetasResumen` también deja ese objeto en ceros. Hoy se llama al vaciar la empresa y al fallar el GET.
- `aplicarResumen` copia `resumen.distribucion_riesgos` **antes** del `return` de `cantidad_autoevaluaciones === 0`. Ese `return` solo cambia la tarjeta de planes. Si la copia queda después, una empresa sin autoevaluación y con riesgos en la matriz pintaría ceros.

En la plantilla, entre el cierre del grid de tarjetas y el grid de accesos rápidos:

```html
<app-barras-distribucion-riesgos [distribucion]="distribucionRiesgos" />
```

Importar el componente en el `imports` del standalone. No agregar otra llamada a `obtener`.

### Paso 3: Specs

`barras-distribucion-riesgos.component.spec.ts` con `TestBed`:

- `{ I: 2, II: 0, III: 1, IV: 4 }` muestra los cuatro textos y los números 2, 0, 1 y 4. El nivel II está en el DOM.
- El relleno de IV mide 100 % y el de II mide 0 %.
- Los cuatro en 0, o `distribucion` `null`, dejan relleno 0 % y número 0.
- El `aria-label` de II dice el nivel y el 0.

En `pagina-dashboard.component.spec.ts`, el helper `resumen()` ya arma `distribucion_riesgos`. Ajustar un caso:

- Con `I: 2, II: 0, III: 1, IV: 4`, tras `seleccionarEmpresa('e-1')`, el texto del bloque muestra 2, 0, 1 y 4, y `obtenerResumen` se llamó una vez.
- `seleccionarEmpresa('')` y el 404 que ya existe dejan los cuatro conteos en 0.
- Un resumen con `cantidad_autoevaluaciones: 0` y `I: 3` muestra 3 en la barra I y «—» en Planes de mejora.

### Paso 4: Documentación

En `src/app/features/dashboard/README.md`, fuera del apartado «Alcance (SP-242)»:

- El inicio muestra las cuatro barras de `distribucion_riesgos`.
- No hay librería de gráficas. El GET es el de SP-254.

No actualizar `api-spec.yml` ni `data-model.md`.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-255-frontend`
2. Paso 1 — componente y su spec
3. Paso 2 — página
4. Paso 3 — specs de la página
5. Paso 4 — README
6. `npm test` y, si el umbral de ramas baja de 90 %, `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` termina con 0 fallos
- [ ] `npm run test:coverage` mantiene ramas ≥ 90 %
- [ ] Se ven I, II, III y IV, y un 0 no desaparece
- [ ] El relleno sigue al máximo de los cuatro conteos del API
- [ ] Cambiar de empresa actualiza las barras con un solo `GET`
- [ ] Sin empresa, con error, o con cero autoevaluaciones y riesgos en la matriz, las barras no se ocultan
- [ ] No hay Chart.js, Recharts ni `ServicioCalculoRiesgoGtc45`

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de respuesta de error

No hay endpoint nuevo. Un fallo del `GET` que ya usa SP-254 limpia las tarjetas y pone las cuatro barras en 0. El cuerpo sigue siendo `RespuestaError` (`exito`, `codigo`, `mensaje`, `detalle`). `mensajeErrorHttp` no cambia.

## 8. Dependencias

Ninguna. No agregar Chart.js, Recharts ni un SDK de R2.

## 9. Notas

- Rama `feature/SP-255-frontend`. Nunca `-backend` en este repo.
- `OnPush`, `templateUrl` y `styleUrls`. Sin `input()`, `output()` ni `model()`.
- `CONSULTA` ve las barras. No agregar `*appSiTieneRol`.
- `riesgos_nivel_i` y `riesgos_nivel_ii` no alimentan las barras. Se leen `I`, `II`, `III` y `IV`.
- La copia de `distribucion_riesgos` va antes del `return` de conteo 0 en `aplicarResumen`.
- SP-256 no entra en esta rama.

## 10. Lista de verificación de la implementación

- [ ] Compila y el lint del proyecto pasa
- [ ] El HTTP sigue en el servicio de SP-254; las barras solo reciben `@Input()`
- [ ] `npm test` en verde y cobertura de ramas ≥ 90 %
- [ ] README del dashboard actualizado; OpenAPI y el modelo de datos no cambian
- [ ] Rama `feature/SP-255-frontend`
