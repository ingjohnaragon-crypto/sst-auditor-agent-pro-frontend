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

  it('should mapear detail de FastAPI', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { detail: 'Internal Server Error' },
    });
    expect(mensajeErrorHttp(error)).toBe('Internal Server Error');
  });

  it('should mapear cuerpo string JSON', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: JSON.stringify({ mensaje: 'Tipo no permitido' }),
    });
    expect(mensajeErrorHttp(error)).toBe('Tipo no permitido');
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

  it('should devolver mensaje de servidor para 500 sin cuerpo', () => {
    const error = new HttpErrorResponse({ status: 500, error: {} });
    expect(mensajeErrorHttp(error)).toBe(
      'El servidor no pudo completar la operación. Intenta de nuevo más tarde.'
    );
  });

  it('should distinguir error blob de descarga', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: new Blob(['{"detail":"x"}'], { type: 'application/json' }),
    });
    expect(mensajeErrorHttp(error)).toBe('No fue posible completar la descarga.');
  });
});
