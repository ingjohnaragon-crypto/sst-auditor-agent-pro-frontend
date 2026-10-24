# Plan de mejora

Ruta `/planes-mejora/:autoevaluacionId`, dentro del shell autenticado.

Lee `GET /autoevaluaciones/{id}`. Si `requiere_plan_mejora` es falso, el texto dice que la autoevaluación no exige plan y no pide el cronograma. Si es verdadero, lee `GET /autoevaluaciones/{id}/plan-mejora`.

Cada actividad muestra descripción, responsable e indicador. Con plan, la grilla Ene–Dic pinta los meses en el orden del API. `ADMINISTRADOR` y `AUDITOR_SST` marcan o desmarcan un mes con `PUT /planes-mejora/{plan_id}/actividades/{actividad_id}` usando la descripción, el responsable y el indicador ya persistidos. El mismo rol agrega con `POST /planes-mejora/{plan_id}/actividades` y quita con `DELETE` de esa ruta seguido de `GET` del plan. Guardar responsable e indicador reenvía la descripción y una copia de los meses. `CONSULTA` ve las marcas y no ve casillas, Agregar, Quitar ni Guardar.

Textos de vacío:

- «Esta autoevaluación no exige plan de mejora.»
- «Aún no hay plan de mejora para esta autoevaluación.»
- «Este plan todavía no tiene actividades.»

No abre el plan y no llama al borrador de acciones.
