# Plan de implementación: SP-261 Crear pantalla de plan de mejora

## 1. Resumen

Nueva ruta `/planes-mejora/:autoevaluacionId` dentro del shell autenticado. Muestra el cronograma del plan de esa autoevaluación y deja editar el responsable y el indicador de cada actividad. No hay API nuevo.

Las acciones de esta historia son las filas de `actividades_cronograma` que ya publica SP-258: `descripcion`, `responsable`, `indicador` y `meses`. No es el borrador de `acciones_mejora` de SP-260. No se abre el plan, no se agregan ni se borran actividades, y el cliente no recalcula el umbral de 85.

`CONSULTA` abre la ruta y ve la lista. No ve campos ni botón de guardar. Los enlaces del inicio y del diagnóstico no llevan `*appSiTieneRol`.

Stack activo: `frontend-angular` (Angular 17.3, componentes standalone, OnPush, `@Input()` / `@Output()`).

**Precondición:** el inicio ya pinta la tarjeta «Planes de mejora» con el resumen (SP-254) y la alerta de irrenunciables (SP-256). `develop` todavía no tiene ese dashboard. La rama sale de `feature/SP-256-frontend`.

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 del enriquecimiento. Una ruta de lectura y edición sobre el API ya publicado, más dos enlaces. Sin endpoint ni modelo de backend.
- **Subtareas**: ninguna. SP-261 es la tarea.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas: solo presentación. El HTTP vive en servicios. La página no arma la URL a mano fuera del servicio.
- `environment.apiBaseUrl` es `http://localhost:8000/api/v1`. El interceptor pone el Bearer.
- `ServicioAutoevaluaciones.obtenerPorId` ya hace `GET /autoevaluaciones/{id}`. Se reutiliza. No duplicar ese GET.
- `mensajeErrorHttp` y `codificarIdRuta` ya existen en el feature de diagnóstico. Se reutilizan.
- `*appSiTieneRol="['ADMINISTRADOR', 'AUDITOR_SST']"` es el mismo criterio de escritura del resto de la app.

Archivos nuevos:

- `src/app/features/planes-mejora/modelos/plan-mejora.model.ts`
- `src/app/features/planes-mejora/servicios/servicio-plan-mejora.ts`
- `src/app/features/planes-mejora/servicios/servicio-plan-mejora.spec.ts`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.ts`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.html`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.css`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.spec.ts`
- `src/app/features/planes-mejora/README.md`

Archivos a modificar:

- `src/app/app.routes.ts`
- `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.ts`
- `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.html`
- `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.spec.ts`
- `src/app/features/dashboard/README.md`
- `src/app/features/diagnostico/componentes/panel-matriz-diagnostico/panel-matriz-diagnostico.component.ts`
- `src/app/features/diagnostico/componentes/panel-matriz-diagnostico/panel-matriz-diagnostico.component.html`
- `src/app/features/diagnostico/componentes/panel-matriz-diagnostico/panel-matriz-diagnostico.component.spec.ts`

No se modifica `TarjetaResumenComponent`, `ResultadoFinalizacionComponent`, la barra lateral ni el backend. No se llama a `/acciones/borrador`.

### Mapeo de subtareas

No hay subtareas: el plan sale directamente de la tarea.

## 3. Pasos de implementación

### Paso 0: Crear la rama

- **Acción**: partir de `feature/SP-256-frontend`. `develop` no tiene el dashboard del resumen.
- **Rama**: `feature/SP-261-frontend`

```bash
git checkout feature/SP-256-frontend
git checkout -b feature/SP-261-frontend
```

Crear la rama antes de `os-develop`. Ese comando, si la rama no existe, la saca de `develop` y pierde el inicio.

### Paso 1: Modelo

En `plan-mejora.model.ts`, interfaces con los nombres del API:

- `ActividadCronograma`: `id`, `descripcion`, `responsable`, `indicador`, `meses` (`number[]`).
- `PlanMejora`: `id`, `empresa_id`, `autoevaluacion_id`, `actividades`.
- `SolicitudActividadCronograma`: `descripcion`, `responsable`, `indicador`, `meses`.

Sin campos de `acciones_mejora` (`estandar_id`, `numeral`, `ciclo_phva`, `responsable_sugerido`).

### Paso 2: Servicio

`ServicioPlanMejora`, `providedIn: 'root'`, `inject(HttpClient)`:

- `obtenerPorAutoevaluacion(autoevaluacionId)` → `GET ${apiBaseUrl}/autoevaluaciones/${codificarIdRuta(id)}/plan-mejora`
- `actualizarActividad(planId, actividadId, solicitud)` → `PUT ${apiBaseUrl}/planes-mejora/${codificarIdRuta(planId)}/actividades/${codificarIdRuta(actividadId)}`

No captura el error. No envía `empresa_id` ni campos extra. El spec comprueba las dos URLs y el cuerpo del PUT.

### Paso 3: Ruta

En `app.routes.ts`, hija del shell, antes del comodín `**`:

```ts
{
  path: "planes-mejora/:autoevaluacionId",
  loadComponent: () =>
    import("./features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component").then(
      (modulo) => modulo.PaginaPlanMejoraComponent
    ),
}
```

El `guardAutenticacion` ya cubre el shell. No agregar `guardRoles`: `CONSULTA` entra.

### Paso 4: Página

`PaginaPlanMejoraComponent`: standalone, OnPush, `templateUrl`, `styleUrls`, selector `app-pagina-plan-mejora`. Sin `input()`, `output()` ni `model()`.

Al leer `paramMap`:

1. Cancelar la petición anterior.
2. `ServicioAutoevaluaciones.obtenerPorId`.
3. Si falla, `mensajeErrorHttp` y no mostrar el texto de «no exige plan».
4. Si `requiere_plan_mejora` es falso, texto «Esta autoevaluación no exige plan de mejora.» y no llamar a `obtenerPorAutoevaluacion`.
5. Si es verdadero, pedir el plan.
6. 404 del plan: «Aún no hay plan de mejora para esta autoevaluación.»
7. Plan con `actividades` vacío: «Este plan todavía no tiene actividades.» Sin botón de agregar.
8. Con filas, pintarlas en el orden del arreglo. No ordenar en el cliente.

Cada fila muestra `descripcion` y `meses` como texto. `ADMINISTRADOR` y `AUDITOR_SST` ven un campo de responsable, uno de indicador y un botón «Guardar», envueltos en `*appSiTieneRol="['ADMINISTRADOR', 'AUDITOR_SST']"`. `CONSULTA` ve responsable e indicador como texto.

El PUT reenvía la `descripcion` y los `meses` que vinieron, más el responsable y el indicador editados. La respuesta sustituye `plan` completo. El `id` de la actividad no se cambia en el cliente. Un 422 u otro error del PUT muestra `mensajeErrorHttp` y deja la lista anterior.

`markForCheck` al pintar, al fallar y al guardar. Limpiar el estado al cambiar de id para no dejar el plan de otra autoevaluación.

### Paso 5: Enlace del inicio

En `PaginaDashboardComponent`:

- `autoevaluacionPlanId: string | null = null`
- `restaurarTarjetasResumen` lo deja en `null`.
- En `aplicarResumen`, **antes** del `return` de `cantidad_autoevaluaciones === 0`: `this.autoevaluacionPlanId = resumen.autoevaluacion_id`.

No reutilizar `autoevaluacionAlertaId`. Ese id solo existe cuando hay un irrenunciable en `NO_CUMPLE`.

En la plantilla, solo la tarjeta «Planes de mejora» queda dentro de un enlace cuando hay id:

```html
<a *ngIf="autoevaluacionPlanId" [routerLink]="['/planes-mejora', autoevaluacionPlanId]">
  <app-tarjeta-resumen titulo="Planes de mejora" ... />
</a>
<app-tarjeta-resumen *ngIf="!autoevaluacionPlanId" titulo="Planes de mejora" ... />
```

Sin `*appSiTieneRol` en ese enlace. Las otras tarjetas no cambian.

### Paso 6: Enlace del diagnóstico

En `panel-matriz-diagnostico.component.html`, después de `app-resultado-finalizacion`:

```html
<a
  *ngIf="finalizada && autoevaluacion?.requiere_plan_mejora && autoevaluacion?.id"
  [routerLink]="['/planes-mejora', autoevaluacion.id]"
>
  Ver plan de mejora
</a>
```

Importar `RouterLink` en el componente. En borrador (`puntaje_total` null) o con `requiere_plan_mejora` falso, el enlace no está. `CONSULTA` lo ve.

### Paso 7: Pruebas

`pagina-plan-mejora.component.spec.ts`:

- `requiere_plan_mejora: false`: el texto de que no exige plan está y `obtenerPorAutoevaluacion` no se llama.
- Plan con dos actividades: el DOM muestra descripción, responsable, indicador y meses en ese orden.
- El guardar de un escritor envía descripción y meses originales y los textos nuevos, y reemplaza la lista con la respuesta.
- Con `establecerUsuario('CONSULTA')` no hay `input` ni botón «Guardar», y la lista sí está.
- 404 del plan con el flag verdadero: «Aún no hay plan de mejora para esta autoevaluación.» No aparece «no exige».
- `actividades: []`: «Este plan todavía no tiene actividades.» No hay botón de agregar.
- 404 de la autoevaluación: se ve `mensaje` y no el estado vacío del plan.
- 422 del PUT: se ve `mensaje` y la lista anterior sigue.

`pagina-dashboard.component.spec.ts`:

- Con `autoevaluacion_id` presente, `a[href="/planes-mejora/{id}"]` envuelve la tarjeta de planes. Con el id null, ese enlace no está.
- `CONSULTA` ve el enlace.
- Cambiar de empresa limpia el id anterior antes del GET nuevo.

`panel-matriz-diagnostico.component.spec.ts`:

- Finalizada y `requiere_plan_mejora` verdadero: `a[href="/planes-mejora/{id}"]`.
- Borrador, o finalizada con el flag falso: el enlace no está.

`npm test` es `jest --runInBand`. El umbral global de ramas sigue en 90 %.

### Paso 8: Documentación

`src/app/features/planes-mejora/README.md`: la ruta, los dos GET/PUT, los tres textos de vacío y que `CONSULTA` no edita.

En `src/app/features/dashboard/README.md`, una línea: la tarjeta «Planes de mejora» enlaza a `/planes-mejora/{autoevaluacion_id}` cuando el resumen trae id.

No actualizar `api-spec.yml` ni `data-model.md`.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-261-frontend` desde `feature/SP-256-frontend`
2. Paso 1 — modelo
3. Paso 2 — servicio y su spec
4. Paso 3 — ruta
5. Paso 4 — página
6. Paso 5 — enlace del inicio
7. Paso 6 — enlace del diagnóstico
8. Paso 7 — specs de página, inicio y diagnóstico
9. Paso 8 — README
10. `npm test` y, si el umbral de ramas baja de 90 %, `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` termina con 0 fallos
- [ ] `npm run test:coverage` mantiene ramas ≥ 90 %
- [ ] Con el flag falso no se pide el plan y el texto dice que no exige plan
- [ ] El escritor guarda responsable e indicador sin cambiar descripción ni meses
- [ ] `CONSULTA` ve la lista y no ve controles de escritura
- [ ] El 404 del plan no usa el texto de «no exige»
- [ ] El inicio enlaza solo con `autoevaluacion_id` del resumen
- [ ] El diagnóstico enlaza solo si está finalizado y el flag es verdadero

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de respuesta de error

No hay endpoint nuevo. El cuerpo sigue siendo `RespuestaError` (`exito`, `codigo`, `mensaje`, `detalle`). La página muestra `mensaje` con `mensajeErrorHttp`.

Códigos que esta pantalla distingue:

- 404 `AUTOEVALUACION_NO_ENCONTRADA`: error, no el estado vacío del plan.
- 404 `PLAN_MEJORA_NO_ENCONTRADO`, solo si `requiere_plan_mejora` es verdadero: «Aún no hay plan de mejora para esta autoevaluación.»
- 422 `ACTIVIDAD_CRONOGRAMA_INVALIDA`: se muestra `mensaje`. El cliente no tapa el 422 con un `maxlength`.
- 403 `ACCESO_DENEGADO`: no debería verse, porque `CONSULTA` no tiene el botón.

## 8. Dependencias

Ninguna. No agregar Chart.js, Recharts ni otro paquete.

## 9. Notas

- Rama `feature/SP-261-frontend`. Nunca `-backend` en este repo.
- `OnPush`, `templateUrl` y `styleUrls`. Sin `input()`, `output()` ni `model()`.
- `autoevaluacionPlanId` se asigna antes del `return` de conteo 0 en `aplicarResumen`.
- El id del enlace del inicio es `autoevaluacion_id` del resumen, no `autoevaluacionAlertaId`.
- El PUT siempre reenvía `descripcion` y `meses`. Esos campos se muestran y no se editan.
- La lista no se reordena. Los meses se muestran como llegan.
- No hay alta del plan ni alta o baja de actividades.

## 10. Lista de verificación de la implementación

- [ ] Compila y el lint del proyecto pasa
- [ ] El HTTP del plan está en `ServicioPlanMejora`; el de la autoevaluación reutiliza `ServicioAutoevaluaciones`
- [ ] `npm test` en verde y cobertura de ramas ≥ 90 %
- [ ] README del feature y del dashboard actualizados; OpenAPI y el modelo de datos no cambian
- [ ] Rama `feature/SP-261-frontend`
