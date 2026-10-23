# Plan de mejora

Ruta `/planes-mejora/:autoevaluacionId`, dentro del shell autenticado.

Lee `GET /autoevaluaciones/{id}`. Si `requiere_plan_mejora` es falso, el texto dice que la autoevaluación no exige plan y no pide el cronograma. Si es verdadero, lee `GET /autoevaluaciones/{id}/plan-mejora`.

Cada actividad muestra descripción y meses. `ADMINISTRADOR` y `AUDITOR_SST` editan responsable e indicador con `PUT /planes-mejora/{plan_id}/actividades/{actividad_id}`. El PUT reenvía la descripción y los meses que vinieron. `CONSULTA` ve la lista y no ve el guardado.

Textos de vacío:

- «Esta autoevaluación no exige plan de mejora.»
- «Aún no hay plan de mejora para esta autoevaluación.»
- «Este plan todavía no tiene actividades.»

No abre el plan, no agrega ni borra actividades, y no llama al borrador de acciones.
