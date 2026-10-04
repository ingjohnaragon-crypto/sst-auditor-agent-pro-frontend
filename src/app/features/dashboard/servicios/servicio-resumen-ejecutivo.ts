import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { ResumenEjecutivo } from '../modelos/resumen-ejecutivo.model';

@Injectable({ providedIn: 'root' })
export class ServicioResumenEjecutivo {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  obtener(empresaId: string): Observable<ResumenEjecutivo> {
    return this.http.get<ResumenEjecutivo>(
      `${this.baseUrl}/empresas/${encodeURIComponent(empresaId)}/resumen-ejecutivo`
    );
  }
}
