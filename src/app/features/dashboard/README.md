# Dashboard (Inicio)

Landing autenticada de SST-Audit Pro. La ruta `/dashboard` es la **pantalla
principal del usuario** (home de producto), se renderiza dentro del
`ShellComponent` y está protegida por `guardAutenticacion`. En la barra
lateral el ítem se etiqueta como **Inicio**.

## Estructura

```text
features/dashboard/
├── paginas/
│   └── pagina-dashboard/
│       └── pagina-dashboard.component.{ts,html,css,spec.ts}
├── componentes/
│   └── tarjeta-resumen/
├── modelos/
│   └── fila-actividad-home.model.ts
├── servicios/
│   └── servicio-resumen-home.ts
└── README.md
```

## Alcance (SP-242)

- Saludo con `nombre_completo` / `rol` desde `ServicioAutenticacion`.
- CTAs de producto: modal onboarding (`ServicioModal`), actualizar resumen
  (`ServicioLoader`), autoevaluación (RBAC, navega a `/diagnostico`).
- `Alerta` informativa + éxito tras refrescar.
- Resumen con `TarjetaResumen` (métricas placeholder).
- Actividad reciente con `TablaComponent` y datos mock (`ServicioResumenHome`).
- Accesos rápidos (Diagnóstico → `/diagnostico`) + panel PHVA en vivo
  (`GET cumplimiento-phva` de la última autoevaluación de la empresa).
- Demos técnicas SP-240/SP-241 en accordion **Herramientas de componentes
  (QA)**, cerrado por defecto (fuera del primer viewport).

El diagnóstico de estándares mínimos vive en `features/diagnostico/` (SP-189 + SP-204).

## Componentes shared usados

`Boton`, `Alerta`, `Tabla`, `Modal`/`ServicioModal`, `Tooltip`,
`FormularioDinamico` (solo QA), `ServicioLoader`.

## Diseño

Referencia visual: mockup
[sst-audit-pro-mckp](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp)
(shell + DashboardView). Tokens `--sst-*`, Tailwind, Inter.

## Roles

Todos los autenticados ven Inicio. CTAs de escritura
(`Nueva autoevaluación`, área auditoría) solo `ADMINISTRADOR` /
`AUDITOR_SST` vía `*appSiTieneRol`.
