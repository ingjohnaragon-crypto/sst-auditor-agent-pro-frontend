import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';

import { guardAutenticacion } from './guard-autenticacion';
import { ServicioAutenticacion } from './servicio-autenticacion';
import type { UsuarioAutenticado } from './modelos/usuario-autenticado';

describe('guardAutenticacion', () => {
  let estaAutenticado: jest.Mock;
  let usuarioSignal: ReturnType<typeof signal<UsuarioAutenticado | null>>;

  beforeEach(() => {
    usuarioSignal = signal<UsuarioAutenticado | null>(null);
    estaAutenticado = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ServicioAutenticacion,
          useValue: {
            estaAutenticado,
            usuarioActual: usuarioSignal.asReadonly(),
          },
        },
      ],
    });
  });

  function ejecutar(url = '/ejemplo-sensible') {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => guardAutenticacion(route, state));
  }

  it('should permitir el acceso si hay sesion', () => {
    estaAutenticado.mockReturnValue(true);
    expect(ejecutar()).toBe(true);
  });

  it('should redirigir a /login con returnUrl si no hay sesion', () => {
    estaAutenticado.mockReturnValue(false);
    const router = TestBed.inject(Router);
    expect(ejecutar('/ejemplo-sensible')).toEqual(
      router.createUrlTree(['/login'], {
        queryParams: { returnUrl: '/ejemplo-sensible' },
      }),
    );
  });
});
