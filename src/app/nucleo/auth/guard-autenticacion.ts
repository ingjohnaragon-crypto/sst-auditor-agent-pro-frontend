import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ServicioAutenticacion } from './servicio-autenticacion';

/**
 * Guard de autenticación (UX / navegación).
 * La autorización real la impone el backend con `requerir_roles`.
 */
export const guardAutenticacion: CanActivateFn = (_route, state) => {
  const autenticacion = inject(ServicioAutenticacion);
  const router = inject(Router);

  // Requiere token y perfil hidratado; token solo no basta (hidratación fallida → login).
  if (autenticacion.estaAutenticado() && autenticacion.usuarioActual() !== null) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
