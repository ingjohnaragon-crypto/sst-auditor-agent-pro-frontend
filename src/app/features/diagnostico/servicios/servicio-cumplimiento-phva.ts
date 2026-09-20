import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { RespuestaCumplimientoPhva } from '../modelos';
import { codificarIdRuta } from '../utilidades/codificar-id-ruta';

@Injectable({ providedIn: 'root' })
export class ServicioCumplimientoPhva {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  obtenerCumplimiento(autoevaluacionId: string): Observable<RespuestaCumplimientoPhva> {
    return this.http.get<RespuestaCumplimientoPhva>(
      `${this.baseUrl}/autoevaluaciones/${codificarIdRuta(autoevaluacionId)}/cumplimiento-phva`
    );
  }
}
