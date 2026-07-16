import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpContext,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AlmacenTokens } from './almacen-tokens';
import {
  interceptorAutenticacion,
  REINTENTO_TRAS_REFRESH,
} from './interceptor-autenticacion';
import { ServicioAutenticacion } from './servicio-autenticacion';

describe('interceptorAutenticacion', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let almacen: AlmacenTokens;
  let autenticacion: ServicioAutenticacion;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptorAutenticacion])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        AlmacenTokens,
        ServicioAutenticacion,
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    almacen = TestBed.inject(AlmacenTokens);
    autenticacion = TestBed.inject(ServicioAutenticacion);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should inyectar Authorization Bearer en peticiones al apiBaseUrl', () => {
    almacen.guardarPar('token-acceso', 'token-refresco');

    http.get(`${environment.apiBaseUrl}/ping`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-acceso');
    req.flush({ mensaje: 'pong' });
  });

  it('should no agregar Authorization si no hay token de acceso', () => {
    http.get(`${environment.apiBaseUrl}/ping`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ mensaje: 'pong' });
  });

  it('should no inyectar Authorization en login ni refresh', () => {
    almacen.guardarPar('token-acceso', 'token-refresco');

    http.post(`${environment.apiBaseUrl}/auth/login`, { correo: 'a@b.com', contrasena: 'x' }).subscribe();
    http.post(`${environment.apiBaseUrl}/auth/refresh`, { token_refresco: 'r' }).subscribe();

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    const refreshReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    expect(loginReq.request.headers.has('Authorization')).toBe(false);
    expect(refreshReq.request.headers.has('Authorization')).toBe(false);
    loginReq.flush({
      token_acceso: 'a',
      token_refresco: 'r',
      tipo_token: 'Bearer',
      expira_en_segundos: 1,
    });
    refreshReq.flush({
      token_acceso: 'a2',
      tipo_token: 'Bearer',
      expira_en_segundos: 1,
    });
  });

  it('should ante 401 refrescar una vez y reintentar la peticion original', () => {
    almacen.guardarPar('acc-viejo', 'ref-1');

    http.get(`${environment.apiBaseUrl}/ping`).subscribe((r) => {
      expect(r).toEqual({ mensaje: 'pong' });
    });

    const fallida = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    expect(fallida.request.headers.get('Authorization')).toBe('Bearer acc-viejo');
    fallida.flush(
      { exito: false, codigo: 'TOKEN_EXPIRADO', mensaje: 'expirado', detalle: [] },
      { status: 401, statusText: 'Unauthorized' },
    );

    const refreshReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    refreshReq.flush({
      token_acceso: 'acc-nuevo',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });

    const reintento = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer acc-nuevo');
    reintento.flush({ mensaje: 'pong' });
  });

  it('should compartir un unico refresh ante 401 concurrentes', () => {
    almacen.guardarPar('acc-viejo', 'ref-1');

    http.get(`${environment.apiBaseUrl}/ping`).subscribe();
    http.get(`${environment.apiBaseUrl}/auth/yo`).subscribe();

    const ping = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    const yo = httpMock.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    ping.flush({ mensaje: 'x' }, { status: 401, statusText: 'Unauthorized' });
    yo.flush({ mensaje: 'x' }, { status: 401, statusText: 'Unauthorized' });

    const refreshes = httpMock.match(`${environment.apiBaseUrl}/auth/refresh`);
    expect(refreshes.length).toBe(1);
    refreshes[0].flush({
      token_acceso: 'acc-nuevo',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });

    const reintentos = [
      ...httpMock.match(`${environment.apiBaseUrl}/ping`),
      ...httpMock.match(`${environment.apiBaseUrl}/auth/yo`),
    ];
    expect(reintentos.length).toBe(2);
    reintentos.forEach((r) => {
      expect(r.request.headers.get('Authorization')).toBe('Bearer acc-nuevo');
      r.flush({});
    });
  });

  it('should cerrar sesion y navegar a /login si el refresh falla', () => {
    almacen.guardarPar('acc-viejo', 'ref-1');
    jest.spyOn(autenticacion, 'cerrarSesion');

    http.get(`${environment.apiBaseUrl}/ping`).subscribe({
      error: () => undefined,
    });

    const fallida = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    fallida.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    refreshReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(autenticacion.cerrarSesion).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(almacen.obtenerTokenAcceso()).toBeNull();
  });

  it('should propagar errores que no sean 401 sin refrescar', () => {
    almacen.guardarPar('acc-1', 'ref-1');
    let status = 0;

    http.get(`${environment.apiBaseUrl}/ping`).subscribe({
      error: (e: { status: number }) => {
        status = e.status;
      },
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
    httpMock.expectNone(`${environment.apiBaseUrl}/auth/refresh`);
  });

  it('should no tocar urls fuera del apiBaseUrl', () => {
    almacen.guardarPar('acc-1', 'ref-1');

    http.get('https://otro.ejemplo.com/datos').subscribe();

    const req = httpMock.expectOne('https://otro.ejemplo.com/datos');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should cerrar sesion si el reintento tras refresh vuelve a ser 401', () => {
    almacen.guardarPar('acc-viejo', 'ref-1');
    jest.spyOn(autenticacion, 'cerrarSesion');

    http.get(`${environment.apiBaseUrl}/ping`).subscribe({
      error: () => undefined,
    });

    const fallida = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    fallida.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    refreshReq.flush({
      token_acceso: 'acc-nuevo',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });

    const reintento = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    reintento.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(autenticacion.cerrarSesion).toHaveBeenCalled();
  });

  it('should cerrar sesion si llega un 401 ya marcado como reintento', () => {
    almacen.guardarPar('acc-1', 'ref-1');
    jest.spyOn(autenticacion, 'cerrarSesion');

    const contexto = new HttpContext().set(REINTENTO_TRAS_REFRESH, true);
    http.get(`${environment.apiBaseUrl}/ping`, { context: contexto }).subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(autenticacion.cerrarSesion).toHaveBeenCalled();
    httpMock.expectNone(`${environment.apiBaseUrl}/auth/refresh`);
  });
});
