import { HttpErrorResponse } from '@angular/common/http';

import { mensajeErrorHttp } from './mensaje-error-http';

describe('mensajeErrorHttp', () => {
  it('should devolver mensaje del API cuando existe', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { mensaje: 'Archivo inválido' },
    });
    expect(mensajeErrorHttp(error)).toBe('Archivo inválido');
  });

  it('should mapear 503 sin cuerpo', () => {
    const error = new HttpErrorResponse({ status: 503, error: null });
    expect(mensajeErrorHttp(error)).toBe('El almacenamiento de archivos no está disponible.');
  });

  it('should mapear status 0', () => {
    const error = new HttpErrorResponse({ status: 0, error: null });
    expect(mensajeErrorHttp(error)).toBe('No fue posible conectar con el backend.');
  });

  it('should devolver generico para error no HTTP', () => {
    expect(mensajeErrorHttp(new Error('boom'))).toBe('No fue posible completar la operación.');
  });

  it('should devolver generico para otros status', () => {
    const error = new HttpErrorResponse({ status: 500, error: {} });
    expect(mensajeErrorHttp(error)).toBe('No fue posible completar la operación.');
  });
});
