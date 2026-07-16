import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ServicioAutenticacion } from './servicio-autenticacion';
import type { RolUsuario } from './modelos/usuario-autenticado';

/**
 * Guard de roles vía `route.data.rolesPermitidos` (UX / navegación).
 * Usa el estado de `ServicioAutenticacion` — no decodifica el JWT.
 * La autorización real la impone el backend con `requerir_roles`.
 */
export const guardRoles: CanActivateFn = (route, state) => {
  const autenticacion = inject(ServicioAutenticacion);
  const router = inject(Router);

  if (!autenticacion.estaAutenticado()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const rolesPermitidos = (route.data['rolesPermitidos'] ?? []) as RolUsuario[];
  const rol = autenticacion.usuarioActual()?.rol;

  if (rol && rolesPermitidos.includes(rol)) {
    return true;
  }

  return router.createUrlTree(['/acceso-denegado']);
};
