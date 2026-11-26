# Feature: archivos

Repositorio documental de empresa (SP-286). Consume el API de SP-284:

- `GET/POST /empresas/{empresa_id}/archivos`
- `GET/DELETE /empresas/{empresa_id}/archivos/{archivo_id}`

El navegador no usa SDK de Cloudflare ni recibe credenciales o URL del bucket.
La descarga es un `blob` autenticado con el interceptor Bearer.

## RBAC

- `CONSULTA`: lista y descarga.
- `ADMINISTRADOR` / `AUDITOR_SST`: además carga y elimina (con confirmación).

## Errores de UI

Se muestran el `mensaje` del envelope SST o, si falta, el `detail` de FastAPI.
Un `503` se interpreta como almacenamiento no disponible. Si la descarga falla
con cuerpo `blob`, el mensaje es específico de descarga (el JSON no se lee en sync).
