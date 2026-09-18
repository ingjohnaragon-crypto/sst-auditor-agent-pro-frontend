import { ServicioCalculoRiesgoGtc45 } from './servicio-calculo-riesgo-gtc45';

describe('ServicioCalculoRiesgoGtc45', () => {
  const servicio = new ServicioCalculoRiesgoGtc45();

  it('should calcular caso extremo I / NO_ACEPTABLE', () => {
    expect(servicio.calcular(10, 4, 100)).toEqual({
      nivel_probabilidad: 40,
      nivel_riesgo: 4000,
      interpretacion_nr: 'I',
      aceptabilidad: 'NO_ACEPTABLE',
    });
  });

  it('should calcular caso II / ACEPTABLE_CON_CONTROL', () => {
    expect(servicio.calcular(10, 3, 10)).toEqual({
      nivel_probabilidad: 30,
      nivel_riesgo: 300,
      interpretacion_nr: 'II',
      aceptabilidad: 'ACEPTABLE_CON_CONTROL',
    });
  });

  it('should calcular caso III / MEJORABLE', () => {
    expect(servicio.calcular(2, 2, 25)).toEqual({
      nivel_probabilidad: 4,
      nivel_riesgo: 100,
      interpretacion_nr: 'III',
      aceptabilidad: 'MEJORABLE',
    });
  });

  it('should aplicar D1: ND=0 produce IV / ACEPTABLE', () => {
    expect(servicio.calcular(0, 4, 100)).toEqual({
      nivel_probabilidad: 0,
      nivel_riesgo: 0,
      interpretacion_nr: 'IV',
      aceptabilidad: 'ACEPTABLE',
    });
  });

  it('should devolver null ante valores fuera de los sets GTC 45', () => {
    expect(servicio.calcular(5, 4, 100)).toBeNull();
    expect(servicio.calcular(10, 5, 100)).toBeNull();
    expect(servicio.calcular(10, 4, 50)).toBeNull();
    expect(servicio.calcular(null, 4, 100)).toBeNull();
    expect(servicio.calcular(undefined, 4, 100)).toBeNull();
  });

  it('should devolver null si NR cae fuera de los rangos A.3', () => {
    expect(servicio.interpretarNr(30)).toBeNull();
    expect(servicio.interpretarNr(130)).toBeNull();
    expect(servicio.interpretarNr(550)).toBeNull();
  });
});
