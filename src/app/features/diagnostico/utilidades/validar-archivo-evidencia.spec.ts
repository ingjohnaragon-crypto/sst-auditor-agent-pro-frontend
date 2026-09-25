import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { resolverUrlAbsoluta } from './resolver-url-absoluta';
import { validarArchivoEvidencia } from './validar-archivo-evidencia';

describe('validarArchivoEvidencia', () => {
  it('should aceptar pdf jpeg y png', () => {
    expect(
      validarArchivoEvidencia(new File(['a'], 'a.pdf', { type: 'application/pdf' }))
    ).toBeNull();
    expect(validarArchivoEvidencia(new File(['a'], 'a.jpg', { type: 'image/jpeg' }))).toBeNull();
    expect(validarArchivoEvidencia(new File(['a'], 'a.jpeg', { type: 'image/jpeg' }))).toBeNull();
    expect(validarArchivoEvidencia(new File(['a'], 'a.png', { type: 'image/png' }))).toBeNull();
  });

  it('should rechazar ejecutable y tipo no permitido sin depender del API', () => {
    expect(
      validarArchivoEvidencia(new File(['a'], 'virus.exe', { type: 'application/octet-stream' }))
    ).toMatch(/PDF, JPEG y PNG/);
    expect(
      validarArchivoEvidencia(new File(['a'], 'nota.txt', { type: 'text/plain' }))
    ).toMatch(/PDF, JPEG y PNG/);
  });

  it('should rechazar archivos mayores a 10 MB', () => {
    const grande = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.pdf', {
      type: 'application/pdf',
    });
    expect(validarArchivoEvidencia(grande)).toMatch(/10 MB/);
  });
});

describe('resolverUrlAbsoluta', () => {
  it('should anteponer el origen del API a una ruta relativa', () => {
    const absoluta = resolverUrlAbsoluta(
      '/api/v1/descargas/evidencias?token=abc',
      environment.apiBaseUrl
    );
    expect(absoluta.startsWith('http')).toBe(true);
    expect(absoluta).toContain('/api/v1/descargas/evidencias?token=abc');
  });

  it('should conservar una URL absoluta', () => {
    expect(resolverUrlAbsoluta('https://cdn.example/archivo.pdf', environment.apiBaseUrl)).toBe(
      'https://cdn.example/archivo.pdf'
    );
  });
});
