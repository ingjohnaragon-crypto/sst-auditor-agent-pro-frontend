import { codificarIdRuta } from './codificar-id-ruta';

describe('codificarIdRuta', () => {
  it('should dejar intactos los identificadores simples', () => {
    expect(codificarIdRuta('ae-1')).toBe('ae-1');
  });

  it('should encodear caracteres reservados de URL', () => {
    expect(codificarIdRuta('empresa/1')).toBe('empresa%2F1');
    expect(codificarIdRuta('id?x=1')).toBe('id%3Fx%3D1');
    expect(codificarIdRuta('con espacio')).toBe('con%20espacio');
  });
});
