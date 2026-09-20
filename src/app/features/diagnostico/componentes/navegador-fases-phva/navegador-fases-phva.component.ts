import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { BotonComponent } from '@app/shared';

import type { AvanceFasePhva } from '../../utilidades/avance-por-ciclo';
import { cicloVecino } from '../../utilidades/avance-por-ciclo';
import type { CicloPhva } from '../../modelos';

@Component({
  selector: 'app-navegador-fases-phva',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, BotonComponent],
  templateUrl: './navegador-fases-phva.component.html',
  styleUrls: ['./navegador-fases-phva.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavegadorFasesPhvaComponent {
  @Input() fases: AvanceFasePhva[] = [];
  @Input() cicloActual: CicloPhva = 'PLANEAR';
  @Input() mostrarContinuar = true;
  @Input() mostrarStepper = true;
  @Input() mostrarAcciones = true;
  @Output() alSeleccionar = new EventEmitter<CicloPhva>();

  get faseActual(): AvanceFasePhva | undefined {
    return this.fases.find((fase) => fase.ciclo === this.cicloActual);
  }

  get anterior(): CicloPhva | null {
    return cicloVecino(this.cicloActual, -1);
  }

  get siguiente(): CicloPhva | null {
    return cicloVecino(this.cicloActual, 1);
  }

  get etiquetaSiguiente(): string {
    const siguiente = this.siguiente;
    if (!siguiente) {
      return '';
    }
    return this.fases.find((fase) => fase.ciclo === siguiente)?.etiquetaCorta ?? siguiente;
  }

  get textoPendientes(): string {
    const fase = this.faseActual;
    if (!fase) {
      return '';
    }
    const faltan = fase.total - fase.calificados;
    if (faltan === 1) {
      return `Falta 1 ítem en ${fase.etiquetaCorta}.`;
    }
    return `Faltan ${faltan} ítems en ${fase.etiquetaCorta}.`;
  }

  clasesFase(fase: AvanceFasePhva): string {
    const activa = fase.ciclo === this.cicloActual;
    if (activa) {
      return 'border-indigo-600 bg-indigo-50 text-indigo-800';
    }
    if (fase.completa) {
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    }
    return 'border-slate-200 bg-white text-slate-600 hover:border-slate-300';
  }

  seleccionar(ciclo: CicloPhva): void {
    this.alSeleccionar.emit(ciclo);
  }

  irAnterior(): void {
    if (this.anterior) {
      this.alSeleccionar.emit(this.anterior);
    }
  }

  irSiguiente(): void {
    if (this.siguiente) {
      this.alSeleccionar.emit(this.siguiente);
    }
  }
}
