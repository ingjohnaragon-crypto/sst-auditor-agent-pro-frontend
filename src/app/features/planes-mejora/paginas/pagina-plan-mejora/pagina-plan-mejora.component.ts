import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';
import { ServicioAutoevaluaciones } from '../../../diagnostico/servicios/servicio-autoevaluaciones';
import { mensajeErrorHttp } from '../../../diagnostico/utilidades/mensaje-error-http';
import {
  COLUMNAS_CRONOGRAMA,
  GrillaCronogramaComponent,
  type CambioMesCronograma,
} from '../../componentes/grilla-cronograma/grilla-cronograma.component';
import type { ActividadCronograma, PlanMejora } from '../../modelos/plan-mejora.model';
import { ServicioPlanMejora } from '../../servicios/servicio-plan-mejora';

interface EdicionActividad {
  responsable: string;
  indicador: string;
}

@Component({
  selector: 'app-pagina-plan-mejora',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, SiTieneRolDirective, GrillaCronogramaComponent],
  templateUrl: './pagina-plan-mejora.component.html',
  styleUrls: ['./pagina-plan-mejora.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaPlanMejoraComponent implements OnInit, OnDestroy {
  private readonly ruta = inject(ActivatedRoute);
  private readonly autoevaluaciones = inject(ServicioAutoevaluaciones);
  private readonly planes = inject(ServicioPlanMejora);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();
  private suscripcionCarga: Subscription | null = null;
  private suscripcionGuardar: Subscription | null = null;
  private suscripcionAlta: Subscription | null = null;
  private suscripcionBaja: Subscription | null = null;
  private suscripcionMes: Subscription | null = null;
  private autoevaluacionId: string | null = null;

  plan: PlanMejora | null = null;
  edicion: Record<string, EdicionActividad> = {};
  altaDescripcion = '';
  altaResponsable = '';
  altaIndicador = '';
  altaMeses: number[] = [];
  mensajeVacio = '';
  mensajeError = '';

  readonly mesesAlta = COLUMNAS_CRONOGRAMA;

  readonly trackActividad = (_indice: number, actividad: ActividadCronograma): string =>
    actividad.id;

  ngOnInit(): void {
    this.suscripciones.add(
      this.ruta.paramMap.subscribe((params) => this.cargar(params.get('autoevaluacionId')))
    );
  }

  ngOnDestroy(): void {
    this.cancelarOperaciones();
    this.suscripciones.unsubscribe();
  }

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return rol === 'ADMINISTRADOR' || rol === 'AUDITOR_SST';
  }

  guardar(actividad: ActividadCronograma): void {
    const edicion = this.edicion[actividad.id];
    if (!this.plan || !edicion) {
      return;
    }
    this.mensajeError = '';
    this.suscripcionGuardar?.unsubscribe();
    this.suscripcionGuardar = this.planes
      .actualizarActividad(this.plan.id, actividad.id, {
        descripcion: actividad.descripcion,
        responsable: edicion.responsable,
        indicador: edicion.indicador,
        meses: [...actividad.meses],
      })
      .subscribe({
        next: (plan) => {
          this.plan = plan;
          this.prepararEdicion(plan);
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      });
  }

  agregar(): void {
    if (!this.plan) {
      return;
    }
    this.mensajeError = '';
    this.suscripcionAlta?.unsubscribe();
    this.suscripcionAlta = this.planes
      .agregarActividad(this.plan.id, {
        descripcion: this.altaDescripcion,
        responsable: this.altaResponsable,
        indicador: this.altaIndicador,
        meses: [...this.altaMeses],
      })
      .subscribe({
        next: (plan) => {
          this.plan = plan;
          this.prepararEdicion(plan);
          this.altaDescripcion = '';
          this.altaResponsable = '';
          this.altaIndicador = '';
          this.altaMeses = [];
          this.mensajeVacio =
            plan.actividades.length === 0 ? 'Este plan todavía no tiene actividades.' : '';
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      });
  }

  cambiarMes(cambio: CambioMesCronograma): void {
    if (!this.plan) {
      return;
    }
    const { actividad, mes } = cambio;
    const meses = actividad.meses.includes(mes)
      ? actividad.meses.filter((numero) => numero !== mes)
      : [...actividad.meses, mes];
    this.mensajeError = '';
    this.suscripcionMes?.unsubscribe();
    this.suscripcionMes = this.planes
      .actualizarActividad(this.plan.id, actividad.id, {
        descripcion: actividad.descripcion,
        responsable: actividad.responsable,
        indicador: actividad.indicador,
        meses,
      })
      .subscribe({
        next: (plan) => {
          this.plan = plan;
          this.prepararEdicion(plan);
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      });
  }

  quitar(actividadId: string): void {
    if (!this.plan || !this.autoevaluacionId) {
      return;
    }
    const planId = this.plan.id;
    const autoevaluacionId = this.autoevaluacionId;
    this.mensajeError = '';
    this.suscripcionBaja?.unsubscribe();
    this.suscripcionBaja = this.planes.quitarActividad(planId, actividadId).subscribe({
      next: () => {
        this.suscripcionBaja = this.planes.obtenerPorAutoevaluacion(autoevaluacionId).subscribe({
          next: (plan) => {
            this.plan = plan;
            this.prepararEdicion(plan);
            this.mensajeVacio =
              plan.actividades.length === 0 ? 'Este plan todavía no tiene actividades.' : '';
            this.cdr.markForCheck();
          },
          error: (error: unknown) => {
            this.mensajeError = mensajeErrorHttp(error);
            this.cdr.markForCheck();
          },
        });
      },
      error: (error: unknown) => {
        this.mensajeError = mensajeErrorHttp(error);
        this.cdr.markForCheck();
      },
    });
  }

  valorCampo(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }

  alternarAlta(mes: number): void {
    this.altaMeses = this.altaMeses.includes(mes)
      ? this.altaMeses.filter((numero) => numero !== mes)
      : [...this.altaMeses, mes];
  }

  private cargar(autoevaluacionId: string | null): void {
    this.cancelarOperaciones();
    this.autoevaluacionId = autoevaluacionId;
    this.plan = null;
    this.edicion = {};
    this.altaDescripcion = '';
    this.altaResponsable = '';
    this.altaIndicador = '';
    this.altaMeses = [];
    this.mensajeVacio = '';
    this.mensajeError = '';
    if (!autoevaluacionId) {
      this.mensajeError = 'No fue posible completar la operación.';
      this.cdr.markForCheck();
      return;
    }

    this.suscripcionCarga = this.autoevaluaciones.obtenerPorId(autoevaluacionId).subscribe({
      next: (autoevaluacion) => {
        if (!autoevaluacion.requiere_plan_mejora) {
          this.mensajeVacio = 'Esta autoevaluación no exige plan de mejora.';
          this.cdr.markForCheck();
          return;
        }
        this.suscripcionCarga = this.planes.obtenerPorAutoevaluacion(autoevaluacionId).subscribe({
          next: (plan) => {
            this.plan = plan;
            this.prepararEdicion(plan);
            if (plan.actividades.length === 0) {
              this.mensajeVacio = 'Este plan todavía no tiene actividades.';
            }
            this.cdr.markForCheck();
          },
          error: (error: unknown) => {
            this.mensajeVacio =
              this.esNoEncontrado(error)
                ? 'Aún no hay plan de mejora para esta autoevaluación.'
                : '';
            this.mensajeError = this.esNoEncontrado(error) ? '' : mensajeErrorHttp(error);
            this.cdr.markForCheck();
          },
        });
      },
      error: (error: unknown) => {
        this.mensajeError = mensajeErrorHttp(error);
        this.cdr.markForCheck();
      },
    });
  }

  private prepararEdicion(plan: PlanMejora): void {
    this.edicion = {};
    for (const actividad of plan.actividades) {
      this.edicion[actividad.id] = {
        responsable: actividad.responsable,
        indicador: actividad.indicador,
      };
    }
  }

  private esNoEncontrado(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 404;
  }

  private cancelarOperaciones(): void {
    this.suscripcionCarga?.unsubscribe();
    this.suscripcionGuardar?.unsubscribe();
    this.suscripcionAlta?.unsubscribe();
    this.suscripcionBaja?.unsubscribe();
    this.suscripcionMes?.unsubscribe();
  }
}
