import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { AlertaComponent } from '@app/shared';

import { ROLES_ESCRITURA_DIAGNOSTICO } from '../../../../nucleo/auth/constantes-roles';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { PanelMatrizDiagnosticoComponent } from '../../componentes/panel-matriz-diagnostico/panel-matriz-diagnostico.component';
import type { Autoevaluacion, CalificacionEstandar, EstandarMinimo, ResultadoCalificacion } from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEstandaresMinimos } from '../../servicios/servicio-estandares-minimos';
import { mapaCalificaciones } from '../../utilidades/mapa-calificaciones';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';

@Component({
  selector: 'app-pagina-detalle-diagnostico',
  standalone: true,
  imports: [NgIf, RouterLink, AlertaComponent, PanelMatrizDiagnosticoComponent],
  templateUrl: './pagina-detalle-diagnostico.component.html',
  styleUrls: ['./pagina-detalle-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDetalleDiagnosticoComponent implements OnInit, OnDestroy {
  private readonly ruta = inject(ActivatedRoute);
  private readonly autoevaluacionesApi = inject(ServicioAutoevaluaciones);
  private readonly estandaresApi = inject(ServicioEstandaresMinimos);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();
  private readonly timersObservaciones: Record<string, ReturnType<typeof setTimeout>> = {};
  private readonly rolesEscritura = [...ROLES_ESCRITURA_DIAGNOSTICO];

  estandares: EstandarMinimo[] = [];
  autoevaluacion: Autoevaluacion | null = null;
  calificaciones: Record<string, CalificacionEstandar> = {};
  cargando = true;
  mensajeError = '';
  guardandoIds: string[] = [];
  finalizando = false;
  soloLecturaQuery = false;

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return !!rol && this.rolesEscritura.includes(rol) && !this.soloLecturaQuery;
  }

  ngOnInit(): void {
    this.soloLecturaQuery = this.ruta.snapshot.queryParamMap.get('soloLectura') === 'true';
    const id = this.ruta.snapshot.paramMap.get('id');
    if (!id) {
      this.cargando = false;
      this.mensajeError = 'No se indicó la autoevaluación.';
      return;
    }

    this.suscripciones.add(
      forkJoin({
        autoevaluacion: this.autoevaluacionesApi.obtenerPorId(id),
        estandares: this.estandaresApi.listar(),
      }).subscribe({
        next: ({ autoevaluacion, estandares }) => {
          this.autoevaluacion = autoevaluacion;
          this.estandares = estandares;
          this.calificaciones = mapaCalificaciones(autoevaluacion.calificaciones);
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.cargando = false;
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
    for (const timer of Object.values(this.timersObservaciones)) {
      clearTimeout(timer);
    }
  }

  calificar(evento: {
    estandarId: string;
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }): void {
    this.persistirCalificacion(evento.estandarId, evento);
  }

  cambiarObservaciones(evento: { estandarId: string; observaciones: string | null }): void {
    const actual = this.calificaciones[evento.estandarId];
    if (!actual || !this.autoevaluacion) {
      return;
    }
    clearTimeout(this.timersObservaciones[evento.estandarId]);
    this.timersObservaciones[evento.estandarId] = setTimeout(() => {
      this.persistirCalificacion(evento.estandarId, {
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
    this.suscripciones.add(
      this.autoevaluacionesApi.finalizar(this.autoevaluacion.id).subscribe({
        next: (autoevaluacion) => {
          this.autoevaluacion = autoevaluacion;
          this.calificaciones = mapaCalificaciones(autoevaluacion.calificaciones);
          this.finalizando = false;
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

  private persistirCalificacion(
    estandarId: string,
    solicitud: { resultado: ResultadoCalificacion; observaciones: string | null }
  ): void {
    if (!this.autoevaluacion) {
      return;
    }
    this.guardandoIds = [...this.guardandoIds.filter((id) => id !== estandarId), estandarId];
    this.cdr.markForCheck();
    this.suscripciones.add(
      this.autoevaluacionesApi.calificar(this.autoevaluacion.id, estandarId, solicitud).subscribe({
        next: (calificacion) => {
          this.calificaciones = { ...this.calificaciones, [estandarId]: calificacion };
          this.guardandoIds = this.guardandoIds.filter((id) => id !== estandarId);
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.guardandoIds = this.guardandoIds.filter((id) => id !== estandarId);
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      })
    );
  }
}
