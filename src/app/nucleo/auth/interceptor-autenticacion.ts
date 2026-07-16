import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AlmacenTokens } from './almacen-tokens';
import { ServicioAutenticacion } from './servicio-autenticacion';

/** Marca una petición como reintento tras refresh (evita bucles). */
export const REINTENTO_TRAS_REFRESH = new HttpContextToken<boolean>(() => false);

function esUrlBackend(url: string): boolean {
  return url.startsWith(environment.apiBaseUrl);
}

function esRutaExcluida(url: string): boolean {
  return url.endsWith('/auth/login') || url.endsWith('/auth/refresh');
}

/**
 * Interceptor funcional: inyecta Bearer y refresca ante 401 (single-flight).
 */
export const interceptorAutenticacion: HttpInterceptorFn = (req, next) => {
  const autenticacion = inject(ServicioAutenticacion);
  const almacen = inject(AlmacenTokens);

  if (!esUrlBackend(req.url) || esRutaExcluida(req.url)) {
    return next(req);
  }

  const tokenAcceso = almacen.obtenerTokenAcceso();
  const peticion = tokenAcceso
    ? req.clone({ setHeaders: { Authorization: `Bearer ${tokenAcceso}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (req.context.get(REINTENTO_TRAS_REFRESH)) {
        autenticacion.cerrarSesion();
        return throwError(() => error);
      }

      return autenticacion.refrescarToken().pipe(
        switchMap((nuevoToken) => {
          const reintento = peticion.clone({
            setHeaders: { Authorization: `Bearer ${nuevoToken}` },
            context: peticion.context.set(REINTENTO_TRAS_REFRESH, true),
          });
          return next(reintento).pipe(
            catchError((errorReintento: unknown) => {
              if (
                errorReintento instanceof HttpErrorResponse &&
                errorReintento.status === 401
              ) {
                autenticacion.cerrarSesion();
              }
              return throwError(() => errorReintento);
            }),
          );
        }),
        catchError((errorRefresh: unknown) => {
          autenticacion.cerrarSesion();
          return throwError(() => errorRefresh);
        }),
      );
    }),
  );
};
