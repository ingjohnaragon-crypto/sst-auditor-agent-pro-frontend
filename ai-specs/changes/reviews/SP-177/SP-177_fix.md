# Fix Summary: PR #6 — SP-177

## Changes
- Eliminado `7e9a8510-9318-48c9-8719-2ab05e713487.txt` (artefacto MCP)
- `.gitignore`: patrón para dumps UUID `.txt` en raíz
- `guardAutenticacion`: requiere `estaAutenticado()` + `usuarioActual() !== null`
- Test nuevo: token sin perfil → login

## Tests
`npm test` — 48 passed
