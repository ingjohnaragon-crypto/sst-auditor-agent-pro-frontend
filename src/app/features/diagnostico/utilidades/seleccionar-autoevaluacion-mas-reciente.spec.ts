import {
  seleccionarAutoevaluacionMasReciente,
  type AutoevaluacionOrdenable,
} from './seleccionar-autoevaluacion-mas-reciente';

function resumen(
  parcial: Partial<AutoevaluacionOrdenable> & Pick<AutoevaluacionOrdenable, 'id'>
): AutoevaluacionOrdenable {
  return {
    fecha: '2026-01-01',
    fecha_creacion: '2026-01-01T00:00:00Z',
    ...parcial,
  };
}

describe('seleccionarAutoevaluacionMasReciente', () => {
  it('should devolver null cuando la lista esta vacia', () => {
    expect(seleccionarAutoevaluacionMasReciente([])).toBeNull();
  });

  it('should preferir la fecha mas reciente y desempatar por fecha_creacion', () => {
    const actual = seleccionarAutoevaluacionMasReciente([
      resumen({ id: 'antigua', fecha: '2026-01-01', fecha_creacion: '2026-01-01T12:00:00Z' }),
      resumen({ id: 'empate-vieja', fecha: '2026-09-01', fecha_creacion: '2026-09-01T08:00:00Z' }),
      resumen({ id: 'reciente', fecha: '2026-09-01', fecha_creacion: '2026-09-01T18:00:00Z' }),
    ]);

    expect(actual?.id).toBe('reciente');
  });
});
