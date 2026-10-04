# Estrategia frontend HU SP-144: primero SP-189, luego SP-204

## Objetivo

Habilitar **iniciar y calificar** autoevaluaciones en Angular (lo que el auditor
necesita hoy) y **después** mostrar las barras PHVA. No al revés: las barras
sin `POST /autoevaluaciones` dejan Diagnóstico en vacío eterno.

Jira tiene SP-144 / SP-187 / SP-188 / SP-189 en **Listo**. En código:

| Ticket | Capa | Realidad |
|---|---|---|
| SP-187 + SP-188 | Backend | Hecho (API en `develop`) |
| SP-189 | Frontend | **No hecho** (solo plan) |
| SP-204 | Frontend | Hecho en rama local `feature/SP-204-frontend`, **sin merge** |

## Orden de entrega

```
1. Aparcar SP-204 (no mergear, no os-commit todavía)
2. Reabrir SP-189 en Jira (Por hacer / En curso)
3. os-develop SP-189 desde develop  →  feature/SP-189-frontend
4. Merge PR SP-189 → develop
5. Rebase de feature/SP-204-frontend sobre ese develop
6. Ajuste fino SP-204 (complemento visual) + os-commit SP-204
```

## Fase 1 — Aparcar SP-204

La rama `feature/SP-204-frontend` ya tiene `features/diagnostico/` (gráfico,
panel, listar empresas/autoevaluaciones, rutas `/diagnostico`). **No se borra.**
Tampoco se mergea a `develop` ahora: chocaría con SP-189 en las mismas rutas
y en el mismo feature.

Trabajo local: dejar los cambios en esa rama. Si hace falta cambiar de rama
sin perder nada:

```bash
git stash push -u -m "SP-204 aparcado"   # solo si hay que salir de la rama
# o simplemente no cambiar de rama hasta commitear SP-204 en su feature
```

Preferible: un commit local **solo en** `feature/SP-204-frontend` (sin push/PR)
para no perder el trabajo. Eso no publica las barras.

## Fase 2 — SP-189 (núcleo de la HU en frontend)

Base: `develop` actual (sin SP-204).

Rama: `feature/SP-189-frontend`

Alcance (plan existente `SP-189_frontend.md`):

1. Selector de empresa + **Nueva autoevaluación** (`POST /autoevaluaciones`).
2. Matriz de 60 ítems por ciclo PHVA (`GET /estandares-minimos`).
3. Calificar ítem (`PUT .../calificaciones/{estandar_id}`).
4. Barra de avance y **Finalizar** (`POST .../finalizar`).
5. Histórico + detalle solo lectura.
6. RBAC UI: `CONSULTA` sin escritura.

Rutas que **pasa a ser dueño SP-189**:

| Ruta | Contenido SP-189 |
|---|---|
| `/diagnostico` | Selector empresa, CTA crear, histórico |
| `/diagnostico/:id` | Matriz + avance + finalizar (no solo el gráfico) |
| `/diagnostico/historico` | Opcional si no cabe en el índice |

**No** implementar en SP-189 las barras de `cumplimiento-phva` (eso es el
complemento). Un hueco o tarjeta «cumplimiento PHVA — próximo» es suficiente.

Reutilizar del trabajo aparcado (copiar/adaptar, no reescribir a ciegas):

- `ciclo-phva.ts`, `empresa-diagnostico.model.ts`
- `ServicioEmpresasDiagnostico` / `listarPorEmpresa`
- Estilo de selector de empresa del dashboard/diagnóstico SP-204

Extender `ServicioAutoevaluaciones` con `crear`, `obtenerPorId`, `calificar`,
`finalizar`. El `listarPorEmpresa` de SP-204 se queda.

CTA Inicio «Nueva autoevaluación»: deja de ser placeholder; navega a
`/diagnostico` o crea y abre `/diagnostico/:id`.

## Fase 3 — Complemento SP-204

Cuando SP-189 esté en `develop`:

```bash
git checkout feature/SP-204-frontend
git rebase origin/develop
```

Conflictos esperados (resolver a favor de la **matriz** de SP-189 + **insertar**
el gráfico):

- `app.routes.ts` — conservar rutas SP-189; el detalle monta matriz **y**
  `<app-panel-cumplimiento-phva>`.
- `pagina-diagnostico` — índice SP-189; el gráfico va en detalle o en un
  bloque del índice cuando ya hay id.
- `barra-lateral` — el enlace a Diagnóstico ya existirá; no volver a
  «Próximo».
- `pagina-dashboard` — selector + panel PHVA de SP-204 sobre el CTA real
  de SP-189.

Criterio de hecho SP-204: con una autoevaluación creada desde la UI, Inicio y
detalle muestran las 4 barras con `%` del API.

## Qué no hacer

- No mergear SP-204 a `develop` antes de SP-189.
- No implementar crear/calificar/finalizar otra vez dentro de SP-204.
- No recalcular Res. 0312 en el cliente (sigue siendo backend).
- No tratar el «Listo» de Jira en SP-189 como hecho de producto.

## Jira (recomendado)

- SP-187 / SP-188: seguir **Listo** (backend real).
- SP-189: pasar a **Por hacer** o **En curso** (pantalla no existe).
- SP-204: sigue **Por hacer** hasta el complemento (fase 3).
- Comentario en SP-144: «Frontend: SP-189 primero, SP-204 como complemento
  visual tras tener autoevaluaciones creadas en UI.»

## Comandos OpenSpec

```bash
# Fase 2
os-develop SP-189
# … implementar matriz …
os-commit SP-189

# Fase 3 (después del merge a develop)
git checkout feature/SP-204-frontend
git rebase origin/develop
os-commit SP-204
```
