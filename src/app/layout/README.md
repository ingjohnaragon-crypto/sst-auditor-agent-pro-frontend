# Capa de layout

Shell autenticado de SST-Audit Pro. Envuelve las rutas privadas y mantiene la
navegación y la información de sesión visibles.

## Estructura

```text
layout/
├── componentes/
│   ├── barra-lateral/
│   │   └── barra-lateral.component.{ts,html,css,spec.ts}
│   └── cabecera/
│       └── cabecera.component.{ts,html,css,spec.ts}
├── shell/
│   └── shell.component.{ts,html,css,spec.ts}
├── components/index.ts
└── index.ts
```

Cada subcomponente vive en su propia carpeta. Todos usan `templateUrl` y
`styleUrls`; templates/estilos inline no están permitidos.

## Responsabilidades

- `ShellComponent`: compone barra lateral, cabecera y `RouterOutlet`.
- `BarraLateralComponent`: navegación responsive (`w-20 md:w-64`) y estado
  activo mediante `routerLinkActive`.
- `CabeceraComponent`: presenta nombre/rol del usuario y ejecuta el cierre de
  sesión mediante `ServicioAutenticacion`.

El shell se protege una sola vez en la ruta padre con `guardAutenticacion`; las
rutas hijas agregan `guardRoles` únicamente cuando requieren roles específicos.

## Diseño

Se adapta el shell del mockup
[sst-audit-pro-mckp](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp)
a Angular standalone y Tailwind: fondo slate, sidebar oscura, acento indigo y
tipografía Inter. Los iconos son SVG locales para evitar dependencias nuevas.
