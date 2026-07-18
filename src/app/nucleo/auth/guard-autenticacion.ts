import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { ServicioAutenticacion } from './servicio-autenticacion';

/**
 * Guard de autenticación (UX / navegación).
 * La autorización real la impone el backend con `requerir_roles`.
 *
 * Espera la hidratación de sesión (F5 con token persistido) antes de decidir,
 * para no expulsar a `/login` mientras `/auth/yo` sigue en curso.
 */
export const guardAutenticacion: CanActivateFn = (_route, state) => {
  const autenticacion = inject(ServicioAutenticacion);
  const router = inject(Router);

  const irALogin = () =>
    router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });

  if (!autenticacion.estaAutenticado()) {
    return irALogin();
  }

  return autenticacion.esperarHidratacion().pipe(
    map((usuario) => (usuario !== null ? true : irALogin())),
  );
};
