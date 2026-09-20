import type { CalificacionEstandar, EstandarMinimo } from '../modelos';
import {
  avancesPorFase,
  cicloVecino,
  primeraFaseIncompleta,
  ultimaFaseConItems,
} from './avance-por-ciclo';

function estandar(id: string, ciclo: EstandarMinimo['ciclo_phva']): EstandarMinimo {
  return {
    id,
    ciclo_phva: ciclo,
    numeral: id,
    descripcion: id,
    valor_porcentual: '1.00',
  };
}

function calificacion(id: string): CalificacionEstandar {
  return { estandar_id: id, resultado: 'CUMPLE', puntaje: '1.00', observaciones: null };
}

describe('avance-por-ciclo', () => {
  const catalogo: EstandarMinimo[] = [
    estandar('p-1', 'PLANEAR'),
    estandar('h-1', 'HACER'),
    estandar('v-1', 'VERIFICAR'),
    estandar('a-1', 'ACTUAR'),
  ];

  it('should calcular avance por fase', () => {
    const avances = avancesPorFase(catalogo, { 'p-1': calificacion('p-1') });
    expect(avances).toHaveLength(4);
    expect(avances[0]).toMatchObject({ ciclo: 'PLANEAR', calificados: 1, total: 1, completa: true });
    expect(avances[1]).toMatchObject({ ciclo: 'HACER', calificados: 0, total: 1, completa: false });
  });

  it('should devolver la primera fase incompleta y Planear si todo esta listo', () => {
    expect(primeraFaseIncompleta(catalogo, { 'p-1': calificacion('p-1') })).toBe('HACER');
    expect(
      primeraFaseIncompleta(catalogo, {
        'p-1': calificacion('p-1'),
        'h-1': calificacion('h-1'),
        'v-1': calificacion('v-1'),
        'a-1': calificacion('a-1'),
      })
    ).toBe('PLANEAR');
  });

  it('should devolver la ultima fase con items', () => {
    expect(ultimaFaseConItems(catalogo)).toBe('ACTUAR');
    expect(ultimaFaseConItems([estandar('p-1', 'PLANEAR')])).toBe('PLANEAR');
    expect(ultimaFaseConItems([])).toBe('PLANEAR');
  });

  it('should devolver el ciclo vecino o null en los extremos', () => {
    expect(cicloVecino('PLANEAR', -1)).toBeNull();
    expect(cicloVecino('PLANEAR', 1)).toBe('HACER');
    expect(cicloVecino('ACTUAR', 1)).toBeNull();
    expect(cicloVecino('ACTUAR', -1)).toBe('VERIFICAR');
  });
});
