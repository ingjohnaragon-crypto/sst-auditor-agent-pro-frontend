# Frontend note: SP-173 Validar conectividad ping/pong (CORS)

## Rol del frontend
El consumidor ya existe en SP-172:

- `ServicioSalud.obtenerPing()` → `GET {apiBaseUrl}/ping`
- `environment.apiBaseUrl` = `http://localhost:8000/api/v1`
- `RootComponent` muestra `mensaje` o error si falla la red/CORS

## Checklist manual (aceptación SP-173)
1. Backend en `:8000` con CORS default `http://localhost:4200`.
2. `ng serve` en `:4200` → UI muestra `pong`, sin errores CORS.
3. `ng serve --port 4300` → el navegador bloquea; UI muestra el mensaje de error de ping.
4. Con `ORIGENES_CORS='[\"http://localhost:4300\"]'` en backend y reinicio, el paso 3 debe pasar.

La implementación CORS del backend vive en la rama/PR de SP-139/SP-173 del repo backend.
