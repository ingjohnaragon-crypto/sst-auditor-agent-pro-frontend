import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AlmacenTokens } from './almacen-tokens';
import { ServicioAutenticacion } from './servicio-autenticacion';
import type { UsuarioAutenticado } from './modelos/usuario-autenticado';

describe('ServicioAutenticacion', () => {
  let servicio: ServicioAutenticacion;
  let httpMock: HttpTestingController;
  let almacen: AlmacenTokens;
  let router: Router;

  const usuarioMock: UsuarioAutenticado = {
    id: '11111111-1111-1111-1111-111111111111',
    nombre_completo: 'Ana Auditora',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        AlmacenTokens,
        ServicioAutenticacion,
      ],
    });
    servicio = TestBed.inject(ServicioAutenticacion);
    httpMock = TestBed.inject(HttpTestingController);
    almacen = TestBed.inject(AlmacenTokens);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(servicio).toBeTruthy();
  });

  it('should iniciarSesion guardar tokens y cargar usuario', () => {
    servicio.iniciarSesion({ correo: 'ana@empresa.com', contrasena: 'secreto12' }).subscribe((u) => {
      expect(u).toEqual(usuarioMock);
    });

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({
      correo: 'ana@empresa.com',
      contrasena: 'secreto12',
    });
    loginReq.flush({
      token_acceso: 'acc-1',
      token_refresco: 'ref-1',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });

    const yoReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    expect(yoReq.request.method).toBe('GET');
    yoReq.flush(usuarioMock);

    expect(almacen.obtenerTokenAcceso()).toBe('acc-1');
    expect(almacen.obtenerTokenRefresco()).toBe('ref-1');
    expect(servicio.usuarioActual()).toEqual(usuarioMock);
    expect(servicio.estaAutenticado()).toBe(true);
  });

  it('should refrescarToken actualizar solo el token de acceso', () => {
    almacen.guardarPar('acc-viejo', 'ref-1');

    servicio.refrescarToken().subscribe((token) => {
      expect(token).toBe('acc-nuevo');
    });

    const refreshReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.body).toEqual({ token_refresco: 'ref-1' });
    refreshReq.flush({
      token_acceso: 'acc-nuevo',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });

    expect(almacen.obtenerTokenAcceso()).toBe('acc-nuevo');
    expect(almacen.obtenerTokenRefresco()).toBe('ref-1');
  });

  it('should compartir una sola peticion de refresh concurrente', () => {
    almacen.guardarPar('acc-viejo', 'ref-1');

    let t1 = '';
    let t2 = '';
    servicio.refrescarToken().subscribe((t) => {
      t1 = t;
    });
    servicio.refrescarToken().subscribe((t) => {
      t2 = t;
    });

    const requests = httpMock.match(`${environment.apiBaseUrl}/auth/refresh`);
    expect(requests.length).toBe(1);
    requests[0].flush({
      token_acceso: 'acc-compartido',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });

    expect(t1).toBe('acc-compartido');
    expect(t2).toBe('acc-compartido');
  });

  it('should cerrarSesion limpiar tokens y navegar a /login', () => {
    almacen.guardarPar('acc-1', 'ref-1');

    servicio.cerrarSesion();

    expect(almacen.obtenerTokenAcceso()).toBeNull();
    expect(servicio.usuarioActual()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should fallar refrescarToken si no hay token de refresco', (done) => {
    servicio.refrescarToken().subscribe({
      next: () => done.fail('no debia emitir'),
      error: (e: Error) => {
        expect(e.message).toBe('No hay token de refresco');
        done();
      },
    });
  });

  it('should hidratar usuario al construir si hay token de acceso', () => {
    sessionStorage.setItem('sst.token_acceso', 'acc-persistido');
    sessionStorage.setItem('sst.token_refresco', 'ref-persistido');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        AlmacenTokens,
        ServicioAutenticacion,
      ],
    });

    const hidratado = TestBed.inject(ServicioAutenticacion);
    const httpHidratado = TestBed.inject(HttpTestingController);
    jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const yoReq = httpHidratado.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    yoReq.flush(usuarioMock);

    expect(hidratado.usuarioActual()).toEqual(usuarioMock);
    httpHidratado.verify();
  });

  it('should limpiar sesion si la hidratacion de /yo falla', () => {
    sessionStorage.setItem('sst.token_acceso', 'acc-persistido');
    sessionStorage.setItem('sst.token_refresco', 'ref-persistido');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        AlmacenTokens,
        ServicioAutenticacion,
      ],
    });

    TestBed.inject(ServicioAutenticacion);
    const httpHidratado = TestBed.inject(HttpTestingController);
    const almacenHidratado = TestBed.inject(AlmacenTokens);

    const yoReq = httpHidratado.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    yoReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(almacenHidratado.obtenerTokenAcceso()).toBeNull();
    httpHidratado.verify();
  });
});
