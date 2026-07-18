import { resolverUrlRetorno } from './resolver-url-retorno';

describe('resolverUrlRetorno', () => {
  it('should devolver /dashboard si es null o vacio', () => {
    expect(resolverUrlRetorno(null)).toBe('/dashboard');
    expect(resolverUrlRetorno('')).toBe('/dashboard');
  });

  it('should aceptar rutas relativas internas', () => {
    expect(resolverUrlRetorno('/ejemplo-sensible')).toBe('/ejemplo-sensible');
  });

  it('should rechazar open redirects', () => {
    expect(resolverUrlRetorno('//evil.com')).toBe('/dashboard');
    expect(resolverUrlRetorno('https://evil.com')).toBe('/dashboard');
  });
});
