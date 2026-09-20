import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DialogModule } from '@angular/cdk/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ServicioLoader, ServicioModal } from '@app/shared';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { Autoevaluacion, Empresa, RespuestaCumplimientoPhva } from '../../../diagnostico/modelos';
import { ServicioAutoevaluaciones } from '../../../diagnostico/servicios/servicio-autoevaluaciones';
import { ServicioCumplimientoPhva } from '../../../diagnostico/servicios/servicio-cumplimiento-phva';
import { ServicioEmpresas } from '../../../diagnostico/servicios/servicio-empresas';
import { PaginaDashboardComponent } from './pagina-dashboard.component';

describe('PaginaDashboardComponent', () => {
  let fixture: ComponentFixture<PaginaDashboardComponent> | undefined;
  let loader: ServicioLoader;
  let modal: ServicioModal;
  const usuario = signal<UsuarioAutenticado | null>(null);
  const listar = jest.fn();
  const listarPorEmpresa = jest.fn();
  const obtenerCumplimiento = jest.fn();

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: 'usuario-1',
      nombre_completo: 'Ana Auditora',
      correo: 'ana@empresa.com',
      rol,
    });
  }

  async function crearComponente(): Promise<void> {
    fixture?.componentInstance?.ngOnDestroy();
    TestBed.resetTestingModule();
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
        { provide: ServicioEmpresas, useValue: { listar } },
        { provide: ServicioAutoevaluaciones, useValue: { listarPorEmpresa } },
        { provide: ServicioCumplimientoPhva, useValue: { obtenerCumplimiento } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaDashboardComponent);
    loader = TestBed.inject(ServicioLoader);
    modal = TestBed.inject(ServicioModal);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    establecerUsuario('AUDITOR_SST');
    listar.mockReset().mockReturnValue(of([]));
    listarPorEmpresa.mockReset().mockReturnValue(of([]));
    obtenerCumplimiento.mockReset().mockReturnValue(of(null));
    await crearComponente();
  });

  afterEach(() => {
    fixture?.componentInstance.ngOnDestroy();
    loader.ocultar();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('should saludar con nombre y rol del usuario', () => {
    const texto = (fixture!.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Hola, Ana Auditora');
    expect(texto).toContain('AUDITOR_SST');
  });

  it('should mostrar resumen y actividad reciente', () => {
    const texto = (fixture!.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Puntaje 0312');
    expect(texto).toContain('Actividad reciente');
    expect(fixture!.nativeElement.querySelector('app-tabla')).toBeTruthy();
    expect(texto).toContain('Inicio de sesión en SST-Audit Pro');
  });

  it('should mostrar alerta informativa del alcance actual', () => {
    const texto = (fixture!.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Alcance actual');
    expect(texto).toContain('cumplimiento PHVA ya están disponibles');
  });

  it('should no mostrar demos tecnicas fuera del accordion cerrado', () => {
    const details = (fixture!.nativeElement as HTMLElement).querySelector('details');
    expect(details).toBeTruthy();
    expect(details?.open).toBeFalsy();
    const articulosFuera = Array.from(
      (fixture!.nativeElement as HTMLElement).querySelectorAll('section > article, section > header')
    );
    const textosFuera = articulosFuera.map((el) => el.textContent ?? '').join(' ');
    expect(textosFuera).not.toContain('Demo formulario dinámico');
    expect(textosFuera).not.toContain('Demo loader interactivo');
  });

  it('should abrir modal al CTA como empezar', () => {
    const abrir = jest.spyOn(modal, 'abrir');
    fixture!.componentInstance.abrirComoEmpezar();
    expect(abrir).toHaveBeenCalled();
  });

  it('should actualizar resumen con loader y completar', fakeAsync(() => {
    const mostrar = jest.spyOn(loader, 'mostrar');
    const ocultar = jest.spyOn(loader, 'ocultar');
    fixture!.componentInstance.actualizarResumen();
    expect(mostrar).toHaveBeenCalled();
    tick(1600);
    expect(ocultar).toHaveBeenCalled();
    expect(fixture!.componentInstance.alertaExitoVisible).toBe(true);
  }));

  it('should mostrar CTA de autoevaluacion a roles de escritura', () => {
    const botones = Array.from(
      (fixture!.nativeElement as HTMLElement).querySelectorAll('app-boton')
    ).map((el) => el.textContent?.trim() ?? '');
    expect(botones.some((t) => t.includes('Nueva autoevaluación'))).toBe(true);
  });

  it('should ocultar CTA de autoevaluacion a rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    fixture!.detectChanges();
    const botones = Array.from(
      (fixture!.nativeElement as HTMLElement).querySelectorAll('app-boton')
    ).map((el) => el.textContent?.trim() ?? '');
    expect(botones.some((t) => t.includes('Nueva autoevaluación'))).toBe(false);
  });

  it('should ocultar acceso de auditoria a rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    fixture!.detectChanges();
    const enlace = (fixture!.nativeElement as HTMLElement).querySelector(
      'a[href="/ejemplo-sensible"]'
    );
    expect(enlace).toBeNull();
  });

  it('should navegar a diagnostico al CTA de nueva autoevaluacion', () => {
    const router = TestBed.inject(Router);
    const navegar = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture!.componentInstance.mostrarNuevaAutoevaluacion();
    expect(navegar).toHaveBeenCalledWith(['/diagnostico']);
    expect(fixture!.nativeElement.querySelector('a[href="/diagnostico"]')).toBeTruthy();
  });

  it('should mostrar vacio PHVA cuando no hay empresas', () => {
    const texto = (fixture!.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('No hay autoevaluación para mostrar el cumplimiento PHVA.');
    expect(fixture!.nativeElement.querySelector('[aria-label="Fases PHVA"]')).toBeNull();
    expect(fixture!.nativeElement.querySelectorAll('[role="progressbar"]').length).toBe(0);
  });

  it('should mostrar el porcentaje del API cuando hay autoevaluacion', async () => {
    const empresas: Empresa[] = [{ id: 'e-1', razon_social: 'Acme', nit: '900' }];
    const historico: Autoevaluacion[] = [
      {
        id: 'ae-1',
        empresa_id: 'e-1',
        usuario_id: 'u-1',
        fecha: '2026-09-01',
        puntaje_total: '72.50',
        requiere_plan_mejora: true,
        calificaciones: [],
        fecha_creacion: '2026-09-01T10:00:00Z',
        fecha_actualizacion: '2026-09-01T10:00:00Z',
      },
    ];
    const cumplimiento: RespuestaCumplimientoPhva = {
      autoevaluacion_id: 'ae-1',
      empresa_id: 'e-1',
      perfil: 'TABLA_7',
      puntaje_total: '72.50',
      umbral_plan_mejora: '85.00',
      requiere_plan_mejora: true,
      finalizada: true,
      fases: [
        {
          ciclo_phva: 'PLANEAR',
          peso_maximo: '25.00',
          puntaje_obtenido: '20.00',
          porcentaje_cumplimiento: '80.00',
          brecha: '5.00',
        },
      ],
    };

    listar.mockReturnValue(of(empresas));
    listarPorEmpresa.mockReturnValue(of(historico));
    obtenerCumplimiento.mockReturnValue(of(cumplimiento));
    establecerUsuario('AUDITOR_SST');
    await crearComponente();

    const texto = (fixture!.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('80.00');
    expect(texto).toContain('72.50 %');
    expect(obtenerCumplimiento).toHaveBeenCalledWith('ae-1');
  });

  it('should mostrar respuesta al usar la accion rapida compartida', () => {
    fixture!.componentInstance.mostrarAccionRapida();
    fixture!.detectChanges();
    expect((fixture!.nativeElement as HTMLElement).textContent).toContain(
      'Las acciones rápidas estarán disponibles próximamente.'
    );
  });

  it('should limpiar puntaje y autoevaluacion al vaciar la empresa', () => {
    fixture!.componentInstance.puntaje0312 = '80 %';
    fixture!.componentInstance.seleccionarEmpresa('');
    expect(fixture!.componentInstance.autoevaluacionId).toBeNull();
    expect(fixture!.componentInstance.puntaje0312).toBe('—');
  });

  it('should actualizar la tarjeta 0312 al cargar cumplimiento', () => {
    fixture!.componentInstance.alCargarCumplimiento({
      autoevaluacion_id: 'ae-1',
      empresa_id: 'e-1',
      perfil: 'TABLA_7',
      puntaje_total: '90.00',
      umbral_plan_mejora: '85.00',
      requiere_plan_mejora: false,
      finalizada: true,
      fases: [],
    });
    expect(fixture!.componentInstance.puntaje0312).toBe('90.00 %');
    expect(fixture!.componentInstance.subtituloPuntaje0312).toContain('Cumple el umbral');

    fixture!.componentInstance.alCargarCumplimiento(null);
    expect(fixture!.componentInstance.puntaje0312).toBe('—');
  });

  it('should mostrar error si falla el historico de autoevaluaciones', () => {
    listarPorEmpresa.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { mensaje: 'Empresa no disponible' },
            status: 404,
            statusText: 'Not Found',
          })
      )
    );
    fixture!.componentInstance.seleccionarEmpresa('e-1');
    fixture!.detectChanges();
    expect(fixture!.componentInstance.autoevaluacionId).toBeNull();
    expect((fixture!.nativeElement as HTMLElement).textContent).toContain('Empresa no disponible');
    fixture!.componentInstance.reintentarSelector();
    expect(listarPorEmpresa).toHaveBeenCalledTimes(2);
  });

  it('should mostrar error si falla el listado de empresas', async () => {
    listar.mockReset().mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: null,
            status: 0,
            statusText: 'Unknown Error',
          })
      )
    );
    await crearComponente();
    expect(fixture!.componentInstance.empresas).toEqual([]);
    expect((fixture!.nativeElement as HTMLElement).textContent).toContain(
      'No fue posible conectar con el backend.'
    );
    listar.mockReturnValue(of([]));
    fixture!.componentInstance.reintentarSelector();
    expect(listar).toHaveBeenCalledTimes(2);
  });
});
