import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { ServicioLoader } from './servicio-loader';

describe('ServicioLoader', () => {
  let servicio: ServicioLoader;

  beforeEach(() => {
    servicio = new ServicioLoader();
  });

  it('should mostrar con defaults mergeados', async () => {
    servicio.mostrar({ titulo: 'Diagnóstico' });
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado).toMatchObject({
      visible: true,
      titulo: 'Diagnóstico',
      modo: 'bloqueante',
      cancelable: false,
      progreso: null,
    });
  });

  it('should reemplazar el loader activo en un segundo mostrar', async () => {
    servicio.mostrar({ titulo: 'Uno' });
    servicio.mostrar({ titulo: 'Dos', cancelable: true });
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado?.titulo).toBe('Dos');
    expect(estado?.cancelable).toBe(true);
  });

  it('should actualizarPaso solo el id indicado', async () => {
    servicio.mostrar({
      pasos: [
        { id: 'a', etiqueta: 'A', estado: 'activo' },
        { id: 'b', etiqueta: 'B', estado: 'pendiente' },
      ],
    });
    servicio.actualizarPaso('b', 'completado', 'ok');
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado?.pasos[0].estado).toBe('activo');
    expect(estado?.pasos[1]).toMatchObject({
      estado: 'completado',
      detalle: 'ok',
    });
  });

  it('should ocultar emitiendo null', async () => {
    servicio.mostrar();
    servicio.ocultar();
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado).toBeNull();
  });

  it('should notificar cancelacion y ocultar', async () => {
    const cancelSpy = jest.fn();
    servicio.alCancelar$.subscribe(cancelSpy);
    servicio.mostrar({ cancelable: true });
    servicio.notificarCancelacion();
    expect(cancelSpy).toHaveBeenCalled();
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado).toBeNull();
  });

  it('should actualizar ser no-op si no hay loader', async () => {
    servicio.actualizar({ titulo: 'X' });
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado).toBeNull();
  });

  it('should actualizar campos cuando hay loader activo', async () => {
    servicio.mostrar({ titulo: 'A', progreso: 0 });
    servicio.actualizar({ progreso: 55, mensaje: 'Avance' });
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado).toMatchObject({ titulo: 'A', progreso: 55, mensaje: 'Avance' });
  });

  it('should actualizarPaso ser no-op sin loader y preservar detalle si no se pasa', async () => {
    servicio.actualizarPaso('x', 'error');
    expect(await firstValueFrom(servicio.estado$.pipe(take(1)))).toBeNull();

    servicio.mostrar({
      pasos: [{ id: 'a', etiqueta: 'A', estado: 'activo', detalle: 'previo' }],
    });
    servicio.actualizarPaso('a', 'completado');
    const estado = await firstValueFrom(servicio.estado$.pipe(take(1)));
    expect(estado?.pasos[0]).toMatchObject({
      estado: 'completado',
      detalle: 'previo',
    });
  });
});
