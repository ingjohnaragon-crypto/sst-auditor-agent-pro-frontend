import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogModule } from '@angular/cdk/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ServicioLoader, ServicioModal } from '@app/shared';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import { PaginaDashboardComponent } from './pagina-dashboard.component';

describe('PaginaDashboardComponent', () => {
  let fixture: ComponentFixture<PaginaDashboardComponent>;
  let loader: ServicioLoader;
  let modal: ServicioModal;
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
      imports: [PaginaDashboardComponent, DialogModule, OverlayModule],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
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
    loader = TestBed.inject(ServicioLoader);
    modal = TestBed.inject(ServicioModal);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.componentInstance.ngOnDestroy();
    loader.ocultar();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('should saludar con nombre y rol del usuario', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Hola, Ana Auditora');
    expect(texto).toContain('AUDITOR_SST');
  });

  it('should mostrar resumen y actividad reciente', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Puntaje 0312');
    expect(texto).toContain('Actividad reciente');
    expect(fixture.nativeElement.querySelector('app-tabla')).toBeTruthy();
    expect(texto).toContain('Inicio de sesión en SST-Audit Pro');
  });

  it('should mostrar alerta informativa de modulos en construccion', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('En construcción');
    expect(texto).toContain('diagnóstico y planes de mejora');
  });

  it('should no mostrar demos tecnicas fuera del accordion cerrado', () => {
    const details = (fixture.nativeElement as HTMLElement).querySelector('details');
    expect(details).toBeTruthy();
    expect(details?.open).toBeFalsy();
    // Los títulos de demo viven dentro de details; el primer viewport no es un
    // bloque dedicado "Demo …" fuera del accordion.
    const articulosFuera = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('section > article, section > header')
    );
    const textosFuera = articulosFuera.map((el) => el.textContent ?? '').join(' ');
    expect(textosFuera).not.toContain('Demo formulario dinámico');
    expect(textosFuera).not.toContain('Demo loader interactivo');
  });

  it('should abrir modal al CTA como empezar', () => {
    const abrir = jest.spyOn(modal, 'abrir');
    fixture.componentInstance.abrirComoEmpezar();
    expect(abrir).toHaveBeenCalled();
  });

  it('should actualizar resumen con loader y completar', fakeAsync(() => {
    const mostrar = jest.spyOn(loader, 'mostrar');
    const ocultar = jest.spyOn(loader, 'ocultar');
    fixture.componentInstance.actualizarResumen();
    expect(mostrar).toHaveBeenCalled();
    tick(1600);
    expect(ocultar).toHaveBeenCalled();
    expect(fixture.componentInstance.alertaExitoVisible).toBe(true);
  }));

  it('should mostrar CTA de autoevaluacion a roles de escritura', () => {
    const botones = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-boton')
    ).map((el) => el.textContent?.trim() ?? '');
    expect(botones.some((t) => t.includes('Nueva autoevaluación'))).toBe(true);
  });

  it('should ocultar CTA de autoevaluacion a rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    fixture.detectChanges();
    const botones = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-boton')
    ).map((el) => el.textContent?.trim() ?? '');
    expect(botones.some((t) => t.includes('Nueva autoevaluación'))).toBe(false);
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
    fixture.componentInstance.mostrarAccionRapida();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Las acciones rápidas estarán disponibles próximamente.'
    );
  });
});
