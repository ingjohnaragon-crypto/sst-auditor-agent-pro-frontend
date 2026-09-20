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
import { PanelCumplimientoPhvaComponent } from '../../componentes/panel-cumplimiento-phva/panel-cumplimiento-phva.component';
import type { Autoevaluacion, CalificacionEstandar, EstandarMinimo, ResultadoCalificacion } from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEscrituraAutoevaluacion } from '../../servicios/servicio-escritura-autoevaluacion';
import { ServicioEstandaresMinimos } from '../../servicios/servicio-estandares-minimos';
import { construirFirmaCalificaciones } from '../../utilidades/construir-firma-calificaciones';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';

@Component({
  selector: 'app-pagina-detalle-diagnostico',
  standalone: true,
  imports: [NgIf, RouterLink, AlertaComponent, PanelMatrizDiagnosticoComponent, PanelCumplimientoPhvaComponent],
  providers: [ServicioEscrituraAutoevaluacion],
  templateUrl: './pagina-detalle-diagnostico.component.html',
  styleUrls: ['./pagina-detalle-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDetalleDiagnosticoComponent implements OnInit, OnDestroy {
  private readonly ruta = inject(ActivatedRoute);
  private readonly autoevaluacionesApi = inject(ServicioAutoevaluaciones);
  private readonly estandaresApi = inject(ServicioEstandaresMinimos);
  private readonly escritura = inject(ServicioEscrituraAutoevaluacion);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();
  private readonly rolesEscritura = [...ROLES_ESCRITURA_DIAGNOSTICO];

  estandares: EstandarMinimo[] = [];
  cargando = true;
  soloLecturaQuery = false;
  private mensajeCarga = '';

  get autoevaluacion(): Autoevaluacion | null {
    return this.escritura.autoevaluacion;
  }
  set autoevaluacion(valor: Autoevaluacion | null) {
    this.escritura.autoevaluacion = valor;
  }

  get calificaciones(): Record<string, CalificacionEstandar> {
    return this.escritura.calificaciones;
  }

  get guardandoIds(): string[] {
    return this.escritura.guardandoIds;
  }

  get finalizando(): boolean {
    return this.escritura.finalizando;
  }

  get mensajeError(): string {
    return this.escritura.mensajeError || this.mensajeCarga;
  }
  set mensajeError(valor: string) {
    this.mensajeCarga = valor;
    this.escritura.mensajeError = valor;
  }

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return !!rol && this.rolesEscritura.includes(rol) && !this.soloLecturaQuery;
  }

  get firmaCalificaciones(): string {
    return construirFirmaCalificaciones(this.calificaciones);
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
          this.escritura.establecer(autoevaluacion);
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
    this.escritura.destruir();
  }

  calificar(evento: {
    estandarId: string;
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }): void {
    this.escritura.calificar(evento);
  }

  cambiarObservaciones(evento: { estandarId: string; observaciones: string | null }): void {
    this.escritura.cambiarObservaciones(evento);
  }

  finalizar(): void {
    this.escritura.finalizar();
  }
}
