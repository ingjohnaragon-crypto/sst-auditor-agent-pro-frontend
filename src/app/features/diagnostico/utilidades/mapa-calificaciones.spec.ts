import { mapaCalificaciones } from './mapa-calificaciones';

describe('mapaCalificaciones', () => {
  it('should indexar por estandar_id', () => {
    const mapa = mapaCalificaciones([
      { estandar_id: 'a', resultado: 'CUMPLE', puntaje: '1.00', observaciones: null },
    ]);
    expect(mapa['a'].resultado).toBe('CUMPLE');
  });

  it('should devolver vacio si no hay calificaciones', () => {
    expect(mapaCalificaciones(undefined)).toEqual({});
  });
});
