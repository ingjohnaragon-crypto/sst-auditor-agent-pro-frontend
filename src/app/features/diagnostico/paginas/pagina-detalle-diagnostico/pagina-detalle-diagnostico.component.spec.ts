import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type { UsuarioAutenticado } from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { Autoevaluacion, EstandarMinimo } from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEstandaresMinimos } from '../../servicios/servicio-estandares-minimos';
import { PaginaDetalleDiagnosticoComponent } from './pagina-detalle-diagnostico.component';

describe('PaginaDetalleDiagnosticoComponent', () => {
  const usuario = signal<UsuarioAutenticado | null>({
    id: 'u-1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  });
  const estandares: EstandarMinimo[] = [
    {
      id: 'est-1',
      ciclo_phva: 'PLANEAR',
      numeral: '1.1.1',
      descripcion: 'Recursos',
      valor_porcentual: '4.00',
    },
  ];
  const borrador: Autoevaluacion = {
    id: 'ae-1',
    empresa_id: 'e-1',
    usuario_id: 'u-1',
    fecha: '2026-09-19',
    puntaje_total: null,
    requiere_plan_mejora: false,
    calificaciones: [
      { estandar_id: 'est-1', resultado: 'CUMPLE', puntaje: '4.00', observaciones: null },
    ],
    fecha_creacion: '2026-09-19T10:00:00Z',
    fecha_actualizacion: '2026-09-19T10:00:00Z',
  };
  const finalizada: Autoevaluacion = { ...borrador, puntaje_total: '90.00' };
  const calificar = jest.fn();
  const finalizar = jest.fn();
  const obtenerPorId = jest.fn();

  async function crearComponente(
    autoevaluacion: Autoevaluacion | null,
    id: string | null = 'ae-1'
  ): Promise<ComponentFixture<PaginaDetalleDiagnosticoComponent>> {
    TestBed.resetTestingModule();
    obtenerPorId.mockReset().mockReturnValue(autoevaluacion ? of(autoevaluacion) : throwError(() => new Error('fail')));
    calificar.mockReset().mockReturnValue(
      of({ estandar_id: 'est-1', resultado: 'NO_CUMPLE', puntaje: '0.00', observaciones: 'x' })
    );
    finalizar.mockReset().mockReturnValue(of(finalizada));
    await TestBed.configureTestingModule({
      imports: [PaginaDetalleDiagnosticoComponent],
      providers: [
        provideRouter([]),
        { provide: ServicioAutenticacion, useValue: { usuarioActual: usuario.asReadonly() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(id ? { id } : {}),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: ServicioAutoevaluaciones,
          useValue: { obtenerPorId, calificar, finalizar },
        },
        { provide: ServicioEstandaresMinimos, useValue: { listar: () => of(estandares) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PaginaDetalleDiagnosticoComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should mostrar el detalle en solo lectura tras finalizada', async () => {
    const fixture = await crearComponente(finalizada);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('90.00');
    expect(texto).not.toContain('Finalizar autoevaluación');
  });

  it('should mostrar error si falta el id', async () => {
    const fixture = await crearComponente(borrador, null);
    expect(fixture.componentInstance.mensajeError).toBe('No se indicó la autoevaluación.');
  });

  it('should mostrar error si falla la carga', async () => {
    const fixture = await crearComponente(null);
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');
  });

  it('should calificar, debounce observaciones y finalizar', async () => {
    const fixture = await crearComponente(borrador);
    fixture.componentInstance.calificar({
      estandarId: 'est-1',
      resultado: 'NO_CUMPLE',
      observaciones: 'x',
    });
    expect(calificar).toHaveBeenCalled();
    const original = global.setTimeout;
    global.setTimeout = ((handler: TimerHandler) => {
      if (typeof handler === 'function') {
        handler();
      }
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;
    fixture.componentInstance.cambiarObservaciones({ estandarId: 'est-1', observaciones: 'nota' });
    global.setTimeout = original;
    expect(calificar).toHaveBeenCalledTimes(2);
    fixture.componentInstance.finalizar();
    expect(finalizar).toHaveBeenCalledWith('ae-1');
    expect(fixture.componentInstance.autoevaluacion?.puntaje_total).toBe('90.00');
    fixture.componentInstance.ngOnDestroy();
  });

  it('should mapear errores de calificar y finalizar', async () => {
    const fixture = await crearComponente(borrador);
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
    fixture.componentInstance.cambiarObservaciones({ estandarId: 'nope', observaciones: 'x' });
  });
});
