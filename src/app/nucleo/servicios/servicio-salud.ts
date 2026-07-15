import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface PingRespuesta {
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ServicioSalud {
  private baseUrl = environment.apiBaseUrl; // espera: http://localhost:8000/api/v1

  constructor(private http: HttpClient) {}

  obtenerPing(): Observable<PingRespuesta> {
    return this.http.get<PingRespuesta>(`${this.baseUrl}/ping`);
  }
}
