import { TestBed } from '@angular/core/testing';

import { AlmacenTokens } from './almacen-tokens';

describe('AlmacenTokens', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    TestBed.configureTestingModule({ providers: [AlmacenTokens] });
    expect(TestBed.inject(AlmacenTokens)).toBeTruthy();
  });

  it('should guardar y leer el par de tokens', () => {
    TestBed.configureTestingModule({ providers: [AlmacenTokens] });
    const almacen = TestBed.inject(AlmacenTokens);

    almacen.guardarPar('acceso-1', 'refresco-1');

    expect(almacen.obtenerTokenAcceso()).toBe('acceso-1');
    expect(almacen.obtenerTokenRefresco()).toBe('refresco-1');
    expect(sessionStorage.getItem('sst.token_acceso')).toBe('acceso-1');
    expect(sessionStorage.getItem('sst.token_refresco')).toBe('refresco-1');
  });

  it('should actualizar solo el token de acceso', () => {
    TestBed.configureTestingModule({ providers: [AlmacenTokens] });
    const almacen = TestBed.inject(AlmacenTokens);

    almacen.guardarPar('acceso-1', 'refresco-1');
    almacen.actualizarTokenAcceso('acceso-2');

    expect(almacen.obtenerTokenAcceso()).toBe('acceso-2');
    expect(almacen.obtenerTokenRefresco()).toBe('refresco-1');
  });

  it('should limpiar memoria y sessionStorage', () => {
    TestBed.configureTestingModule({ providers: [AlmacenTokens] });
    const almacen = TestBed.inject(AlmacenTokens);

    almacen.guardarPar('acceso-1', 'refresco-1');
    almacen.limpiar();

    expect(almacen.obtenerTokenAcceso()).toBeNull();
    expect(almacen.obtenerTokenRefresco()).toBeNull();
    expect(sessionStorage.getItem('sst.token_acceso')).toBeNull();
    expect(sessionStorage.getItem('sst.token_refresco')).toBeNull();
  });

  it('should hidratar desde sessionStorage al construir', () => {
    sessionStorage.setItem('sst.token_acceso', 'persistido-acceso');
    sessionStorage.setItem('sst.token_refresco', 'persistido-refresco');

    TestBed.configureTestingModule({ providers: [AlmacenTokens] });
    const hidratado = TestBed.inject(AlmacenTokens);

    expect(hidratado.obtenerTokenAcceso()).toBe('persistido-acceso');
    expect(hidratado.obtenerTokenRefresco()).toBe('persistido-refresco');
  });
});
