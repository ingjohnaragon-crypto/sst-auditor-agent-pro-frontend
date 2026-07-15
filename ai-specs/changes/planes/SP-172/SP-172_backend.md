# Backend Implementation Plan: SP-172 Inicializar proyecto Angular con Tailwind CSS (Soporte backend mínimo)

## 1. Overview
Breve: Este plan describe la implementación backend mínima necesaria para soportar la subtarea SP-172 del frontend: exponer un endpoint de verificación (ping) en `GET /api/v1/ping` que devuelva `{ mensaje: string }` en español. Principios arquitectónicos: servicio REST ligero, contrato explícito de respuesta en español, CORS configurado para permitir el origen del frontend `http://localhost:4200`.

Stack recomendado para el backend: Python + FastAPI (rápido, tipado, fácil de probar). Este plan asume un servicio backend independiente que corre en `http://localhost:8000`.

Active stack (contexto del repo actual): frontend-angular (Angular)

## 2. Architecture Context
- Active stack: frontend-angular (Angular)
- Capas involucradas (backend mínimo requerido para la HU):
  - Presentation (HTTP): archivos de rutas/controladores
    - `app/main.py` (arranque, configuración de CORS)
    - `app/api/v1/ping.py` (router/handler)
  - Application (servicios): archivo de servicio
    - `app/services/servicio_salud.py` (lógica simple de ping)
  - Domain / DTOs: esquemas de respuesta
    - `app/schemas/ping.py` (Pydantic model: PingResponse)
  - Tests: pruebas unitarias/integra
    - `tests/test_ping.py`
  - Infraestructura / Config
    - `.env` ó `config/settings.py` (PUERTO, ORIGEN_FRONTEND)
    - `Dockerfile` y `docker-compose.yml` opcionales
  - Documentación
    - `ai-specs/specs/api-spec.yml` (actualizar endpoint)

### Subtask Mapping
No subtasks — plan derivado directamente de la HU.

## 3. Implementation Steps

#### Step 0: Create Feature Branch
- Action: crear y cambiar a branch de feature
- Branch: `feature/SP-172-backend`
- Commands:
  ```bash
  git checkout main && git pull origin main
  git checkout -b feature/SP-172-backend
  ```

#### Step 1: [Schema Migration — if needed]
- Ninguna migración requerida: el endpoint ping no toca base de datos.

#### Step 2: [Domain Entity / Model]
- File: `app/schemas/ping.py`
- Changes: nuevo Pydantic model:
  ```py
  from pydantic import BaseModel

  class PingResponse(BaseModel):
      mensaje: str
  ```

#### Step 3: [Repository Interface]
- No aplica (no hay persistencia para ping).

#### Step 4: [DTOs]
- Files: `app/schemas/ping.py` (ver Step 2)
- Validación: `mensaje` es string no vacío (en Pydantic se puede validar mínimo 1 char si se desea).

#### Step 5: [Service]
- File: `app/services/servicio_salud.py`
- Método: `def obtener_ping() -> PingResponse` — devuelve PingResponse(mensaje="pong")
- Descripción: lógica mínima, separada para facilitar testing y consistencia de contrato.

#### Step 6: [Controller / Router / Handler]
- File: `app/api/v1/ping.py`
- HTTP method: GET
- Path: `/api/v1/ping`
- Response contract: 200 OK con body JSON: `{ "mensaje": "pong" }`
- Implementación: Inyectar servicio, mapear respuesta a esquema `PingResponse`.

#### Step 7: [Exception Handling]
- Nuevas excepciones: no necesarias para ping; seguir mapeo genérico de errores 500.
- Asegurar manejo global de excepciones y logging estructurado.

#### Step 8: [Unit Tests]
- Test files:
  - `tests/test_ping.py`
- Casos a cubrir:
  - happy path: GET `/api/v1/ping` devuelve 200 y `{ mensaje: "pong" }`
  - contrato JSON: clave `mensaje` presente y tipo string
  - CORS: origen `http://localhost:4200` permitido (test de cabeceras)

#### Step 9: [Integration / Run]
- Arranque local: `uvicorn app.main:app --reload --port 8000`
- Verificar desde frontend: `http://localhost:4200` (el frontend hará llamada a `http://localhost:8000/api/v1/ping`)

#### Step 10: Update Technical Documentation
- `ai-specs/specs/api-spec.yml` — añadir descripción del endpoint `/api/v1/ping` con esquema de respuesta `PingResponse`.
- `README.md` del backend: incluir instrucciones rápidas de instalación y ejecución (env, uvicorn, tests).

## 4. Implementation Order
1. Step 0: Crear branch
2. Step 2: Añadir esquema Pydantic (`app/schemas/ping.py`)
3. Step 5: Implementar servicio (`app/services/servicio_salud.py`)
4. Step 6: Implementar router/controller (`app/api/v1/ping.py`)
5. Step 1: Confirmar que no hay migraciones requeridas
6. Step 7: Verificar manejo global de errores
7. Step 8: Implementar tests (`tests/test_ping.py`)
8. Step 9: Ejecutar localmente y verificar CORS
9. Step 10: Actualizar `ai-specs/specs/api-spec.yml` y README

## 5. Testing Checklist
- [ ] `pytest` pasa con 0 fallos
- [ ] Endpoint GET `/api/v1/ping` devuelve 200 y `{ "mensaje": "pong" }`
- [ ] CORS permite `http://localhost:4200`
- [ ] Integración manual: angular `ng serve` puede consumir el endpoint
- [ ] Linter y formateo pasan (según stack backend elegido)

## 6. Tooling Reference
Commands relevantes (contexto del repositorio activo frontend-angular):

| Purpose | Command |
|---|---|
| Build frontend | `ng build` |
| Test frontend | `ng test --watch=false` |
| Run frontend | `ng serve` |
| Coverage frontend | `ng test --code-coverage --watch=false` |

Commands recomendados para el backend (FastAPI):

| Purpose | Command |
|---|---|
| Run (desarrollo) | `uvicorn app.main:app --reload --port 8000` |
| Tests | `pytest` |
| Lint | `ruff check .` o `flake8` (según preferencia) |

## 7. Error Response Format
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Descripción legible por humanos en español",
  "details": ["campo: mensaje de validación"]
}
```
HTTP mapping: 400 VALIDATION_ERROR | 404 NOT_FOUND | 409 CONFLICT | 422 BUSINESS_RULE_VIOLATION | 500 INTERNAL_ERROR

Para el endpoint /api/v1/ping, la respuesta esperada en éxito es:
200 OK
```json
{ "mensaje": "pong" }
```

## 8. Dependencies
- Python >= 3.10
- FastAPI
- uvicorn
- pydantic
- pytest
- ruff/flake8 para lint
Instalación sugerida:
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install fastapi uvicorn pydantic pytest ruff
```

## 9. Notes
- Mantener los mensajes y claves en español (`mensaje`) para coherencia con estándares del proyecto.
- Separar responsabilidades: controller -> servicio -> schema.
- Configurar CORS con origen explícito `http://localhost:4200` durante desarrollo; en producción usar lista de orígenes permitidos.
- No exponer datos sensibles en el endpoint ping.

## 10. Implementation Verification Checklist
- [ ] Código compila/arranca con `uvicorn` sin errores
- [ ] Tests unitarios pasan
- [ ] CORS habilitado y verificado por frontend
- [ ] `ai-specs/specs/api-spec.yml` actualizado
- [ ] README del backend contiene instrucciones de arranque y prueba

---

Archivo generado para soporte a la tarea frontend SP-172: endpoint de verificación requerido por `ServicioSalud` en el frontend. Este plan está enfocado a un backend minimalista y probado para desarrollo local.
