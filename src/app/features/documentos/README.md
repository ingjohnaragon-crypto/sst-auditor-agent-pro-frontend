# Feature: documentos (gestor PHVA)

Pantalla del catálogo documental por fases (SP-267 / épica SP-245).

## API

- `GET /catalogo-documentos`
- `GET /empresas/{id}/documentos`
- `POST /empresas/{id}/documentos/{tipo_id}/archivo` (multipart `archivo`)
- `GET /empresas/{id}/documentos/{tipo_id}/archivo` (blob Bearer)
- `PATCH /empresas/{id}/documentos/{tipo_id}` `{ "estado": "REVISADO" }`

El cliente **no** usa SDK R2 ni recibe `clave_objeto` / URL de bucket.

## Avance

`(documentos con estado ≠ PENDIENTE / total) * 100`, redondeado, con los datos del GET de empresa.

## RBAC

- `CONSULTA`: ver pestañas, avance y descargar.
- `ADMINISTRADOR` / `AUDITOR_SST`: cargar/reemplazar y marcar revisado.

## Ruta

`/documentos` (shell autenticado). Distinto de `/archivos` (repositorio libre SP-286).
