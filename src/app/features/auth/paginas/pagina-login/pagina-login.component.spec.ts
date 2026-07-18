import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

import { PaginaLoginComponent } from './pagina-login.component';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { environment } from '../../../../../environments/environment';
import type { UsuarioAutenticado } from '../../../../nucleo/auth/modelos/usuario-autenticado';

describe('PaginaLoginComponent', () => {
  let fixture: ComponentFixture<PaginaLoginComponent>;
  let component: PaginaLoginComponent;
  let router: Router;
  let httpMock: HttpTestingController;
  let returnUrlMock: string | null;

  const usuario: UsuarioAutenticado = {
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  };

  beforeEach(async () => {
    sessionStorage.clear();
    returnUrlMock = '/ejemplo-sensible';

    await TestBed.configureTestingModule({
      imports: [PaginaLoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'returnUrl' ? returnUrlMock : null),
              },
            },
          },
        },
        ServicioAutenticacion,
      ],
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(PaginaLoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  }

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    crearComponente();
    expect(component).toBeTruthy();
  });

  it('should mostrar identidad visual y formulario accesible', () => {
    crearComponente();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('SST-Audit');
    expect(element.querySelector('input[autocomplete="username"]')).toBeTruthy();
    expect(element.querySelector('input[autocomplete="current-password"]')).toBeTruthy();
    expect(element.querySelector('button[type="submit"]')?.textContent).toContain('Iniciar sesión');
  });

  it('should navegar a returnUrl tras login exitoso', () => {
    crearComponente();
    component.formulario.setValue({
      correo: 'ana@empresa.com',
      contrasena: 'secreto12',
    });
    component.enviar();

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    loginReq.flush({
      token_acceso: 'a',
      token_refresco: 'r',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });
    const yoReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    yoReq.flush(usuario);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/ejemplo-sensible');
  });

  it('should navegar a /dashboard tras login exitoso sin returnUrl', () => {
    returnUrlMock = null;
    crearComponente();
    component.formulario.setValue({
      correo: 'ana@empresa.com',
      contrasena: 'secreto12',
    });
    component.enviar();

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    loginReq.flush({
      token_acceso: 'a',
      token_refresco: 'r',
      tipo_token: 'Bearer',
      expira_en_segundos: 1800,
    });
    const yoReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    yoReq.flush(usuario);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirigir fuera del login si ya hay sesion hidratada', () => {
    sessionStorage.setItem('sst.token_acceso', 'acc-persistido');
    sessionStorage.setItem('sst.token_refresco', 'ref-persistido');
    returnUrlMock = null;

    crearComponente();

    const yoReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/yo`);
    yoReq.flush(usuario);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should mostrar error y liberar el boton si el login falla', () => {
    crearComponente();
    component.formulario.setValue({
      correo: 'ana@empresa.com',
      contrasena: 'secreto12',
    });
    component.enviar();

    expect(component.enviando()).toBe(true);

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    loginReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.error()).toContain('No se pudo iniciar sesión');
    expect(component.enviando()).toBe(false);
  });

  it('should no enviar si el formulario es invalido', () => {
    crearComponente();
    const auth = TestBed.inject(ServicioAutenticacion);
    jest.spyOn(auth, 'iniciarSesion');
    component.enviar();
    expect(auth.iniciarSesion).not.toHaveBeenCalled();
  });
});
