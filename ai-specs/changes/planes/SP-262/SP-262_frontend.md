# Plan de implementación: SP-262 Crear grilla editable del plan de trabajo anual

## 1. Resumen

En la pantalla de SP-261, `/planes-mejora/:autoevaluacionId`, el texto «Meses:» pasa a ser una grilla de doce columnas, de Ene a Dic. Cada actividad es una fila, en el orden del API. Un escritor marca o desmarca meses, agrega una actividad y la quita. Todo persiste con el cronograma que ya publica SP-258. No hay endpoint nuevo.

La edición de responsable e indicador se mantiene. `CONSULTA` ve las marcas y no ve casillas, ni **Agregar**, ni **Quitar**. Sin plan, siguen los textos de SP-261 y no aparece la grilla. No se abre el plan, no se toca el borrador de acciones y el cliente no recalcula el umbral de 85.

Stack activo: `frontend-angular` (Angular 17.3, componentes standalone, OnPush, `@Input()` / `@Output()`).

**Precondición:** la ruta y `ServicioPlanMejora` están en `feature/SP-261-frontend`. `develop` local sigue en el merge del PR #21 y no tiene esa pantalla. La rama de esta historia sale de `feature/SP-261-frontend`.

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Justificación**: Confirma los 5 de Jira y del enriquecimiento. La grilla, el alta y la baja se apoyan en la página y en el API del cronograma que ya existen. Sin endpoint ni modelo de backend.
- **Subtareas**: ninguna. SP-262 es la tarea.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

- Stack activo: `frontend-angular` (Angular)
- Capas: solo presentación. El HTTP nuevo vive en `ServicioPlanMejora`. La grilla no llama al API.
- `environment.apiBaseUrl` es `http://localhost:8000/api/v1`. El interceptor pone el Bearer.
- `SolicitudActividadCronograma` ya tiene `descripcion`, `responsable`, `indicador` y `meses`. No hace falta otro modelo.
- `mensajeErrorHttp` y `codificarIdRuta` se siguen reutilizando.
- `*appSiTieneRol="['ADMINISTRADOR', 'AUDITOR_SST']"` cubre casillas, **Agregar** y **Quitar**.

Archivos nuevos:

- `src/app/features/planes-mejora/componentes/grilla-cronograma/grilla-cronograma.component.ts`
- `src/app/features/planes-mejora/componentes/grilla-cronograma/grilla-cronograma.component.html`
- `src/app/features/planes-mejora/componentes/grilla-cronograma/grilla-cronograma.component.css`
- `src/app/features/planes-mejora/componentes/grilla-cronograma/grilla-cronograma.component.spec.ts`

Archivos a modificar:

- `src/app/features/planes-mejora/servicios/servicio-plan-mejora.ts`
- `src/app/features/planes-mejora/servicios/servicio-plan-mejora.spec.ts`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.ts`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.html`
- `src/app/features/planes-mejora/paginas/pagina-plan-mejora/pagina-plan-mejora.component.spec.ts`
- `src/app/features/planes-mejora/README.md`

No se modifica el shell, el inicio, el diagnóstico, las rutas ni el backend.

### Mapeo de subtareas

No hay subtareas: el plan sale directamente de la tarea.

## 3. Pasos de implementación

### Paso 0: Crear la rama

- **Acción**: partir de `feature/SP-261-frontend`. `develop` no tiene la pantalla del plan.
- **Rama**: `feature/SP-262-frontend`

```bash
git checkout feature/SP-261-frontend
git checkout -b feature/SP-262-frontend
```

Crear la rama antes de `os-develop`. Ese comando, si la rama no existe, la saca de `develop` y pierde el cronograma.

### Paso 1: Servicio

En `servicio-plan-mejora.ts`, dos métodos. No capturan el error. Los ids pasan por `codificarIdRuta`.

- `agregarActividad(planId, solicitud): Observable<PlanMejora>` — `POST /planes-mejora/{plan_id}/actividades`. El cuerpo es `SolicitudActividadCronograma`. La respuesta es el plan completo.
- `quitarActividad(planId, actividadId): Observable<void>` — `DELETE /planes-mejora/{plan_id}/actividades/{actividad_id}`. Responde 204 sin cuerpo.

`actualizarActividad` no cambia: el cambio de mes lo reutiliza.

### Paso 2: Grilla

Componente standalone `GrillaCronogramaComponent`, selector `app-grilla-cronograma`, OnPush, `templateUrl` y `styleUrls`. Carpeta propia con los cuatro archivos.

API del componente, con decoradores. No usar `input()`, `output()` ni `model()`.

- `@Input() actividades: ActividadCronograma[]`, por defecto `[]`.
- `@Output() cambioMes`: emite la actividad y el número de mes (1 a 12) que el usuario marcó o desmarcó.
- `@Output() quitar`: emite el id de la actividad.

La plantilla:

- Un contenedor con `overflow-x-auto`. El shell no lleva ese desplazamiento.
- Doce columnas, en este orden: Ene, Feb, Mar, Abr, May, Jun, Jul, Ago, Sep, Oct, Nov, Dic. La celda de la posición `n` corresponde al entero `n`.
- Una fila por actividad, con `trackBy` del id, en el orden recibido. No ordenar filas ni meses en el cliente.
- Para un escritor, la celda es `input type="checkbox"` con `[checked]="actividad.meses.includes(mes)"`. No hay un borrador local de meses: la marca sale del arreglo que vino en la fila.
- `CONSULTA` ve la marca sin `input`. Así el spec que hoy exige cero `input` para ese rol sigue siendo válido en las celdas.
- **Quitar** va en la fila, dentro de `*appSiTieneRol="['ADMINISTRADOR', 'AUDITOR_SST']"`.

### Paso 3: Página

`PaginaPlanMejoraComponent` sigue siendo quien habla con el servicio.

- La grilla se muestra solo si `plan` no es null, también cuando `actividades` está vacío. Reemplaza el párrafo «Meses:».
- El texto «Este plan todavía no tiene actividades.» se mantiene. En ese caso el escritor igual ve **Agregar**.
- Flag falso o plan 404: no hay grilla, ni **Agregar**, ni **Quitar**. Los textos de SP-261 no cambian.
- **Agregar**, solo con plan y dentro de `*appSiTieneRol`, pide descripción, responsable, indicador y los meses marcados. El clic llama a `agregarActividad`. El 201 sustituye `plan` y vuelve a armar `edicion`. El formulario puede quedar vacío tras el éxito. Si el POST falla, el formulario no se borra y se muestra `mensaje`.
- No impedir el envío en el cliente cuando faltan meses o cuando el texto supera 150 o 200. Ese 422 lo muestra `mensajeErrorHttp`.
- Cambiar un mes arma la lista nueva a partir de `actividad.meses` (agrega el entero si no está, lo quita si está, sin duplicar) y llama a `actualizarActividad` con la `descripcion`, el `responsable` y el `indicador` ya guardados en la actividad, no con el borrador de los inputs. La respuesta sustituye el plan y `prepararEdicion` rearma los inputs. Un 422 deja el plan anterior y, con `markForCheck`, la casilla vuelve a `meses.includes(mes)`.
- **Guardar** de responsable e indicador sigue reenviando la descripción y una copia de los meses, como hoy.
- **Quitar** llama a `quitarActividad`. Si falla, la fila sigue. Si responde 204, llama a `obtenerPorAutoevaluacion` con el id de la ruta y pinta ese plan. No borrar la fila solo en memoria.
- Al cambiar el id de la ruta, cancelar alta, baja, guardado y cambio de mes, igual que ya se limpia la carga.
- `markForCheck` al pintar y al fallar.

### Paso 4: Pruebas

`servicio-plan-mejora.spec.ts`:

- El POST va a `/planes-mejora/{id}/actividades`, con el id codificado, el cuerpo igual a la solicitud, y devuelve el plan.
- El DELETE va a `/planes-mejora/{plan}/actividades/{actividad}`, con ambos ids codificados, y completa con 204.

`grilla-cronograma.component.spec.ts`:

- Meses `[12, 1]` marcan Ene y Dic, y no marcan Feb.
- El contenedor de la grilla tiene `overflow-x-auto`.
- Con rol `CONSULTA` no hay `input` de mes ni botón **Quitar**.
- El clic en una casilla emite la actividad y el mes. El clic en **Quitar** emite el id.

`pagina-plan-mejora.component.spec.ts`:

- El spec que hoy espera el texto `12, 1` pasa a comprobar las casillas de Ene y Dic. El orden de las filas se sigue afirmando por la descripción.
- Los inputs de responsable e indicador se buscan por `name` (`responsable-{id}`, `indicador-{id}`), no como el primer `input` del documento: las casillas también son `input`.
- Desmarcar Ene envía el PUT con la descripción, el responsable y el indicador originales, y `meses: [12]`. La grilla queda con la respuesta.
- Un 422 de ese PUT muestra `mensaje` y la marca anterior sigue.
- **Agregar** con un mes llama al POST y pinta el plan devuelto.
- Un 422 del POST muestra `mensaje` y no agrega la fila.
- **Quitar** llama al DELETE y después al GET. La fila que ya no viene no se muestra. Un DELETE fallido deja la fila.
- `CONSULTA` no ve casillas editables, ni **Agregar**, ni **Quitar**, ni **Guardar**.
- Sin plan no está `app-grilla-cronograma`.
- `npm test` sigue en verde. El umbral global de ramas se comprueba con `npm run test:coverage` y se mantiene en 90 % o más.

### Paso 5: Documentación

En `src/app/features/planes-mejora/README.md`, reemplazar la frase que dice que no se agregan ni se borran actividades. Documentar la grilla de Ene a Dic, el POST, el DELETE seguido de GET, y que `CONSULTA` solo ve las marcas.

No actualizar `api-spec.yml` ni `data-model.md`.

## 4. Orden de implementación

1. Paso 0 — rama `feature/SP-262-frontend` desde `feature/SP-261-frontend`
2. Paso 1 — `agregarActividad` y `quitarActividad`, con su spec
3. Paso 2 — `GrillaCronogramaComponent` y su spec
4. Paso 3 — la página usa la grilla, el alta, la baja y el cambio de mes
5. Paso 4 — ajustar el spec de la página que hoy lee «Meses:» y el primer `input`
6. Paso 5 — README
7. `npm test` y `npm run test:coverage`

## 5. Lista de verificación de pruebas

- [ ] `npm test` termina con 0 fallos
- [ ] `npm run test:coverage` mantiene ramas ≥ 90 %
- [ ] Marcar o desmarcar un mes guarda con PUT y, al recargar, la marca coincide
- [ ] **Agregar** y **Quitar** persisten con POST y DELETE
- [ ] `CONSULTA` ve la grilla y no ve controles de escritura
- [ ] Sin plan no hay grilla
- [ ] En un viewport estrecho se desplaza la grilla, no el shell
- [ ] Un 422 muestra `mensaje` y no mueve las marcas anteriores

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Build | `ng build` |
| Test | `npm test` |
| Run | `ng serve` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint:eslint` |

## 7. Formato de respuesta de error

No hay endpoint nuevo. El cuerpo sigue siendo `RespuestaError` (`exito`, `codigo`, `mensaje`, `detalle`). La página muestra `mensaje` con `mensajeErrorHttp`.

Códigos de esta historia:

- 201 del POST y 200 del PUT: el cuerpo es el plan completo y sustituye la grilla.
- 204 del DELETE: sin cuerpo. Después va el GET del plan.
- 422 `ACTIVIDAD_CRONOGRAMA_INVALIDA`: meses vacíos, fuera de 1 a 12, repetidos, o textos que el API rechaza (responsable de más de 150, indicador de más de 200). Se muestra `mensaje`.
- 404 `PLAN_MEJORA_NO_ENCONTRADO` en la carga: «Aún no hay plan de mejora para esta autoevaluación.»
- 403 `ACCESO_DENEGADO`: no debería verse, porque `CONSULTA` no tiene los controles.

## 8. Dependencias

Ninguna. No agregar Chart.js, Recharts ni otro paquete.

## 9. Notas

- Rama `feature/SP-262-frontend`. Nunca `-backend` en este repo.
- OnPush, `templateUrl` y `styleUrls`. `@Input()` y `@Output()` en la grilla.
- El cambio de mes reenvía la descripción, el responsable y el indicador ya persistidos. **Guardar** sigue siendo el camino de esos dos textos.
- La celda `n` es el entero `n`. El API guarda los meses ordenados; la casilla no depende de ese orden.
- El alta exige al menos un mes, pero esa regla la responde el API. El cliente no la duplica de un modo que oculte el 422.
- No hay alta del plan ni llamada a `/acciones/borrador`.

## 10. Lista de verificación de la implementación

- [ ] Compila y `npm run lint:eslint` pasa en los archivos tocados
- [ ] El POST y el DELETE están en `ServicioPlanMejora`; la grilla no usa `HttpClient`
- [ ] `npm test` en verde y cobertura de ramas ≥ 90 %
- [ ] README del feature actualizado; OpenAPI y el modelo de datos no cambian
- [ ] Rama `feature/SP-262-frontend`, creada desde `feature/SP-261-frontend`
