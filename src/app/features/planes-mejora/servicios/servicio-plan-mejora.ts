import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { codificarIdRuta } from '../../diagnostico/utilidades/codificar-id-ruta';
import type { PlanMejora, SolicitudActividadCronograma } from '../modelos/plan-mejora.model';

@Injectable({ providedIn: 'root' })
export class ServicioPlanMejora {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  obtenerPorAutoevaluacion(autoevaluacionId: string): Observable<PlanMejora> {
    const id = codificarIdRuta(autoevaluacionId);
    return this.http.get<PlanMejora>(`${this.baseUrl}/autoevaluaciones/${id}/plan-mejora`);
  }

  actualizarActividad(
    planId: string,
    actividadId: string,
    solicitud: SolicitudActividadCronograma
  ): Observable<PlanMejora> {
    const plan = codificarIdRuta(planId);
    const actividad = codificarIdRuta(actividadId);
    return this.http.put<PlanMejora>(
      `${this.baseUrl}/planes-mejora/${plan}/actividades/${actividad}`,
      solicitud
    );
  }

  agregarActividad(planId: string, solicitud: SolicitudActividadCronograma): Observable<PlanMejora> {
    const plan = codificarIdRuta(planId);
    return this.http.post<PlanMejora>(
      `${this.baseUrl}/planes-mejora/${plan}/actividades`,
      solicitud
    );
  }

  quitarActividad(planId: string, actividadId: string): Observable<void> {
    const plan = codificarIdRuta(planId);
    const actividad = codificarIdRuta(actividadId);
    return this.http.delete<void>(`${this.baseUrl}/planes-mejora/${plan}/actividades/${actividad}`);
  }
}
