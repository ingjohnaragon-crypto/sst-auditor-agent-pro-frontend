import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { CicloPhva, EstandarMinimo } from '../modelos';

@Injectable({ providedIn: 'root' })
export class ServicioEstandaresMinimos {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/estandares-minimos`;

  listar(ciclo?: CicloPhva): Observable<EstandarMinimo[]> {
    let params = new HttpParams();
    if (ciclo) {
      params = params.set('ciclo_phva', ciclo);
    }
    return this.http.get<EstandarMinimo[]>(this.url, { params });
  }
}
