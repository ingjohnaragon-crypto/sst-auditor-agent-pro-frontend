import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AlertaComponent } from '@app/shared';

import { ListaHistoricoAutoevaluacionesComponent } from '../../componentes/lista-historico-autoevaluaciones/lista-historico-autoevaluaciones.component';
import { SelectorEmpresaComponent } from '../../componentes/selector-empresa/selector-empresa.component';
import type { Autoevaluacion, Empresa } from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEmpresas } from '../../servicios/servicio-empresas';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';

@Component({
  selector: 'app-pagina-historico-diagnostico',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    AlertaComponent,
    SelectorEmpresaComponent,
    ListaHistoricoAutoevaluacionesComponent,
  ],
  templateUrl: './pagina-historico-diagnostico.component.html',
  styleUrls: ['./pagina-historico-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaHistoricoDiagnosticoComponent implements OnInit, OnDestroy {
  private readonly empresasApi = inject(ServicioEmpresas);
  private readonly autoevaluacionesApi = inject(ServicioAutoevaluaciones);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();

  empresas: Empresa[] = [];
  items: Autoevaluacion[] = [];
  empresaId = '';
  cargando = true;
  mensajeError = '';

  ngOnInit(): void {
    this.suscripciones.add(
      this.empresasApi.listar().subscribe({
        next: (empresas) => {
          this.empresas = empresas;
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
  }

  seleccionarEmpresa(id: string): void {
    this.empresaId = id;
    this.items = [];
    this.mensajeError = '';
    if (!id) {
      this.cdr.markForCheck();
      return;
    }
    this.suscripciones.add(
      this.autoevaluacionesApi.listarPorEmpresa(id).subscribe({
        next: (items) => {
          this.items = items;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.mensajeError = mensajeErrorHttp(error);
          this.cdr.markForCheck();
        },
      })
    );
  }

  verDetalle(id: string): void {
    void this.router.navigate(['/diagnostico', id]);
  }
}
