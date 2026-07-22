import { ServicioResumenHome } from './servicio-resumen-home';

describe('ServicioResumenHome', () => {
  let servicio: ServicioResumenHome;

  beforeEach(() => {
    servicio = new ServicioResumenHome();
  });

  it('should devolver al menos una fila de actividad', () => {
    const filas = servicio.obtenerActividad();
    expect(filas.length).toBeGreaterThanOrEqual(1);
  });

  it('should no mutar la constante interna al obtener actividad', () => {
    const a = servicio.obtenerActividad();
    const b = servicio.obtenerActividad();
    a[0].evento = 'mutado';
    expect(b[0].evento).not.toBe('mutado');
  });

  it('should refrescar sin mutar la lista base original', () => {
    const base = servicio.obtenerActividad();
    const refresco = servicio.refrescarActividad();
    expect(refresco[0].evento).toContain('Resumen de inicio actualizado');
    expect(servicio.obtenerActividad()[0].evento).toBe(base[0].evento);
  });
});
