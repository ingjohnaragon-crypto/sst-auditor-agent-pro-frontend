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
import type { ActividadCronograma, PlanMejora } from '../../modelos/plan-mejora.model';
import { ServicioPlanMejora } from '../../servicios/servicio-plan-mejora';

interface EdicionActividad {
  responsable: string;
  indicador: string;
}

@Component({
  selector: 'app-pagina-plan-mejora',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, SiTieneRolDirective],
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

  plan: PlanMejora | null = null;
  edicion: Record<string, EdicionActividad> = {};
  mensajeVacio = '';
  mensajeError = '';

  readonly trackActividad = (_indice: number, actividad: ActividadCronograma): string =>
    actividad.id;

  ngOnInit(): void {
    this.suscripciones.add(
      this.ruta.paramMap.subscribe((params) => this.cargar(params.get('autoevaluacionId')))
    );
  }

  ngOnDestroy(): void {
    this.suscripcionCarga?.unsubscribe();
    this.suscripcionGuardar?.unsubscribe();
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

  private cargar(autoevaluacionId: string | null): void {
    this.suscripcionCarga?.unsubscribe();
    this.suscripcionGuardar?.unsubscribe();
    this.plan = null;
    this.edicion = {};
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
}
