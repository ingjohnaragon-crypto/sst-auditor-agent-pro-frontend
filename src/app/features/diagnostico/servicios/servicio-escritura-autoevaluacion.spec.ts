import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import type { Autoevaluacion } from '../modelos';
import { ServicioAutoevaluaciones } from './servicio-autoevaluaciones';
import { ServicioEscrituraAutoevaluacion } from './servicio-escritura-autoevaluacion';

describe('ServicioEscrituraAutoevaluacion', () => {
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
  const calificar = jest.fn();
  const finalizar = jest.fn();

  beforeEach(() => {
    calificar.mockReset().mockReturnValue(
      of({ estandar_id: 'est-1', resultado: 'CUMPLE', puntaje: '4.00', observaciones: null })
    );
    finalizar.mockReset().mockReturnValue(of({ ...autoevaluacion, puntaje_total: '90.00' }));
    TestBed.configureTestingModule({
      providers: [
        ServicioEscrituraAutoevaluacion,
        { provide: ServicioAutoevaluaciones, useValue: { calificar, finalizar } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
      ],
    });
  });

  it('should persistir una calificacion y cancelar la peticion previa del mismo item', () => {
    const escritura = TestBed.inject(ServicioEscrituraAutoevaluacion);
    escritura.establecer(autoevaluacion);
    escritura.calificar({ estandarId: 'est-1', resultado: 'CUMPLE', observaciones: null });
    escritura.calificar({ estandarId: 'est-1', resultado: 'NO_CUMPLE', observaciones: null });
    expect(calificar).toHaveBeenCalledTimes(2);
    expect(escritura.calificaciones['est-1'].resultado).toBe('CUMPLE');
  });

  it('should debounce observaciones si ya hay calificacion', () => {
    const escritura = TestBed.inject(ServicioEscrituraAutoevaluacion);
    escritura.establecer(autoevaluacion);
    escritura.calificaciones = {
      'est-1': { estandar_id: 'est-1', resultado: 'CUMPLE', puntaje: '4.00', observaciones: null },
    };
    const original = global.setTimeout;
    global.setTimeout = ((handler: TimerHandler) => {
      if (typeof handler === 'function') {
        handler();
      }
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout;
    escritura.cambiarObservaciones({ estandarId: 'est-1', observaciones: 'nota' });
    escritura.cambiarObservaciones({ estandarId: 'nope', observaciones: 'x' });
    global.setTimeout = original;
    expect(calificar).toHaveBeenCalledWith('ae-1', 'est-1', {
      resultado: 'CUMPLE',
      observaciones: 'nota',
    });
    escritura.destruir();
  });

  it('should finalizar y mapear errores de escritura', () => {
    const escritura = TestBed.inject(ServicioEscrituraAutoevaluacion);
    escritura.finalizar();
    expect(finalizar).not.toHaveBeenCalled();
    escritura.establecer(autoevaluacion);
    escritura.finalizar();
    expect(escritura.autoevaluacion?.puntaje_total).toBe('90.00');
    finalizar.mockReturnValue(throwError(() => new Error('fail')));
    escritura.finalizar();
    expect(escritura.mensajeError).toBe('No fue posible completar la operación.');
    calificar.mockReturnValue(throwError(() => new Error('fail')));
    escritura.calificar({ estandarId: 'est-1', resultado: 'CUMPLE', observaciones: null });
    expect(escritura.mensajeError).toBe('No fue posible completar la operación.');
    escritura.reiniciar();
    expect(escritura.autoevaluacion).toBeNull();
    escritura.calificar({ estandarId: 'est-1', resultado: 'CUMPLE', observaciones: null });
    escritura.destruir();
  });
});
