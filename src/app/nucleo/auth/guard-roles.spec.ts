import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { signal } from '@angular/core';

import { guardRoles } from './guard-roles';
import { ServicioAutenticacion } from './servicio-autenticacion';
import type { UsuarioAutenticado } from './modelos/usuario-autenticado';

describe('guardRoles', () => {
  let usuarioSignal: ReturnType<typeof signal<UsuarioAutenticado | null>>;
  let estaAutenticado: jest.Mock;

  const auditor: UsuarioAutenticado = {
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  };

  const consulta: UsuarioAutenticado = {
    ...auditor,
    id: '2',
    correo: 'consulta@empresa.com',
    rol: 'CONSULTA',
  };

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

  function ejecutar(rolesPermitidos: string[], url = '/ejemplo-sensible') {
    const route = {
      data: { rolesPermitidos },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => guardRoles(route, state));
  }

  it('should permitir AUDITOR_SST en ruta sensible', () => {
    estaAutenticado.mockReturnValue(true);
    usuarioSignal.set(auditor);
    expect(ejecutar(['ADMINISTRADOR', 'AUDITOR_SST'])).toBe(true);
  });

  it('should redirigir CONSULTA a /acceso-denegado', () => {
    estaAutenticado.mockReturnValue(true);
    usuarioSignal.set(consulta);
    const router = TestBed.inject(Router);
    expect(ejecutar(['ADMINISTRADOR', 'AUDITOR_SST'])).toEqual(
      router.createUrlTree(['/acceso-denegado']),
    );
  });

  it('should redirigir a /acceso-denegado si no hay rolesPermitidos en data', () => {
    estaAutenticado.mockReturnValue(true);
    usuarioSignal.set(auditor);
    const router = TestBed.inject(Router);
    expect(ejecutar([])).toEqual(router.createUrlTree(['/acceso-denegado']));
  });
});
