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

  const usuario: UsuarioAutenticado = {
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  };

  beforeEach(async () => {
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
                get: (key: string) => (key === 'returnUrl' ? '/ejemplo-sensible' : null),
              },
            },
          },
        },
        ServicioAutenticacion,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaLoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mostrar identidad visual y formulario accesible', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('SST-Audit');
    expect(element.querySelector('input[autocomplete="username"]')).toBeTruthy();
    expect(element.querySelector('input[autocomplete="current-password"]')).toBeTruthy();
    expect(element.querySelector('button[type="submit"]')?.textContent).toContain('Iniciar sesión');
  });

  it('should navegar a returnUrl tras login exitoso', () => {
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

  it('should mostrar error si el login falla', () => {
    component.formulario.setValue({
      correo: 'ana@empresa.com',
      contrasena: 'secreto12',
    });
    component.enviar();

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    loginReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.error()).toContain('No se pudo iniciar sesión');
  });

  it('should no enviar si el formulario es invalido', () => {
    const auth = TestBed.inject(ServicioAutenticacion);
    jest.spyOn(auth, 'iniciarSesion');
    component.enviar();
    expect(auth.iniciarSesion).not.toHaveBeenCalled();
  });
});
