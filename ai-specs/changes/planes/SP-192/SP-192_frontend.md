# Plan de implementación: SP-192 Crear planilla interactiva editable en Angular

## 1. Resumen

Implementar la pantalla `/matriz-riesgos` para consultar y editar la matriz de
peligros y riesgos GTC 45 de una empresa. El frontend consumirá la API entregada
por SP-145/SP-191 y representará la jerarquía:

`empresa → procesos/actividades → peligros → evaluación → controles`.

La solución será una feature Angular standalone con componentes contenedor y
presentacionales, servicios HTTP tipados y formularios reutilizables. Debe usar
los componentes compartidos de SP-239/SP-240/SP-241 (`Boton`, `Alerta`,
`Modal`, `Tooltip`, `FormularioDinamico`, `ServicioLoader`) y respetar
`ChangeDetectionStrategy.OnPush`.

El backend es la única fuente de verdad para `NP`, `NR`, interpretación y
aceptabilidad. El frontend solo enviará `ND`, `NE` y `NC` y mostrará los campos
derivados devueltos por la API.

- **Stack activo**: `frontend-angular` (Angular 17.3 standalone, TypeScript
  estricto, Tailwind, Jest, Angular CDK).
- **Backend requerido**: API SP-145 disponible en
  `environment.apiBaseUrl`, con autenticación Bearer gestionada por
  `interceptorAutenticacion`.
- **Tipo de ticket**: subtarea de SP-145; no tiene subtareas propias.

## Estimación de puntos de historia

<!-- STORY_POINTS:5 -->
- **HU total**: 5 (Fibonacci: 1, 2, 3, 5, 8, 13).
- **Justificación**: se confirma la estimación registrada en Jira. La API y los
  componentes compartidos ya existen; el trabajo se concentra en integración
  HTTP, formularios jerárquicos, RBAC visual, responsive y pruebas. La
  estimación presupone edición mediante paneles/acordeones y modales, no una
  grilla tipo Excel ni edición offline.
- **Subtareas**: ninguna; SP-192 es una subtarea de SP-145.
<!-- /STORY_POINTS -->

## 2. Contexto de arquitectura

### Capas y archivos

| Área | Archivos |
|---|---|
| Modelos | `src/app/features/matriz-riesgos/modelos/*.ts` |
| Servicios HTTP | `src/app/features/matriz-riesgos/servicios/servicio-matriz-riesgos.ts`, `servicio-empresas-matriz.ts` |
| Página contenedora | `src/app/features/matriz-riesgos/paginas/pagina-matriz-riesgos/` |
| Componentes presentacionales | `src/app/features/matriz-riesgos/componentes/proceso-matriz/`, `peligro-matriz/`, `evaluacion-riesgo/`, `lista-controles/` |
| Navegación | `src/app/app.routes.ts`, `src/app/layout/componentes/barra-lateral/` |
| Documentación | `src/app/features/matriz-riesgos/README.md` |

### Reglas arquitectónicas

- Todos los componentes son standalone, OnPush y tienen `.ts`, `.html`,
  `.css` y `.spec.ts` colocados en su propia carpeta.
- La página contenedora coordina estado, servicio HTTP, loader y modales.
- Los componentes presentacionales reciben datos por `@Input()` y emiten
  intención por `@Output()`; no llaman `HttpClient`.
- No usar Signal inputs/outputs: están bloqueados por Angular 17.3 +
  `jest-preset-angular` en este repositorio. Sí se pueden usar signals internos
  si no forman parte de la API pública del componente.
- El interceptor existente añade Bearer y gestiona refresh; los servicios de
  la feature no duplican esa lógica.
- El rol `CONSULTA` puede leer, pero no ve acciones de mutación. Los roles
  escritores son `ADMINISTRADOR` y `AUDITOR_SST`, coherentes con el backend,
  que rechaza únicamente `CONSULTA`.

### Mapeo de subtareas

No hay subtareas hijas; el plan deriva directamente de SP-192.

## 3. Pasos de implementación

### Paso 0: Preparar la rama

- Actualizar `develop`, que ya contiene SP-239, SP-240, SP-241 y SP-242.
- Crear la rama frontend:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/SP-192-frontend
npm install
```

- No incluir archivos temporales de `.openspec-cli/`, `.env`, `node_modules/`
  ni archivos `.code-workspace` ajenos al ticket.
- Verificar que `npm test` y `npm run build` pasan antes de modificar código.

### Paso 1: Definir modelos y contratos TypeScript

Crear `src/app/features/matriz-riesgos/modelos/`:

- `empresa-matriz.model.ts`
  - `EmpresaMatriz`: `id`, `razon_social`, `nit`.
- `proceso-actividad.model.ts`
  - `ProcesoActividad`, `CrearProcesoActividad`,
    `ActualizarProcesoActividad`.
- `peligro.model.ts`
  - `Peligro`, `CrearPeligro`, `ActualizarPeligro`.
  - `ClasificacionPeligro` como unión literal:
    `BIOLOGICO | FISICO | QUIMICO | PSICOSOCIAL | BIOMECANICO |
    CONDICIONES_SEGURIDAD | FENOMENOS_NATURALES`.
- `evaluacion-riesgo.model.ts`
  - `EvaluacionRiesgo`.
  - `UpsertEvaluacionRiesgo` con **únicamente**
    `nivel_deficiencia`, `nivel_exposicion`, `nivel_consecuencia`.
  - Uniones literales para `InterpretacionNR` y `AceptabilidadRiesgo`.
- `control-riesgo.model.ts`
  - `ControlRiesgo`, `CrearControlRiesgo`, `ActualizarControlRiesgo`.
  - `TipoControl`: `ELIMINACION | SUSTITUCION | INGENIERIA |
    ADMINISTRATIVO | EPP`.
- `matriz-riesgos.model.ts`
  - `RespuestaMatrizRiesgos`, `ProcesoMatriz`, `PeligroMatriz`.
- `respuesta-error.model.ts`
  - Reutilizar un tipo global si ya existe; de lo contrario definir
    `codigo`, `mensaje`, `detalle`.
- `index.ts`
  - Barrel interno de la feature.

Los nombres y nullability deben copiar el OpenAPI del backend. No modelar
campos derivados dentro del DTO de escritura.

### Paso 2: Implementar servicios HTTP de la feature

Crear
`src/app/features/matriz-riesgos/servicios/servicio-empresas-matriz.ts`:

- `listar(): Observable<EmpresaMatriz[]>`
- `GET ${environment.apiBaseUrl}/empresas`

Crear
`src/app/features/matriz-riesgos/servicios/servicio-matriz-riesgos.ts`:

- `obtenerMatriz(empresaId)`
- `crearProceso(empresaId, solicitud)`
- `actualizarProceso(procesoId, solicitud)`
- `eliminarProceso(procesoId)`
- `crearPeligro(procesoId, solicitud)`
- `actualizarPeligro(peligroId, solicitud)`
- `eliminarPeligro(peligroId)`
- `guardarEvaluacion(peligroId, solicitud)` — PUT upsert
- `crearControl(evaluacionId, solicitud)`
- `actualizarControl(controlId, solicitud)`
- `eliminarControl(controlId)`

Reglas:

- Codificar identificadores de ruta con `encodeURIComponent`.
- Tipar `DELETE` como `Observable<void>`.
- No añadir manualmente `Authorization`.
- No capturar cada `HttpErrorResponse` en el servicio; propagarlo al
  contenedor, siguiendo el estándar del interceptor.
- Después de una mutación, el contenedor recarga la matriz agregada. Esta
  primera versión prioriza consistencia frente a actualizaciones optimistas.

### Paso 3: Crear formularios reutilizables de la feature

Crear componentes presentacionales:

1. `formulario-proceso`
   - Campos: nombre requerido (máx. 150), rutinaria, zona/lugar (máx. 150).
   - Modo crear/editar según `@Input() proceso`.
2. `formulario-peligro`
   - Clasificación requerida, descripción requerida, efectos posibles.
3. `formulario-evaluacion`
   - Selectores discretos:
     - ND: 10, 6, 2, 0
     - NE: 4, 3, 2, 1
     - NC: 100, 60, 25, 10
   - Si existe evaluación, precargar ND/NE/NC.
   - Mostrar NP, NR, interpretación y aceptabilidad en bloque de solo lectura.
   - El evento emitido contiene exclusivamente ND/NE/NC.
4. `formulario-control`
   - Tipo y descripción requeridos.
   - Mostrar `AlertaComponent` no bloqueante si el control es EPP y no hay
     otros controles.

Usar `FormularioDinamicoComponent` cuando su contrato cubra el caso sin perder
tipado. Para el formulario de evaluación se permite `ReactiveFormsModule`
tipado directamente, porque exige valores numéricos discretos y un bloque de
resultados derivado.

### Paso 4: Crear la representación jerárquica responsive

Crear:

- `componentes/proceso-matriz/proceso-matriz.component.*`
- `componentes/peligro-matriz/peligro-matriz.component.*`
- `componentes/evaluacion-riesgo/evaluacion-riesgo.component.*`
- `componentes/lista-controles/lista-controles.component.*`

Responsabilidades:

- `ProcesoMatrizComponent`: acordeón por proceso, acciones agregar peligro,
  editar y eliminar.
- `PeligroMatrizComponent`: datos del peligro, evaluación asociada y
  controles; acciones según rol.
- `EvaluacionRiesgoComponent`: muestra ND/NE/NC y derivados con énfasis visual
  por interpretación, sin recalcular valores.
- `ListaControlesComponent`: lista ordenada por jerarquía de control, aviso
  cuando solo existe EPP y acciones CRUD.

Responsive:

- ≥ `md`: columnas compactas dentro del acordeón.
- < `md`: tarjetas apiladas con etiquetas visibles; no depender de scroll
  horizontal para comprender datos.
- Mantener nombre accesible en todos los botones de icono.
- Usar `trackBy` estable por `id`.

### Paso 5: Crear la página contenedora

Crear
`paginas/pagina-matriz-riesgos/pagina-matriz-riesgos.component.*`.

Estado:

- lista de empresas;
- empresa seleccionada;
- matriz actual;
- carga inicial/refresco;
- error visible;
- acción/modal activo.

Flujo:

1. Al iniciar, obtener empresas.
2. Si hay empresas, no seleccionar silenciosamente una distinta de la elección
   del usuario; se puede preseleccionar la única empresa disponible.
3. Al seleccionar empresa, ejecutar `obtenerMatriz`.
4. Mostrar:
   - selector;
   - estado inicial “Selecciona una empresa”;
   - loader/skeleton;
   - estado vacío con CTA “Agregar proceso” para escritores;
   - matriz jerárquica;
   - alerta de error recuperable con botón reintentar.
5. Abrir creación/edición y confirmaciones destructivas mediante
   `ServicioModal`.
6. Tras respuesta exitosa, cerrar modal, recargar matriz y anunciar éxito.
7. En error, conservar el formulario abierto cuando sea útil y mostrar el
   `mensaje` de `RespuestaError`.

Usar `ServicioLoader` para carga inicial/refresco, pero no convertir cada
mutación breve en un loader global que bloquee toda la aplicación.

### Paso 6: Implementar RBAC de presentación

- Añadir a `nucleo/auth/constantes-roles.ts`:

```ts
export const ROLES_ESCRITURA_SST: readonly RolUsuario[] = [
  'ADMINISTRADOR',
  'AUDITOR_SST',
];
```

- Reutilizar `SiTieneRolDirective` para ocultar acciones de crear, editar y
  eliminar.
- Mantener la ruta disponible para `CONSULTA`, porque tiene acceso de lectura.
- No usar el guard de roles para bloquear toda la página.
- Tratar un 403 inesperado como error visible; no asumir que ocultar controles
  garantiza autorización.

### Paso 7: Registrar ruta y navegación

Modificar `src/app/app.routes.ts`:

- Agregar child route autenticada y lazy:
  `path: 'matriz-riesgos'`.
- Cargar `PaginaMatrizRiesgosComponent` con `loadComponent`.

Modificar:

- `layout/componentes/barra-lateral/barra-lateral.component.html`
- `layout/componentes/barra-lateral/barra-lateral.component.spec.ts`

Agregar enlace “Matriz de riesgos” a `/matriz-riesgos`, con
`routerLinkActive`, icono accesible y comportamiento responsive igual a
“Inicio”. No reutilizar el placeholder “Diagnóstico” como si fuera la misma
funcionalidad; puede mantenerse deshabilitado.

### Paso 8: Manejo de errores y confirmaciones

Mapear en el contenedor:

- 401: dejar actuar al interceptor (refresh/logout).
- 403 `ACCESO_DENEGADO`: alerta de permisos insuficientes.
- 404 de empresa/proceso/peligro/evaluación/control: informar y recargar la
  matriz para eliminar estado obsoleto.
- 422 `VALOR_GTC_INVALIDO`: mostrar mensaje junto al formulario de evaluación.
- 5xx/red: alerta genérica con reintento.

Confirmar antes de:

- eliminar proceso, indicando que se borrarán peligros, evaluación y controles
  por CASCADE;
- eliminar peligro, indicando que se borrarán su evaluación y controles;
- eliminar control.

### Paso 9: Pruebas unitarias

Servicios (`HttpTestingController`):

- URL y método de cada endpoint.
- Bodies exactos de proceso, peligro y control.
- PUT de evaluación contiene solo ND/NE/NC.
- DELETE maneja 204.
- IDs de ruta se codifican.
- Error 422/403 se propaga sin ser reemplazado.

Componentes presentacionales:

- `formulario-evaluacion` acepta solo opciones discretas y no emite derivados.
- render de derivados provenientes del input.
- aviso cuando EPP es el único control.
- eventos de crear/editar/eliminar.
- acciones ausentes en modo solo lectura.
- acordeón operable por teclado y atributos ARIA.

Página:

- estado sin selección, carga, vacío, datos y error;
- carga empresas y matriz en el orden esperado;
- recarga después de mutación;
- rol CONSULTA no ve acciones;
- 403/404/422 producen mensajes visibles;
- confirmación de CASCADE antes de DELETE;
- no se recalculan NP/NR.

Navegación:

- enlace a `/matriz-riesgos`;
- clase activa y nombre accesible.

### Paso 10: Documentación

Crear `src/app/features/matriz-riesgos/README.md`:

- objetivo y jerarquía;
- endpoints consumidos;
- reglas D1 y derivados de solo lectura;
- RBAC;
- comportamiento responsive;
- decisiones de refresco tras mutación.

No modificar `data-model.md` ni `api-spec.yml` del frontend: no existen
contratos locales y no se cambian endpoints. Referenciar como fuente de verdad
`sst-auditor-agent-pro-backend/ai-specs/specs/api-spec.yml`.

## 4. Orden de implementación

1. Paso 0 — rama y baseline.
2. Paso 1 — contratos TypeScript.
3. Paso 2 — servicios HTTP y pruebas.
4. Paso 3 — formularios.
5. Paso 4 — componentes jerárquicos responsive.
6. Paso 5 — página contenedora.
7. Paso 6 — RBAC.
8. Paso 7 — ruta y navegación.
9. Paso 8 — errores y confirmaciones.
10. Paso 9 — completar pruebas de UI e integración de componentes.
11. Paso 10 — documentación.

## 5. Checklist de pruebas

- [ ] `npm test` pasa sin fallos.
- [ ] `npm run test:coverage` cumple el umbral configurado actual (80 % global);
      para código nuevo apuntar a ≥ 90 % según el estándar del stack.
- [ ] `npm run lint:eslint` pasa con cero warnings.
- [ ] `npm run build` compila en modo producción.
- [ ] Flujo manual: elegir empresa → agregar proceso → peligro → evaluación →
      control → editar → eliminar.
- [ ] Evaluación ND=0 muestra NP=0, NR=0 e interpretación IV recibidos del backend.
- [ ] El request PUT de evaluación no contiene NP/NR/interpretación/aceptabilidad.
- [ ] CONSULTA puede leer y no ve acciones de escritura.
- [ ] 403, 404, 422 y fallo de red muestran feedback.
- [ ] Borrado de proceso refleja CASCADE tras recarga.
- [ ] Viewport 360 px funciona sin pérdida de información.
- [ ] Foco vuelve al disparador después de cerrar modal.
- [ ] Tests existentes de auth, dashboard y shared no se rompen.

## 6. Referencia de herramientas

| Propósito | Comando |
|---|---|
| Instalar | `npm install` |
| Build | `npm run build` |
| Tests | `npm test` |
| Coverage | `npm run test:coverage` |
| Lint | `npm run lint:eslint` |
| Ejecutar | `npm start` |

## 7. Formato de error

El backend devuelve:

```json
{
  "codigo": "VALOR_GTC_INVALIDO",
  "mensaje": "Descripción legible",
  "detalle": null
}
```

Mapeo relevante:

- 401 `TOKEN_INVALIDO`
- 403 `ACCESO_DENEGADO`
- 404 `EMPRESA_NO_ENCONTRADA`, `PROCESO_NO_ENCONTRADO`,
  `PELIGRO_NO_ENCONTRADO`, `EVALUACION_NO_ENCONTRADA`,
  `CONTROL_NO_ENCONTRADO`
- 422 `VALOR_GTC_INVALIDO`

## 8. Dependencias

- No agregar librerías.
- Reutilizar Angular, RxJS, Tailwind, Angular CDK y componentes compartidos ya
  instalados.
- Backend local requerido en `http://localhost:8000/api/v1` según
  `environment.ts`.
- PostgreSQL y migración `d4e5f6a7b8c9` deben estar aplicados en backend para
  la prueba E2E.

## 9. Notas

- La rama debe ser `feature/SP-192-frontend`.
- El frontend nunca recalcula NP/NR ni aceptabilidad.
- D1: ND “Bajo” es `0`; no inventar ND=1.
- La evaluación es 1—1 con peligro; PUT funciona como upsert (200/201).
- EPP único genera advertencia, no bloqueo.
- La respuesta agregada evita hacer GET por cada fila; no introducir N+1 desde
  el navegador.
- La UI de permisos es UX; el backend conserva la autorización real.
- Si se exige edición tipo hoja de cálculo, virtualización o autosave, detener
  y reestimar a 8 puntos: no forman parte del alcance de 5 puntos.

## 10. Checklist de verificación de implementación

- [ ] Calidad: build, lint y TypeScript estricto sin errores.
- [ ] Arquitectura: servicios HTTP separados; componentes OnPush y standalone.
- [ ] Formularios: tipados; sin Signal inputs/outputs.
- [ ] Contrato: modelos alineados al OpenAPI backend.
- [ ] Seguridad: Bearer solo por interceptor; CONSULTA en solo lectura.
- [ ] Pruebas: verdes y código nuevo ≥ 90 %.
- [ ] Responsive y accesibilidad verificados en 360 px y escritorio.
- [ ] Documentación de la feature creada.
- [ ] Rama: `feature/SP-192-frontend`.
