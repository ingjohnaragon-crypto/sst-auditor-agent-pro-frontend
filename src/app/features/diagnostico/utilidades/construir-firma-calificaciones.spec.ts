import type { CalificacionEstandar } from '../modelos';
import { construirFirmaCalificaciones } from './construir-firma-calificaciones';

function calificacion(
  parcial: Pick<CalificacionEstandar, 'estandar_id'> & Partial<CalificacionEstandar>
): CalificacionEstandar {
  return {
    resultado: 'CUMPLE',
    puntaje: '1.00',
    observaciones: null,
    ...parcial,
  };
}

describe('construirFirmaCalificaciones', () => {
  it('should devolver vacio cuando no hay calificaciones', () => {
    expect(construirFirmaCalificaciones({})).toBe('');
  });

  it('should ordenar por estandar y reflejar resultado y puntaje', () => {
    const firma = construirFirmaCalificaciones({
      b: calificacion({ estandar_id: 'b', resultado: 'NO_CUMPLE', puntaje: '0.00' }),
      a: calificacion({ estandar_id: 'a', resultado: 'CUMPLE', puntaje: '2.00' }),
    });

    expect(firma).toBe('a:CUMPLE:2.00|b:NO_CUMPLE:0.00');
  });
});
