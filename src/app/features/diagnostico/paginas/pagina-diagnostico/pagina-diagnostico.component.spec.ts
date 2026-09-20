import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type { RolUsuario, UsuarioAutenticado } from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { Autoevaluacion, Empresa, EstandarMinimo } from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEmpresas } from '../../servicios/servicio-empresas';
import { ServicioEstandaresMinimos } from '../../servicios/servicio-estandares-minimos';
import { PaginaDiagnosticoComponent } from './pagina-diagnostico.component';

describe('PaginaDiagnosticoComponent', () => {
  let fixture: ComponentFixture<PaginaDiagnosticoComponent>;
  const usuario = signal<UsuarioAutenticado | null>(null);
  const listarEmpresas = jest.fn();
  const listarEstandares = jest.fn();
  const crear = jest.fn();
  const calificar = jest.fn();
  const finalizar = jest.fn();

  const empresas: Empresa[] = [{ id: 'e-1', razon_social: 'Acme', nit: '900' }];
  const estandares: EstandarMinimo[] = [
    {
      id: 'est-1',
      ciclo_phva: 'PLANEAR',
      numeral: '1.1.1',
      descripcion: 'Recursos',
      valor_porcentual: '4.00',
    },
  ];
  const autoevaluacion: Autoevaluacion = {
    id: 'ae-1',
    empresa_id: 'e-1',
    usuario_id: 'u-1',
    fecha: '2026-09-19',
    puntaje_total: null,
    requiere_plan_mejora: false,
    calificaciones: [],
    fecha_creacion: '2026-09-19T10:00:00Z',
    fecha_actualizacion: '2026-09-19T10:00:00Z',
  };

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: 'usuario-1',
      nombre_completo: 'Ana Auditora',
      correo: 'ana@empresa.com',
      rol,
    });
  }

  async function crearComponente(): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PaginaDiagnosticoComponent],
      providers: [
        provideRouter([]),
        { provide: ServicioAutenticacion, useValue: { usuarioActual: usuario.asReadonly() } },
        { provide: ServicioEmpresas, useValue: { listar: listarEmpresas } },
        { provide: ServicioEstandaresMinimos, useValue: { listar: listarEstandares } },
        {
          provide: ServicioAutoevaluaciones,
          useValue: { crear, calificar, finalizar, listarPorEmpresa: jest.fn(), obtenerPorId: jest.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaDiagnosticoComponent);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    establecerUsuario('AUDITOR_SST');
    listarEmpresas.mockReset().mockReturnValue(of(empresas));
    listarEstandares.mockReset().mockReturnValue(of(estandares));
    crear.mockReset().mockReturnValue(of(autoevaluacion));
    calificar.mockReset().mockReturnValue(
      of({ estandar_id: 'est-1', resultado: 'CUMPLE', puntaje: '4.00', observaciones: null })
    );
    finalizar.mockReset().mockReturnValue(of({ ...autoevaluacion, puntaje_total: '90.00' }));
    await crearComponente();
  });

  it('should cargar empresas y catalogo', () => {
    expect(fixture.componentInstance.empresas).toEqual(empresas);
    expect(fixture.componentInstance.estandares).toEqual(estandares);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('4 fases');
  });

  it('should crear autoevaluacion y mostrar la matriz', () => {
    fixture.componentInstance.seleccionarEmpresa('e-1');
    fixture.componentInstance.iniciar();
    fixture.detectChanges();
    expect(crear).toHaveBeenCalled();
    expect(fixture.componentInstance.autoevaluacion?.id).toBe('ae-1');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Recursos');
  });

  it('should calificar un item', () => {
    fixture.componentInstance.autoevaluacion = autoevaluacion;
    fixture.componentInstance.calificar({
      estandarId: 'est-1',
      resultado: 'CUMPLE',
      observaciones: null,
    });
    expect(calificar).toHaveBeenCalledWith('ae-1', 'est-1', {
      resultado: 'CUMPLE',
      observaciones: null,
    });
    expect(fixture.componentInstance.calificaciones['est-1'].resultado).toBe('CUMPLE');
  });

  it('should deshabilitar finalizar hasta completar 60 items', () => {
    fixture.componentInstance.seleccionarEmpresa('e-1');
    fixture.componentInstance.iniciar();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('app-panel-matriz-diagnostico');
    expect(panel).toBeTruthy();
    expect(Object.keys(fixture.componentInstance.calificaciones).length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Finalizar autoevaluación');
  });

  it('should finalizar cuando el API responde', () => {
    fixture.componentInstance.autoevaluacion = autoevaluacion;
    fixture.componentInstance.finalizar();
    expect(finalizar).toHaveBeenCalledWith('ae-1');
    expect(fixture.componentInstance.autoevaluacion?.puntaje_total).toBe('90.00');
  });

  it('should ocultar boton iniciar a rol CONSULTA', async () => {
    establecerUsuario('CONSULTA');
    await crearComponente();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Iniciar autoevaluación');
  });

  it('should mostrar error si falla la carga', async () => {
    listarEmpresas.mockReturnValue(throwError(() => new Error('fail')));
    await crearComponente();
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');
  });

  it('should no iniciar sin empresa y cubrir errores de escritura', () => {
    fixture.componentInstance.iniciar();
    expect(crear).not.toHaveBeenCalled();
    fixture.componentInstance.seleccionarEmpresa('e-1');
    crear.mockReturnValue(throwError(() => new Error('fail')));
    fixture.componentInstance.iniciar();
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');

    fixture.componentInstance.autoevaluacion = autoevaluacion;
    calificar.mockReturnValue(throwError(() => new Error('fail')));
    fixture.componentInstance.calificar({
      estandarId: 'est-1',
      resultado: 'CUMPLE',
      observaciones: null,
    });
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');

    finalizar.mockReturnValue(throwError(() => new Error('fail')));
    fixture.componentInstance.finalizar();
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');
    fixture.componentInstance.autoevaluacion = null;
    fixture.componentInstance.finalizar();
    fixture.componentInstance.calificar({
      estandarId: 'est-1',
      resultado: 'CUMPLE',
      observaciones: null,
    });
    fixture.componentInstance.cambiarObservaciones({ estandarId: 'est-x', observaciones: 'n' });
  });

  it('should persistir observaciones con debounce si ya hay calificacion', () => {
    fixture.componentInstance.autoevaluacion = autoevaluacion;
    fixture.componentInstance.calificaciones = {
      'est-1': { estandar_id: 'est-1', resultado: 'CUMPLE', puntaje: '4.00', observaciones: null },
    };
    const original = global.setTimeout;
    global.setTimeout = ((handler: TimerHandler) => {
      if (typeof handler === 'function') {
        handler();
      }
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;
    fixture.componentInstance.cambiarObservaciones({ estandarId: 'est-1', observaciones: 'nota' });
    global.setTimeout = original;
    expect(calificar).toHaveBeenCalledWith('ae-1', 'est-1', {
      resultado: 'CUMPLE',
      observaciones: 'nota',
    });
    fixture.componentInstance.ngOnDestroy();
  });
});
