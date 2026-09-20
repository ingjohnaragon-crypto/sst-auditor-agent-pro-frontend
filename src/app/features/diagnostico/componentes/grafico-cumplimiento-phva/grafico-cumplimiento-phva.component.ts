import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AlertaComponent, BotonComponent } from '@app/shared';

import {
  CICLOS_PHVA,
  ETIQUETAS_CICLO_PHVA_CORTAS,
  type CicloPhva,
  type CumplimientoFasePhva,
  type RespuestaCumplimientoPhva,
} from '../../modelos';

export type EstadoGraficoCumplimiento = 'cargando' | 'vacio' | 'error' | 'listo';
export type VarianteGraficoCumplimiento = 'oscuro' | 'claro';

export interface FaseGraficoPhva {
  ciclo: CicloPhva;
  etiqueta: string;
  fase: CumplimientoFasePhva | null;
  colorBarra: string;
}

const COLORES_BARRA: Record<CicloPhva, string> = {
  PLANEAR: 'bg-indigo-500',
  HACER: 'bg-emerald-500',
  VERIFICAR: 'bg-amber-500',
  ACTUAR: 'bg-sky-500',
};

@Component({
  selector: 'app-grafico-cumplimiento-phva',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AlertaComponent, BotonComponent],
  templateUrl: './grafico-cumplimiento-phva.component.html',
  styleUrls: ['./grafico-cumplimiento-phva.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoCumplimientoPhvaComponent {
  @Input() cumplimiento: RespuestaCumplimientoPhva | null = null;
  @Input() estado: EstadoGraficoCumplimiento = 'vacio';
  @Input() mensajeError = '';
  @Input() variante: VarianteGraficoCumplimiento = 'claro';
  @Output() alReintentar = new EventEmitter<void>();

  private static secuenciaTitulo = 0;

  readonly placeholders = CICLOS_PHVA;
  readonly idTitulo = `titulo-ciclo-phva-${++GraficoCumplimientoPhvaComponent.secuenciaTitulo}`;

  get clasesContenedor(): string {
    return this.variante === 'oscuro'
      ? 'relative z-10 text-white'
      : 'text-slate-800';
  }

  get clasesEtiqueta(): string {
    return this.variante === 'oscuro'
      ? 'sst-etiqueta mb-3 tracking-[0.25em] text-indigo-300'
      : 'sst-etiqueta mb-3 tracking-[0.25em] text-indigo-600';
  }

  get clasesPista(): string {
    return this.variante === 'oscuro' ? 'bg-slate-700/80' : 'bg-slate-200';
  }

  get clasesPlaceholder(): string {
    return this.variante === 'oscuro' ? 'bg-slate-700/40' : 'bg-slate-200';
  }

  get clasesChip(): string {
    return this.variante === 'oscuro'
      ? 'rounded-full bg-white/10 px-3 py-1'
      : 'rounded-full bg-indigo-50 px-3 py-1 text-indigo-800';
  }

  get fases(): FaseGraficoPhva[] {
    const mapa = new Map(
      (this.cumplimiento?.fases ?? []).map((fase) => [fase.ciclo_phva, fase] as const)
    );

    return CICLOS_PHVA.map((ciclo) => ({
      ciclo,
      etiqueta: ETIQUETAS_CICLO_PHVA_CORTAS[ciclo],
      fase: mapa.get(ciclo) ?? null,
      colorBarra: COLORES_BARRA[ciclo],
    }));
  }

  get distanciaAlUmbral(): string {
    const umbral = Number(this.cumplimiento?.umbral_plan_mejora);
    const puntaje = Number(this.cumplimiento?.puntaje_total);
    if (!Number.isFinite(umbral) || !Number.isFinite(puntaje)) {
      return '0.00';
    }
    return Math.max(0, umbral - puntaje).toFixed(2);
  }

  anchoBarra(porcentaje: string): number {
    const valor = Number(porcentaje);
    if (!Number.isFinite(valor)) {
      return 0;
    }
    return Math.min(100, Math.max(0, valor));
  }

  etiquetaAria(item: FaseGraficoPhva): string {
    if (!item.fase) {
      return `${item.etiqueta}: sin dato`;
    }
    return `${item.etiqueta}: ${item.fase.porcentaje_cumplimiento} por ciento`;
  }
}
