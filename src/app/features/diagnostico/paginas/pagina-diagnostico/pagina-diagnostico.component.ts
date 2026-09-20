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
import { ServicioEscrituraAutoevaluacion } from '../../servicios/servicio-escritura-autoevaluacion';
import { ServicioEstandaresMinimos } from '../../servicios/servicio-estandares-minimos';
import { fechaHoyIso } from '../../utilidades/fecha-hoy-iso';
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
  providers: [ServicioEscrituraAutoevaluacion],
  templateUrl: './pagina-diagnostico.component.html',
  styleUrls: ['./pagina-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDiagnosticoComponent implements OnInit, OnDestroy {
  private readonly empresasApi = inject(ServicioEmpresas);
  private readonly estandaresApi = inject(ServicioEstandaresMinimos);
  private readonly autoevaluacionesApi = inject(ServicioAutoevaluaciones);
  private readonly escritura = inject(ServicioEscrituraAutoevaluacion);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();

  readonly rolesEscritura = [...ROLES_ESCRITURA_DIAGNOSTICO];

  empresas: Empresa[] = [];
  estandares: EstandarMinimo[] = [];
  empresaId = '';
  cargando = true;
  creando = false;
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
  set calificaciones(valor: Record<string, CalificacionEstandar>) {
    this.escritura.calificaciones = valor;
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
    this.escritura.destruir();
  }

  seleccionarEmpresa(id: string): void {
    this.empresaId = id;
    this.escritura.reiniciar();
    this.mensajeCarga = '';
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
            this.escritura.establecer(autoevaluacion);
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
    this.escritura.calificar(evento);
  }

  cambiarObservaciones(evento: { estandarId: string; observaciones: string | null }): void {
    this.escritura.cambiarObservaciones(evento);
  }

  finalizar(): void {
    this.escritura.finalizar();
  }
}
