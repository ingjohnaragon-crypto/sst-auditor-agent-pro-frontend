import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';

import {
  type Autoevaluacion,
  type CalificacionEstandar,
  type CicloPhva,
  type EstandarMinimo,
  type ResultadoCalificacion,
  TOTAL_ESTANDARES_MINIMOS,
} from '../../modelos';
import {
  avancesPorFase,
  primeraFaseIncompleta,
  ultimaFaseConItems,
  type AvanceFasePhva,
} from '../../utilidades/avance-por-ciclo';
import { agruparEstandaresPorCiclo } from '../../utilidades/agrupar-estandares-por-ciclo';
import { BarraAvanceDiagnosticoComponent } from '../barra-avance-diagnostico/barra-avance-diagnostico.component';
import { BotonFinalizarDiagnosticoComponent } from '../boton-finalizar-diagnostico/boton-finalizar-diagnostico.component';
import { CabeceraDiagnosticoComponent } from '../cabecera-diagnostico/cabecera-diagnostico.component';
import { GrupoPhvaComponent } from '../grupo-phva/grupo-phva.component';
import { NavegadorFasesPhvaComponent } from '../navegador-fases-phva/navegador-fases-phva.component';
import { ResultadoFinalizacionComponent } from '../resultado-finalizacion/resultado-finalizacion.component';

@Component({
  selector: 'app-panel-matriz-diagnostico',
  standalone: true,
  imports: [
    NgIf,
    CabeceraDiagnosticoComponent,
    BarraAvanceDiagnosticoComponent,
    NavegadorFasesPhvaComponent,
    GrupoPhvaComponent,
    ResultadoFinalizacionComponent,
    BotonFinalizarDiagnosticoComponent,
  ],
  templateUrl: './panel-matriz-diagnostico.component.html',
  styleUrls: ['./panel-matriz-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelMatrizDiagnosticoComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() estandares: EstandarMinimo[] = [];
  @Input() calificaciones: Record<string, CalificacionEstandar> = {};
  @Input() autoevaluacion: Autoevaluacion | null = null;
  @Input() soloLectura = false;
  @Input() puedeEscribir = true;
  @Input() guardandoIds: readonly string[] = [];
  @Input() finalizando = false;
  @Output() alCalificar = new EventEmitter<{
    estandarId: string;
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }>();
  @Output() alCambiarObservaciones = new EventEmitter<{
    estandarId: string;
    observaciones: string | null;
  }>();
  @Output() alFinalizar = new EventEmitter<void>();

  readonly total = TOTAL_ESTANDARES_MINIMOS;
  cicloActual: CicloPhva = 'PLANEAR';

  ngOnInit(): void {
    this.cicloActual = this.finalizada
      ? 'PLANEAR'
      : primeraFaseIncompleta(this.estandares, this.calificaciones);
  }

  get fases(): AvanceFasePhva[] {
    return avancesPorFase(this.estandares, this.calificaciones);
  }

  get itemsFaseActual(): EstandarMinimo[] {
    return agruparEstandaresPorCiclo(this.estandares)[this.cicloActual] ?? [];
  }

  get calificadosFaseActual(): number {
    return this.itemsFaseActual.filter((item) => this.calificaciones[item.id]).length;
  }

  get esUltimaFase(): boolean {
    return this.cicloActual === ultimaFaseConItems(this.estandares);
  }

  get calificados(): number {
    return Object.keys(this.calificaciones).length;
  }

  get finalizada(): boolean {
    return this.autoevaluacion?.puntaje_total != null;
  }

  get readonly(): boolean {
    return this.soloLectura || this.finalizada || !this.puedeEscribir;
  }

  get puedeFinalizar(): boolean {
    return this.puedeEscribir && !this.finalizada && this.calificados >= this.total;
  }

  seleccionarFase(ciclo: CicloPhva): void {
    this.cicloActual = ciclo;
    this.cdr.markForCheck();
  }
}
