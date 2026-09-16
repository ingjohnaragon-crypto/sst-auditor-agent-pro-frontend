import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import type {
  ControlRiesgo,
  EvaluacionRiesgo,
  Peligro,
  ProcesoActividad,
  RespuestaMatrizRiesgos,
  SolicitudActualizarControl,
  SolicitudActualizarPeligro,
  SolicitudActualizarProceso,
  SolicitudControl,
  SolicitudEvaluacion,
  SolicitudPeligro,
  SolicitudProcesoActividad,
} from "../modelos";

@Injectable({ providedIn: "root" })
export class ServicioMatrizRiesgos {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  obtenerMatriz(empresaId: string): Observable<RespuestaMatrizRiesgos> {
    return this.http.get<RespuestaMatrizRiesgos>(
      `${this.baseUrl}/empresas/${this.id(empresaId)}/matriz-riesgos`
    );
  }

  crearProceso(
    empresaId: string,
    solicitud: SolicitudProcesoActividad
  ): Observable<ProcesoActividad> {
    return this.http.post<ProcesoActividad>(
      `${this.baseUrl}/empresas/${this.id(empresaId)}/procesos-actividades`,
      solicitud
    );
  }

  actualizarProceso(
    procesoId: string,
    solicitud: SolicitudActualizarProceso
  ): Observable<ProcesoActividad> {
    return this.http.patch<ProcesoActividad>(
      `${this.baseUrl}/procesos-actividades/${this.id(procesoId)}`,
      solicitud
    );
  }

  eliminarProceso(procesoId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/procesos-actividades/${this.id(procesoId)}`);
  }

  crearPeligro(procesoId: string, solicitud: SolicitudPeligro): Observable<Peligro> {
    return this.http.post<Peligro>(
      `${this.baseUrl}/procesos-actividades/${this.id(procesoId)}/peligros`,
      solicitud
    );
  }

  actualizarPeligro(peligroId: string, solicitud: SolicitudActualizarPeligro): Observable<Peligro> {
    return this.http.patch<Peligro>(`${this.baseUrl}/peligros/${this.id(peligroId)}`, solicitud);
  }

  eliminarPeligro(peligroId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/peligros/${this.id(peligroId)}`);
  }

  guardarEvaluacion(
    peligroId: string,
    solicitud: SolicitudEvaluacion
  ): Observable<EvaluacionRiesgo> {
    return this.http.put<EvaluacionRiesgo>(
      `${this.baseUrl}/peligros/${this.id(peligroId)}/evaluacion`,
      solicitud
    );
  }

  crearControl(evaluacionId: string, solicitud: SolicitudControl): Observable<ControlRiesgo> {
    return this.http.post<ControlRiesgo>(
      `${this.baseUrl}/evaluaciones-riesgo/${this.id(evaluacionId)}/controles`,
      solicitud
    );
  }

  actualizarControl(
    controlId: string,
    solicitud: SolicitudActualizarControl
  ): Observable<ControlRiesgo> {
    return this.http.patch<ControlRiesgo>(
      `${this.baseUrl}/controles-riesgo/${this.id(controlId)}`,
      solicitud
    );
  }

  eliminarControl(controlId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/controles-riesgo/${this.id(controlId)}`);
  }

  private id(valor: string): string {
    return encodeURIComponent(valor);
  }
}
