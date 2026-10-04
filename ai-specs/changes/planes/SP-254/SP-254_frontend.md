# Plan de implementación: SP-254 Reemplazar placeholders del inicio con datos reales

## 1. Resumen

En `/dashboard`, las tarjetas **Autoevaluaciones** y **Planes de mejora** dejan el guion fijo y muestran el resumen ejecutivo de la empresa seleccionada. El conteo y el flag salen de `GET /api/v1/empresas/{empresa_id}/resumen-ejecutivo` (SP-253). El cliente no recalcula la Resolución 0312 ni decide si hace falta plan de mejora.

Esta tarea solo pinta `cantidad_autoevaluaciones` y `requiere_plan_mejora`. El modelo tipa el 200 completo para que SP-255 (barras I–IV) y SP-256 (alerta de irrenunciables) reutilicen la misma respuesta. Esas pantallas no se construyen aquí.

La tarjeta Puntaje 0312 sigue en cumplimiento PHVA. Sesión actual sigue en la sesión. La actividad reciente y el botón «Actualizar resumen» siguen en `ServicioResumenHome`.

Stack activo: `frontend-angular` (Angular 17.3, componentes standalone, OnPush, `@Input()` / `@Output()`).

## Estimación de puntos de historia

<!-- STORY_POINTS:3 -->
- **HU total**: 3 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 3 del enriquecimiento. Un GET ya existente, dos tarjetas y sus specs. No hay pantalla de planes, ni barras, ni alerta.
- **Subtareas**: ninguna. SP-254 es la tarea.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas: solo presentación. Sin dominio, repositorio ni migración.

Archivos:

- Crear `src/app/features/dashboard/modelos/resumen-ejecutivo.model.ts`
- Crear `src/app/features/dashboard/servicios/servicio-resumen-ejecutivo.ts`
- Crear `src/app/features/dashboard/servicios/servicio-resumen-ejecutivo.spec.ts`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.ts`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.html`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.spec.ts`
- Modificar `src/app/features/dashboard/README.md`

No se toca `tarjeta-resumen` (ya recibe `valor` y `subtitulo`). No se modifica `servicio-resumen-home.ts`. No hay cambio en `api-spec.yml` ni en `data-model.md`: el contrato vive en el backend.

### Mapeo de subtareas

No hay subtareas: el plan sale directamente de la tarea.

## 3. Pasos de implementación

### Paso 0: Crear la rama

- **Acción**: partir de `develop` actualizado.
- **Rama**: `feature/SP-254-frontend`

```bash
git checkout develop && git pull origin develop
git checkout -b feature/SP-254-frontend
```

### Paso 1: Modelo del 200

Archivo: `src/app/features/dashboard/modelos/resumen-ejecutivo.model.ts`

Interfaces, sin clase:

- `DistribucionRiesgos`: `I`, `II`, `III`, `IV` como `number`
- `IrrenunciableResumen`: `numeral`, `descripcion`, `resultado` con unión `CUMPLE | NO_CUMPLE | NO_APLICA | SIN_CALIFICAR`
- `ResumenEjecutivo`: `empresa_id`, `cantidad_autoevaluaciones`, `autoevaluacion_id` (`string | null`), `requiere_plan_mejora`, `riesgos_nivel_i`, `riesgos_nivel_ii`, `distribucion_riesgos`, `irrenunciables`

Los nombres coinciden con el JSON. No renombrar `I`–`IV`.

### Paso 2: Servicio HTTP

Archivo: `src/app/features/dashboard/servicios/servicio-resumen-ejecutivo.ts`

- `providedIn: 'root'`
- `HttpClient` y `environment.apiBaseUrl` por `inject`
- `obtener(empresaId: string): Observable<ResumenEjecutivo>`
- URL: `` `${baseUrl}/empresas/${encodeURIComponent(empresaId)}/resumen-ejecutivo` ``
- El servicio no captura errores. El interceptor sigue enviando el Bearer.

Spec `servicio-resumen-ejecutivo.spec.ts`, igual que `ServicioCumplimientoPhva`:

- `HttpClientTestingModule` y `HttpTestingController`
- GET a la URL con un id que necesite codificación
- el cuerpo flusheado coincide con `ResumenEjecutivo`
- `http.verify()` en `afterEach`

### Paso 3: Estado de las dos tarjetas

En `PaginaDashboardComponent`, campos iniciales:

- `valorAutoevaluaciones: string | number = '—'`
- `subtituloAutoevaluaciones = 'Histórico de evaluaciones de la empresa'`
- `valorPlanes: string | number = '—'`
- `subtituloPlanes = 'Acciones derivadas de los resultados'`

Esos subtítulos son los textos iniciales. Autoevaluaciones no cambia el subtítulo en esta tarea.

Inyectar `ServicioResumenEjecutivo`. Guardar la suscripción aparte de `suscripcionHistorico` y cancelarla al pedir otra empresa y en `ngOnDestroy` (entra en `suscripciones`).

`seleccionarEmpresa` sigue eligiendo la autoevaluación más reciente para el panel PHVA. Además:

1. Cancela el GET de resumen anterior.
2. Restaura las dos tarjetas al guion y los subtítulos iniciales.
3. Si `empresaId` está vacío, no llama al servicio y sale.
4. Si hay id, llama `obtener(empresaId)`.

Al responder:

- Si `resumen.empresa_id !== this.empresaSeleccionadaId`, no pintar.
- Si `cantidad_autoevaluaciones === 0`: valor de autoevaluaciones `0`, planes «—», subtítulo de planes «Aún no hay autoevaluación».
- Si el conteo es mayor que 0: valor de autoevaluaciones es el número; planes «Sí» o «No» según `requiere_plan_mejora`; subtítulo de planes «Acciones derivadas de los resultados».
- `markForCheck()`.

Al fallar, y solo si la empresa pedida sigue siendo la seleccionada:

- Tarjetas y subtítulos otra vez en el estado inicial.
- `mensajeErrorSelector = mensajeErrorHttp(error)`.
- `markForCheck()`.

`cargarEmpresas` ya llama `seleccionarEmpresa` con la primera empresa. No hace falta un segundo disparador. `actualizarResumen` no llama a este servicio.

En la plantilla, las dos `app-tarjeta-resumen` dejan el `valor="—"` fijo y enlazan `[valor]` y `[subtitulo]`. Puntaje 0312 y Sesión actual no cambian.

### Paso 4: Specs de la página

En `pagina-dashboard.component.spec.ts`, proveer `ServicioResumenEjecutivo` con `obtener: jest.fn()`, igual que `listarPorEmpresa`. Por defecto `of` de un resumen con conteo 0, para que la carga inicial no falle. Los tests que necesitan datos arman el `of` antes de `seleccionarEmpresa` o antes de volver a `crearComponente`.

Casos:

- Conteo 2 y `requiere_plan_mejora: true` → el texto muestra `2` y `Sí`.
- Conteo mayor que 0 y flag falso → `No`, y el subtítulo de planes sigue siendo «Acciones derivadas de los resultados».
- Conteo 0 → autoevaluaciones `0`, planes «—», subtítulo «Aún no hay autoevaluación».
- `seleccionarEmpresa('')` no llama `obtener` y las dos tarjetas quedan en «—».
- Cambiar de empresa dispara un segundo `obtener`. Un `Subject` de la primera empresa que emite después no pisa los datos de la segunda (`empresa_id` distinto).
- `throwError` con `HttpErrorResponse` 404 y `error.mensaje` limpia las tarjetas y deja ese mensaje en `mensajeErrorSelector`.
- `actualizarResumen` (el test de loader que ya existe) no incrementa las llamadas a `obtener` cuando no hay empresa. Con empresa, el botón tampoco vuelve a llamar `obtener`.
- La actividad sigue mostrando «Inicio de sesión en SST-Audit Pro» sin un GET de resumen por esa vía.
- Puntaje 0312 sigue saliendo de `alCargarCumplimiento`. No leer `requiere_plan_mejora` del resumen para esa tarjeta.

### Paso 5: Documentación

En `src/app/features/dashboard/README.md`:

- Sumar el modelo y `servicio-resumen-ejecutivo.ts` al árbol.
- En el alcance, decir que Autoevaluaciones y Planes de mejora leen el resumen ejecutivo. Puntaje 0312 sigue en PHVA. La actividad reciente sigue en mock.

No actualizar `ai-specs/specs/api-spec.yml` ni `data-model.md`.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-254-frontend`
2. Paso 1 — modelo
3. Paso 2 — servicio y su spec
4. Paso 3 — página
5. Paso 4 — specs de la página
6. Paso 5 — README
7. `npm test` y, si el umbral de ramas baja de 90 %, `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` termina con 0 fallos
- [ ] `npm run test:coverage` mantiene ramas ≥ 90 %
- [ ] Con empresa y conteo mayor que 0, las dos tarjetas muestran número y «Sí» o «No»
- [ ] Conteo 0 explica que aún no hay autoevaluación
- [ ] Cambiar de empresa actualiza las tarjetas y descarta una respuesta vieja
- [ ] 404 limpia las tarjetas y muestra el mensaje del API
- [ ] Actividad reciente, Puntaje 0312 y «Actualizar resumen» siguen como están

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de respuesta de error

El API ya responde así. Esta tarea no crea códigos nuevos.

```json
{
  "exito": false,
  "codigo": "EMPRESA_NO_ENCONTRADA",
  "mensaje": "No se encontró la empresa.",
  "detalle": null
}
```

`mensajeErrorHttp` lee `mensaje`. 401 `TOKEN_INVALIDO` lo resuelve el interceptor. El servicio no traduce el error.

## 8. Dependencias

Ninguna. No agregar Chart.js, Recharts ni un SDK de R2. El navegador no habla con el bucket.

## 9. Notas

- Rama `feature/SP-254-frontend`. Nunca `-backend` en este repo.
- `OnPush`, `templateUrl` y `styleUrls`. Sin `input()`, `output()` ni `model()`.
- `CONSULTA` ve las tarjetas. No agregar `*appSiTieneRol` ahí.
- Si `cantidad_autoevaluaciones` es 0, el API igual manda `requiere_plan_mejora`. La UI no lo muestra como Sí/No.
- Una respuesta solo pinta si `empresa_id` es el de `empresaSeleccionadaId`.
- SP-255 y SP-256 no entran en esta rama.

## 10. Lista de verificación de la implementación

- [ ] Compila y el lint del proyecto pasa
- [ ] Sigue el stack Angular: servicio para el HTTP, página para el estado, `@Input()` en la tarjeta
- [ ] `npm test` en verde y cobertura de ramas ≥ 90 %
- [ ] README del dashboard actualizado; OpenAPI y el modelo de datos no cambian
- [ ] Rama `feature/SP-254-frontend`
