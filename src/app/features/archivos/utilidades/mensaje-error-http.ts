import { HttpErrorResponse } from '@angular/common/http';

import type { RespuestaErrorApi } from '../../../nucleo/auth/modelos';

export function mensajeErrorHttp(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'No fue posible completar la operación.';
  }

  const respuesta = error.error as Partial<RespuestaErrorApi> | null;
  if (typeof respuesta?.mensaje === 'string' && respuesta.mensaje.trim()) {
    return respuesta.mensaje;
  }

  if (error.status === 503) {
    return 'El almacenamiento de archivos no está disponible.';
  }
  if (error.status === 0) {
    return 'No fue posible conectar con el backend.';
  }
  return 'No fue posible completar la operación.';
}
