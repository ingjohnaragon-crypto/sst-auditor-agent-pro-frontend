# Integración: Cloudflare R2

OpenSpec carga este archivo junto al stack activo (`frontend-angular` o `python-fastapi`). No lo reemplaza. Un `os-stack` nuevo para R2 dejaría fuera las reglas de Angular o FastAPI.

## Decisión

Los bytes documentales viven en Cloudflare R2. El disco del servidor no guarda archivos. No hay bucket de AWS ni VPC. La historia SP-150 queda cerrada. Los metadatos (nombre, tipo, tamaño, `clave_objeto`, empresa, estado) viven solo en PostgreSQL.

Hay dos buckets distintos: `sst-auditor-dev` para desarrollo y otro de producción. Nunca se mezclan.

## Variables

`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`.

Esas variables existen solo en el backend. El navegador no recibe credenciales de R2, no importa un SDK de S3 y no habla con el bucket. Sube y descarga por el API de FastAPI, con la sesión ya autenticada.

## Claves de objeto

- Evidencias de autoevaluación: `evidencias/{empresa_id}/{uuid}{ext}`
- Catálogo PHVA: `documentos/{empresa_id}/{tipo_codigo}/{uuid}{ext}`

Tipos aceptados: PDF, JPEG y PNG. Tope 10 MiB. El rechazo de tipo o tamaño lo hace el API antes de subir; la pantalla muestra ese error.

## Qué construye Angular

Listados, carga y descarga de evidencias y del catálogo PHVA consumen los endpoints del backend. La pantalla no calcula claves de objeto ni firma URLs. Si el API responde 503 porque falta la configuración de R2, la UI lo trata como servicio no disponible.

## Curva de aprendizaje

La primera historia del repositorio (SP-282) es de backend: panel de Cloudflare y `docs/cloudflare-r2.md`. Angular entra después, cuando el API ya existe (SP-286 y el catálogo de SP-245).
