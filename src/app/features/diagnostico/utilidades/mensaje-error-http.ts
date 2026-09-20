import { HttpErrorResponse } from '@angular/common/http';

import type { RespuestaErrorApi } from '../../../nucleo/auth/modelos';

export function mensajeErrorHttp(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'No fue posible completar la operación.';
  }

  const respuesta = error.error as Partial<RespuestaErrorApi> | null;
  return (
    respuesta?.mensaje ??
    (error.status === 0
      ? 'No fue posible conectar con el backend.'
      : 'No fue posible completar la operación.')
  );
}
