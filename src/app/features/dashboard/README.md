# Dashboard

Landing autenticada de SST-Audit Pro. La ruta `/dashboard` se renderiza dentro
del `ShellComponent` y está protegida por `guardAutenticacion`.

## Estructura

```text
features/dashboard/
├── paginas/
│   └── pagina-dashboard/
│       └── pagina-dashboard.component.{ts,html,css,spec.ts}
├── componentes/
│   └── tarjeta-resumen/
│       └── tarjeta-resumen.component.{ts,html,css,spec.ts}
└── README.md
```

Cada página y subcomponente tiene su propia carpeta. No mezclar varios
componentes en el mismo directorio.

## Alcance

- Resumen genérico con tarjetas placeholder.
- Accesos rápidos condicionados por rol mediante `*appSiTieneRol`.
- Datos de sesión obtenidos de `ServicioAutenticacion.usuarioActual`.
- Sin llamadas HTTP de negocio: las métricas reales se conectarán en tickets
  posteriores.

## Diseño

El lenguaje visual toma como referencia el shell y `DashboardView` del mockup
[sst-audit-pro-mckp](https://github.com/ingjohnaragon-crypto/sst-audit-pro-mckp):
paleta slate/indigo, tarjetas redondeadas, tipografía Inter y navegación lateral
responsive. No se porta código React ni dependencias del mockup.

## Roles

Todos los usuarios autenticados pueden ver el dashboard. Los accesos de
escritura solo se muestran a `ADMINISTRADOR` y `AUDITOR_SST`; esta restricción
es de experiencia de usuario y no sustituye la autorización del backend.
