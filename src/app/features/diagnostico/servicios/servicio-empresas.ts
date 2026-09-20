import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { Empresa } from '../modelos';

@Injectable({ providedIn: 'root' })
export class ServicioEmpresas {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/empresas`;

  listar(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.url);
  }
}
