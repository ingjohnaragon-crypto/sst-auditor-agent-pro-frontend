import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { AlertaComponent, BotonComponent } from '@app/shared';

import { ROLES_ESCRITURA_DIAGNOSTICO } from '../../../../nucleo/auth/constantes-roles';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';
import { PanelMatrizDiagnosticoComponent } from '../../componentes/panel-matriz-diagnostico/panel-matriz-diagnostico.component';
import { SelectorEmpresaComponent } from '../../componentes/selector-empresa/selector-empresa.component';
import type {
  Autoevaluacion,
  CalificacionEstandar,
  Empresa,
  EstandarMinimo,
  ResultadoCalificacion,
} from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEmpresas } from '../../servicios/servicio-empresas';
import { ServicioEstandaresMinimos } from '../../servicios/servicio-estandares-minimos';
import { fechaHoyIso } from '../../utilidades/fecha-hoy-iso';
import { mapaCalificaciones } from '../../utilidades/mapa-calificaciones';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';

@Component({
  selector: 'app-pagina-diagnostico',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    AlertaComponent,
    BotonComponent,
    SiTieneRolDirective,
    SelectorEmpresaComponent,
    PanelMatrizDiagnosticoComponent,
  ],
  templateUrl: './pagina-diagnostico.component.html',
  styleUrls: ['./pagina-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDiagnosticoComponent implements OnInit, OnDestroy {
  private readonly empresasApi = inject(ServicioEmpresas);
  private readonly estandaresApi = inject(ServicioEstandaresMinimos);
  private readonly autoevaluacionesApi = inject(ServicioAutoevaluaciones);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();
  private readonly timersObservaciones: Record<string, ReturnType<typeof setTimeout>> = {};

  readonly rolesEscritura = [...ROLES_ESCRITURA_DIAGNOSTICO];

  empresas: Empresa[] = [];
  estandares: EstandarMinimo[] = [];
  empresaId = '';
  autoevaluacion: Autoevaluacion | null = null;
  calificaciones: Record<string, CalificacionEstandar> = {};
  cargando = true;
  creando = false;
  finalizando = false;
  mensajeError = '';
  guardandoIds: string[] = [];

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return !!rol && this.rolesEscritura.includes(rol);
  }

  ngOnInit(): void {
    this.suscripciones.add(
      forkJoin({
        empresas: this.empresasApi.listar(),
        estandares: this.estandaresApi.listar(),
      }).subscribe({
        next: ({ empresas, estandares }) => {
          this.empresas = empresas;
          this.estandares = estandares;
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

  seleccionarEmpresa(id: string): void {
    this.empresaId = id;
    this.autoevaluacion = null;
    this.calificaciones = {};
    this.mensajeError = '';
    this.cdr.markForCheck();
  }

  iniciar(): void {
    if (!this.empresaId || !this.puedeEscribir) {
      return;
    }
    this.creando = true;
    this.mensajeError = '';
    this.suscripciones.add(
      this.autoevaluacionesApi
        .crear({ empresa_id: this.empresaId, fecha: fechaHoyIso() })
        .subscribe({
          next: (autoevaluacion) => {
            this.autoevaluacion = autoevaluacion;
            this.calificaciones = mapaCalificaciones(autoevaluacion.calificaciones);
            this.creando = false;
            this.cdr.markForCheck();
          },
          error: (error: unknown) => {
            this.creando = false;
            this.mensajeError = mensajeErrorHttp(error);
            this.cdr.markForCheck();
          },
        })
    );
  }

  calificar(evento: {
    estandarId: string;
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }): void {
    this.persistirCalificacion(evento.estandarId, {
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
