import {
  TAMANO_MAXIMO_ARCHIVO_BYTES,
  validarArchivoDocumental,
} from './validar-archivo-documental';

describe('validarArchivoDocumental', () => {
  it('should aceptar PDF valido', () => {
    const archivo = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    expect(validarArchivoDocumental(archivo)).toBeNull();
  });

  it('should rechazar extension no permitida', () => {
    const archivo = new File(['x'], 'nota.txt', { type: 'text/plain' });
    expect(validarArchivoDocumental(archivo)).toContain('PDF');
  });

  it('should rechazar mime no permitido con extension ok', () => {
    const archivo = new File(['x'], 'acta.pdf', { type: 'application/octet-stream' });
    expect(validarArchivoDocumental(archivo)).toContain('PDF');
  });

  it('should rechazar vacio', () => {
    const archivo = new File([], 'acta.pdf', { type: 'application/pdf' });
    expect(validarArchivoDocumental(archivo)).toContain('vacío');
  });

  it('should rechazar sin nombre', () => {
    const archivo = new File(['%PDF'], '   ', { type: 'application/pdf' });
    expect(validarArchivoDocumental(archivo)).toContain('nombre');
  });

  it('should rechazar archivo demasiado grande', () => {
    const grande = {
      name: 'acta.pdf',
      type: 'application/pdf',
      size: TAMANO_MAXIMO_ARCHIVO_BYTES + 1,
    } as File;
    expect(validarArchivoDocumental(grande)).toContain('10 MB');
  });
});