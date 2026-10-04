# Plan de implementación: SP-256 Alertar incumplimientos de responsable SST y afiliación

## 1. Resumen

En `/dashboard`, si la última autoevaluación deja en `NO_CUMPLE` el estándar 1.1.1 o el 1.1.4, el inicio muestra una alerta prioritaria y un enlace al detalle. Los datos salen de `irrenunciables` y `autoevaluacion_id` en la misma respuesta que ya pide `ServicioResumenEjecutivo.obtener`. No hay un segundo `GET`. El cliente no recalifica.

`app-alerta` no proyecta contenido. La alerta es `tipo="error"`, título «Estándares irrenunciables sin cumplir», y el `mensaje` junta cada ítem en `NO_CUMPLE` con su `numeral` y su `descripcion`. Al lado, un enlace «Ver en el diagnóstico» con `routerLink` `['/diagnostico', id]`.

La alerta solo existe si `autoevaluacion_id` tiene valor y hay al menos un `NO_CUMPLE`. `CUMPLE`, `NO_APLICA` y `SIN_CALIFICAR` no la disparan. Sin empresa, con error, o con `autoevaluacion_id` null, no se muestra. `CONSULTA` la ve. No hay botón de calificar ni `*appSiTieneRol` sobre este bloque.

Stack activo: `frontend-angular` (Angular 17.3, componentes standalone, OnPush, `@Input()` / `@Output()`).

**Precondición:** la base ya incluye el `GET` del resumen (SP-254). Si SP-255 no está en `develop`, la rama sale de `feature/SP-255-frontend` para no perder las barras.

## Estimación de puntos de historia

<!-- STORY_POINTS:2 -->
- **HU total**: 2 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 2 del enriquecimiento. Una alerta y un enlace sobre el resumen ya cargado. Sin endpoint ni cambio del componente compartido.
- **Subtareas**: ninguna. SP-256 es la tarea.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas: solo presentación. Sin dominio, repositorio ni migración.

Archivos:

- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.ts`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.html`
- Modificar `src/app/features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component.spec.ts`
- Modificar `src/app/features/dashboard/README.md`

No se modifica `AlertaComponent`, `servicio-resumen-ejecutivo.ts` ni `resumen-ejecutivo.model.ts`. `IrrenunciableResumen` ya existe. No se tocan las barras de SP-255 ni la matriz.

### Mapeo de subtareas

No hay subtareas: el plan sale directamente de la tarea.

## 3. Pasos de implementación

### Paso 0: Crear la rama

- **Acción**: partir de `develop` si ya incluye SP-254 y SP-255. Si no, partir de `feature/SP-255-frontend`.
- **Rama**: `feature/SP-256-frontend`

```bash
git checkout develop && git pull origin develop
git checkout -b feature/SP-256-frontend
```

### Paso 1: Estado de la alerta

En `PaginaDashboardComponent`:

- `irrenunciablesIncumplidos: IrrenunciableResumen[] = []`
- `autoevaluacionAlertaId: string | null = null`
- Getter `mensajeIrrenunciables`: los ítems unidos por `. `, cada uno como `` `${numeral} ${descripcion}` ``.

`restaurarTarjetasResumen` también vacía la lista y deja `autoevaluacionAlertaId` en `null`. Ese método ya corre al vaciar la empresa y al fallar el GET.

En `aplicarResumen`, **antes** del `return` de `cantidad_autoevaluaciones === 0`:

- Si `resumen.autoevaluacion_id` es null, la lista queda vacía y el id de alerta queda en null.
- Si tiene valor, la lista es `resumen.irrenunciables` filtrado por `resultado === 'NO_CUMPLE'`.
- `autoevaluacionAlertaId` es ese id solo cuando la lista no está vacía.

El `return` de conteo 0 sigue reservado a la tarjeta de planes. Si el filtro queda después, una respuesta con id y `NO_CUMPLE` no pintaría la alerta.

No leer `requiere_plan_mejora` ni el umbral del 85 % para esta decisión.

### Paso 2: Plantilla

Después de la alerta informativa «Alcance actual» y antes del grid de tarjetas:

```html
<div *ngIf="irrenunciablesIncumplidos.length > 0 && autoevaluacionAlertaId" class="space-y-3">
  <app-alerta
    tipo="error"
    titulo="Estándares irrenunciables sin cumplir"
    [mensaje]="mensajeIrrenunciables"
  />
  <a [routerLink]="['/diagnostico', autoevaluacionAlertaId]">Ver en el diagnóstico</a>
</div>
```

`RouterLink` ya está en los `imports` de la página. No envolver el bloque con `*appSiTieneRol`. No agregar un botón de calificar. La alerta de error del selector, más abajo, no cambia.

### Paso 3: Specs

En `pagina-dashboard.component.spec.ts`, el helper `resumen()` ya arma dos irrenunciables en `SIN_CALIFICAR`. Localizar la alerta por el título «Estándares irrenunciables sin cumplir», no por cualquier `app-alerta`: la de alcance siempre está.

Casos:

- 1.1.1 en `NO_CUMPLE`, 1.1.4 en `CUMPLE`, `autoevaluacion_id: 'ae-9'`: el texto muestra el numeral y la descripción, y existe `a[href="/diagnostico/ae-9"]`. `obtenerResumen` se llamó una vez.
- Los dos en `NO_CUMPLE`: el mensaje contiene 1.1.1 y 1.1.4.
- Ambos en `CUMPLE`, o uno en `NO_APLICA` y otro en `SIN_CALIFICAR`: no está el título de la alerta de irrenunciables.
- `autoevaluacion_id: null` con un `NO_CUMPLE` en el cuerpo: la alerta no está.
- `seleccionarEmpresa('')` y el 404 que ya existe dejan la alerta fuera, aunque antes hubiera un incumplimiento.
- Con `establecerUsuario('CONSULTA')`, la alerta y el enlace se ven, y el texto no contiene un control «Calificar». El botón «Nueva autoevaluación» sigue oculto para ese rol.

### Paso 4: Documentación

En `src/app/features/dashboard/README.md`, un apartado SP-256 junto al de las barras:

- El inicio alerta 1.1.1 y 1.1.4 cuando el resumen los trae en `NO_CUMPLE`.
- El enlace abre `/diagnostico/{autoevaluacion_id}`. No hay acción de calificar en el inicio.

No actualizar `api-spec.yml` ni `data-model.md`.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-256-frontend`
2. Paso 1 — estado en la página
3. Paso 2 — plantilla
4. Paso 3 — specs
5. Paso 4 — README
6. `npm test` y, si el umbral de ramas baja de 90 %, `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` termina con 0 fallos
- [ ] `npm run test:coverage` mantiene ramas ≥ 90 %
- [ ] `NO_CUMPLE` en 1.1.1 o 1.1.4 muestra alerta y enlace al detalle
- [ ] Los otros resultados, el id null, la empresa vacía y el 404 no muestran la alerta
- [ ] `CONSULTA` ve la alerta y no ve un control de calificar
- [ ] Sigue habiendo un solo `GET` de resumen por empresa

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |

## 7. Formato de respuesta de error

No hay endpoint nuevo. Un fallo del `GET` que ya usa el inicio limpia las tarjetas, las barras y esta alerta. El cuerpo sigue siendo `RespuestaError` (`exito`, `codigo`, `mensaje`, `detalle`). La alerta de irrenunciables no sustituye la del selector.

## 8. Dependencias

Ninguna. No agregar librerías. No cambiar `AlertaComponent`.

## 9. Notas

- Rama `feature/SP-256-frontend`. Nunca `-backend` en este repo.
- `OnPush`, `templateUrl` y `styleUrls`. Sin `input()`, `output()` ni `model()`.
- El filtro de `NO_CUMPLE` va antes del `return` de conteo 0 en `aplicarResumen`.
- El id del enlace es `autoevaluacion_id` del resumen, no `autoevaluacionId` del histórico PHVA.
- `tipo="error"` deja la alerta con `role="alert"`.
- Las tarjetas, las barras I–IV y la actividad reciente no cambian de fuente.

## 10. Lista de verificación de la implementación

- [ ] Compila y el lint del proyecto pasa
- [ ] El HTTP sigue en el servicio del resumen; la página solo filtra `NO_CUMPLE`
- [ ] `npm test` en verde y cobertura de ramas ≥ 90 %
- [ ] README del dashboard actualizado; OpenAPI y el modelo de datos no cambian
- [ ] Rama `feature/SP-256-frontend`
