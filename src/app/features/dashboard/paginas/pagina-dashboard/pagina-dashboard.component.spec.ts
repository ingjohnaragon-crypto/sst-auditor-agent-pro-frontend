import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import { PaginaDashboardComponent } from './pagina-dashboard.component';

describe('PaginaDashboardComponent', () => {
  let fixture: ComponentFixture<PaginaDashboardComponent>;
  const usuario = signal<UsuarioAutenticado | null>(null);

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: 'usuario-1',
      nombre_completo: 'Ana Auditora',
      correo: 'ana@empresa.com',
      rol,
    });
  }

  beforeEach(async () => {
    establecerUsuario('AUDITOR_SST');
    await TestBed.configureTestingModule({
      imports: [PaginaDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: ServicioAutenticacion,
          useValue: {
            usuarioActual: usuario.asReadonly(),
            cerrarSesion: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaDashboardComponent);
    fixture.detectChanges();
  });

  it('should mostrar resumen y datos de la sesion', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;

    expect(texto).toContain('Puntaje 0312');
    expect(texto).toContain('AUDITOR_SST');
    expect(texto).toContain('ana@empresa.com');
  });

  it('should mostrar acceso de auditoria a roles de escritura', () => {
    const enlace = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/ejemplo-sensible"]'
    );

    expect(enlace).toBeTruthy();
  });

  it('should ocultar acceso de auditoria a rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    fixture.detectChanges();

    const enlace = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/ejemplo-sensible"]'
    );
    expect(enlace).toBeNull();
  });

  it('should mostrar respuesta al usar la accion rapida compartida', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector(
      'app-boton button'
    ) as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Las acciones rápidas estarán disponibles próximamente.'
    );
  });

  it('should mostrar la demo del formulario dinamico', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Demo formulario dinámico');
    expect(texto).toContain('Correo de contacto');
    expect(fixture.nativeElement.querySelector('app-formulario-dinamico')).toBeTruthy();
  });
});
