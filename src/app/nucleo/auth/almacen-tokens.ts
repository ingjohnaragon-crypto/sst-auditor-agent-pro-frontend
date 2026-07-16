import { Injectable } from '@angular/core';

const CLAVE_TOKEN_ACCESO = 'sst.token_acceso';
const CLAVE_TOKEN_REFRESCO = 'sst.token_refresco';

/**
 * Almacén de tokens JWT en memoria + sessionStorage.
 * No usa localStorage (mayor riesgo XSS / persistencia entre sesiones).
 * Nunca registrar tokens en consola.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenTokens {
  private tokenAcceso: string | null = null;
  private tokenRefresco: string | null = null;

  constructor() {
    this.tokenAcceso = sessionStorage.getItem(CLAVE_TOKEN_ACCESO);
    this.tokenRefresco = sessionStorage.getItem(CLAVE_TOKEN_REFRESCO);
  }

  obtenerTokenAcceso(): string | null {
    return this.tokenAcceso;
  }

  obtenerTokenRefresco(): string | null {
    return this.tokenRefresco;
  }

  guardarPar(tokenAcceso: string, tokenRefresco: string): void {
    this.tokenAcceso = tokenAcceso;
    this.tokenRefresco = tokenRefresco;
    sessionStorage.setItem(CLAVE_TOKEN_ACCESO, tokenAcceso);
    sessionStorage.setItem(CLAVE_TOKEN_REFRESCO, tokenRefresco);
  }

  actualizarTokenAcceso(tokenAcceso: string): void {
    this.tokenAcceso = tokenAcceso;
    sessionStorage.setItem(CLAVE_TOKEN_ACCESO, tokenAcceso);
  }

  limpiar(): void {
    this.tokenAcceso = null;
    this.tokenRefresco = null;
    sessionStorage.removeItem(CLAVE_TOKEN_ACCESO);
    sessionStorage.removeItem(CLAVE_TOKEN_REFRESCO);
  }
}
