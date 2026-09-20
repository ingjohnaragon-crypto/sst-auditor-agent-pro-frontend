import { ChangeDetectorRef, Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import type { Autoevaluacion, CalificacionEstandar, ResultadoCalificacion } from '../modelos';
import { mapaCalificaciones } from '../utilidades/mapa-calificaciones';
import { mensajeErrorHttp } from '../utilidades/mensaje-error-http';
import { ServicioAutoevaluaciones } from './servicio-autoevaluaciones';

@Injectable()
export class ServicioEscrituraAutoevaluacion {
  private readonly api = inject(ServicioAutoevaluaciones);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();
  private readonly timersObservaciones: Record<string, ReturnType<typeof setTimeout>> = {};
  private readonly peticionesCalificacion = new Map<string, Subscription>();

  autoevaluacion: Autoevaluacion | null = null;
  calificaciones: Record<string, CalificacionEstandar> = {};
  guardandoIds: string[] = [];
  finalizando = false;
  mensajeError = '';

  establecer(autoevaluacion: Autoevaluacion): void {
    this.autoevaluacion = autoevaluacion;
    this.calificaciones = mapaCalificaciones(autoevaluacion.calificaciones);
    this.guardandoIds = [];
    this.finalizando = false;
    this.mensajeError = '';
  }

  reiniciar(): void {
    this.autoevaluacion = null;
    this.calificaciones = {};
    this.guardandoIds = [];
    this.finalizando = false;
    this.mensajeError = '';
    this.limpiarTimers();
  }

  calificar(evento: {
    estandarId: string;
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }): void {
    this.persistir(evento.estandarId, {
      resultado: evento.resultado,
      observaciones: evento.observaciones,
    });
  }

  cambiarObservaciones(evento: { estandarId: string; observaciones: string | null }): void {
    const actual = this.calificaciones[evento.estandarId];
    if (!actual || !this.autoevaluacion) {
      return;
    }
    clearTimeout(this.timersObservaciones[evento.estandarId]);
    this.timersObservaciones[evento.estandarId] = setTimeout(() => {
      this.persistir(evento.estandarId, {
        resultado: actual.resultado,
        observaciones: evento.observaciones,
      });
    }, 400);
  }

  finalizar(): void {
    if (!this.autoevaluacion) {
      return;
    }
    this.finalizando = true;
    this.mensajeError = '';
    this.cdr.markForCheck();
    this.suscripciones.add(
      this.api.finalizar(this.autoevaluacion.id).subscribe({
        next: (autoevaluacion) => {
          this.establecer(autoevaluacion);
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.finalizando = false;
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      })
    );
  }

  destruir(): void {
    this.limpiarTimers();
    this.suscripciones.unsubscribe();
    for (const peticion of this.peticionesCalificacion.values()) {
      peticion.unsubscribe();
    }
    this.peticionesCalificacion.clear();
  }

  private persistir(
    estandarId: string,
    solicitud: { resultado: ResultadoCalificacion; observaciones: string | null }
  ): void {
    if (!this.autoevaluacion) {
      return;
    }
    this.peticionesCalificacion.get(estandarId)?.unsubscribe();
    this.guardandoIds = [...this.guardandoIds.filter((id) => id !== estandarId), estandarId];
    this.cdr.markForCheck();
    const peticion = this.api.calificar(this.autoevaluacion.id, estandarId, solicitud).subscribe({
      next: (calificacion) => {
        this.calificaciones = { ...this.calificaciones, [estandarId]: calificacion };
        this.guardandoIds = this.guardandoIds.filter((id) => id !== estandarId);
        this.peticionesCalificacion.delete(estandarId);
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.guardandoIds = this.guardandoIds.filter((id) => id !== estandarId);
        this.peticionesCalificacion.delete(estandarId);
        this.mensajeError = mensajeErrorHttp(error);
        this.cdr.markForCheck();
      },
    });
    this.peticionesCalificacion.set(estandarId, peticion);
    this.suscripciones.add(peticion);
  }

  private limpiarTimers(): void {
    for (const timer of Object.values(this.timersObservaciones)) {
      clearTimeout(timer);
    }
  }
}
