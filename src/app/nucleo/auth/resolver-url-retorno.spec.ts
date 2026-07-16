import { resolverUrlRetorno } from './resolver-url-retorno';

describe('resolverUrlRetorno', () => {
  it('should devolver / si es null o vacio', () => {
    expect(resolverUrlRetorno(null)).toBe('/');
    expect(resolverUrlRetorno('')).toBe('/');
  });

  it('should aceptar rutas relativas internas', () => {
    expect(resolverUrlRetorno('/ejemplo-sensible')).toBe('/ejemplo-sensible');
  });

  it('should rechazar open redirects', () => {
    expect(resolverUrlRetorno('//evil.com')).toBe('/');
    expect(resolverUrlRetorno('https://evil.com')).toBe('/');
  });
});
