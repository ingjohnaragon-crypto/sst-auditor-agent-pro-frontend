import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { Evidencia, RespuestaEnlaceDescarga } from '../modelos';
import { codificarIdRuta } from '../utilidades/codificar-id-ruta';

@Injectable({ providedIn: 'root' })
export class ServicioEvidencias {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  subirArchivo(calificacionId: string, archivo: File): Observable<Evidencia> {
    const datos = new FormData();
    datos.append('archivo', archivo, archivo.name);
    return this.http.post<Evidencia>(
      `${this.baseUrl}/calificaciones-estandar/${codificarIdRuta(calificacionId)}/archivo`,
      datos
    );
  }

  listarPorCalificacion(calificacionId: string): Observable<Evidencia[]> {
    return this.http.get<Evidencia[]>(
      `${this.baseUrl}/calificaciones-estandar/${codificarIdRuta(calificacionId)}/evidencias`
    );
  }

  obtenerEnlaceDescarga(evidenciaId: string): Observable<RespuestaEnlaceDescarga> {
    return this.http.post<RespuestaEnlaceDescarga>(
      `${this.baseUrl}/evidencias/${codificarIdRuta(evidenciaId)}/enlace-descarga`,
      {}
    );
  }
}
