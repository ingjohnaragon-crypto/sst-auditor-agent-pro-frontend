import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type {
  Autoevaluacion,
  CalificacionEstandar,
  SolicitudCalificarEstandar,
  SolicitudCrearAutoevaluacion,
} from '../modelos';
import { codificarIdRuta } from '../utilidades/codificar-id-ruta';

@Injectable({ providedIn: 'root' })
export class ServicioAutoevaluaciones {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  crear(solicitud: SolicitudCrearAutoevaluacion): Observable<Autoevaluacion> {
    return this.http.post<Autoevaluacion>(`${this.baseUrl}/autoevaluaciones`, solicitud);
  }

  listarPorEmpresa(empresaId: string): Observable<Autoevaluacion[]> {
    return this.http.get<Autoevaluacion[]>(
      `${this.baseUrl}/autoevaluaciones?empresa_id=${codificarIdRuta(empresaId)}`
    );
  }

  obtenerPorId(id: string): Observable<Autoevaluacion> {
    return this.http.get<Autoevaluacion>(
      `${this.baseUrl}/autoevaluaciones/${codificarIdRuta(id)}`
    );
  }

  calificar(
    autoevaluacionId: string,
    estandarId: string,
    solicitud: SolicitudCalificarEstandar
  ): Observable<CalificacionEstandar> {
    return this.http.put<CalificacionEstandar>(
      `${this.baseUrl}/autoevaluaciones/${codificarIdRuta(autoevaluacionId)}/calificaciones/${codificarIdRuta(estandarId)}`,
      solicitud
    );
  }

  finalizar(id: string): Observable<Autoevaluacion> {
    return this.http.post<Autoevaluacion>(
      `${this.baseUrl}/autoevaluaciones/${codificarIdRuta(id)}/finalizar`,
      {}
    );
  }
}
