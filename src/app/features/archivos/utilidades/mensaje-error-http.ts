import { HttpErrorResponse } from '@angular/common/http';

import type { RespuestaErrorApi } from '../../../nucleo/auth/modelos';

type CuerpoErrorApi = Partial<RespuestaErrorApi> & { detail?: unknown };

function mensajeDesdeCuerpo(cuerpo: unknown): string | null {
  if (cuerpo == null) {
    return null;
  }

  if (typeof cuerpo === 'string') {
    const texto = cuerpo.trim();
    if (!texto) {
      return null;
    }
    try {
      return mensajeDesdeCuerpo(JSON.parse(texto) as unknown);
    } catch {
      return texto;
    }
  }

  if (typeof cuerpo !== 'object' || cuerpo instanceof Blob) {
    return null;
  }

  const respuesta = cuerpo as CuerpoErrorApi;
  if (typeof respuesta.mensaje === 'string' && respuesta.mensaje.trim()) {
    return respuesta.mensaje;
  }
  if (typeof respuesta.detail === 'string' && respuesta.detail.trim()) {
    return respuesta.detail;
  }
  return null;
}

/**
 * Traduce errores HTTP del API de archivos a un mensaje usable en UI.
 * Si la descarga falló con `responseType: 'blob'`, el cuerpo llega como Blob
 * y no se puede leer de forma síncrona; se usa un mensaje específico.
 */
export function mensajeErrorHttp(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'No fue posible completar la operación.';
  }

  if (error.error instanceof Blob) {
    if (error.status === 503) {
      return 'El almacenamiento de archivos no está disponible.';
    }
    return 'No fue posible completar la descarga.';
  }

  const desdeCuerpo = mensajeDesdeCuerpo(error.error);
  if (desdeCuerpo) {
    return desdeCuerpo;
  }

  if (error.status === 503) {
    return 'El almacenamiento de archivos no está disponible.';
  }
  if (error.status === 0) {
    return 'No fue posible conectar con el backend.';
  }
  if (error.status >= 500) {
    return 'El servidor no pudo completar la operación. Intenta de nuevo más tarde.';
  }
  return 'No fue posible completar la operación.';
}
