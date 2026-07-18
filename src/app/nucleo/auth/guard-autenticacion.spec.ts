import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subject, firstValueFrom, isObservable, of } from 'rxjs';

import { guardAutenticacion } from './guard-autenticacion';
import { ServicioAutenticacion } from './servicio-autenticacion';
import type { UsuarioAutenticado } from './modelos/usuario-autenticado';

describe('guardAutenticacion', () => {
  let estaAutenticado: jest.Mock;
  let esperarHidratacion: jest.Mock;

  const usuario: UsuarioAutenticado = {
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  };

  beforeEach(() => {
    estaAutenticado = jest.fn();
    esperarHidratacion = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ServicioAutenticacion,
          useValue: { estaAutenticado, esperarHidratacion },
        },
      ],
    });
  });

  function ejecutar(url = '/ejemplo-sensible') {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => guardAutenticacion(route, state));
  }

  async function resolver(resultado: ReturnType<typeof ejecutar>): Promise<boolean | UrlTree> {
    if (isObservable(resultado)) {
      return firstValueFrom(resultado as Observable<boolean | UrlTree>);
    }
    return resultado as boolean | UrlTree;
  }

  it('should permitir el acceso si hay sesion e usuario hidratado', async () => {
    estaAutenticado.mockReturnValue(true);
    esperarHidratacion.mockReturnValue(of(usuario));

    await expect(resolver(ejecutar())).resolves.toBe(true);
  });

  it('should esperar la hidratacion en curso antes de decidir (F5)', async () => {
    estaAutenticado.mockReturnValue(true);
    const hidratacion = new Subject<UsuarioAutenticado | null>();
    esperarHidratacion.mockReturnValue(hidratacion.asObservable());

    const pendiente = resolver(ejecutar('/dashboard'));
    hidratacion.next(usuario);
    hidratacion.complete();

    await expect(pendiente).resolves.toBe(true);
  });

  it('should redirigir a /login si la hidratacion termina sin usuario', async () => {
    estaAutenticado.mockReturnValue(true);
    esperarHidratacion.mockReturnValue(of(null));
    const router = TestBed.inject(Router);

    await expect(resolver(ejecutar('/ejemplo-sensible'))).resolves.toEqual(
      router.createUrlTree(['/login'], {
        queryParams: { returnUrl: '/ejemplo-sensible' },
      }),
    );
  });

  it('should redirigir a /login con returnUrl si no hay sesion', () => {
    estaAutenticado.mockReturnValue(false);
    const router = TestBed.inject(Router);

    expect(ejecutar('/ejemplo-sensible')).toEqual(
      router.createUrlTree(['/login'], {
        queryParams: { returnUrl: '/ejemplo-sensible' },
      }),
    );
    expect(esperarHidratacion).not.toHaveBeenCalled();
  });
});
