import { HttpErrorResponse } from '@angular/common/http';

import { mensajeErrorHttp } from './mensaje-error-http';

describe('mensajeErrorHttp', () => {
  it('should usar el mensaje del API cuando existe', () => {
    const error = new HttpErrorResponse({
      error: { mensaje: 'No existe' },
      status: 404,
      statusText: 'Not Found',
    });
    expect(mensajeErrorHttp(error)).toBe('No existe');
  });

  it('should describir un fallo de conexion', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    expect(mensajeErrorHttp(error)).toBe('No fue posible conectar con el backend.');
  });

  it('should usar un mensaje generico si no hay cuerpo', () => {
    const error = new HttpErrorResponse({
      error: {},
      status: 500,
      statusText: 'Server Error',
    });
    expect(mensajeErrorHttp(error)).toBe('No fue posible completar la operación.');
  });

  it('should usar un mensaje generico si el error no es HTTP', () => {
    expect(mensajeErrorHttp(new Error('boom'))).toBe('No fue posible completar la operación.');
  });
});
