import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ETIQUETAS_CICLO_PHVA, type CalificacionEstandar, type CicloPhva, type EstandarMinimo, type ResultadoCalificacion } from '../../modelos';
import { ItemCalificacionComponent } from '../item-calificacion/item-calificacion.component';

@Component({
  selector: 'app-grupo-phva',
  standalone: true,
  imports: [NgFor, NgIf, ItemCalificacionComponent],
  templateUrl: './grupo-phva.component.html',
  styleUrls: ['./grupo-phva.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrupoPhvaComponent {
  @Input({ required: true }) ciclo!: CicloPhva;
  @Input() items: EstandarMinimo[] = [];
  @Input() calificados = 0;
  @Input() calificaciones: Record<string, CalificacionEstandar> = {};
  @Input() readonly = false;
  @Input() guardandoIds: readonly string[] = [];
  @Output() alCalificar = new EventEmitter<{
    estandarId: string;
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }>();
  @Output() alCambiarObservaciones = new EventEmitter<{
    estandarId: string;
    observaciones: string | null;
  }>();

  get titulo(): string {
    return ETIQUETAS_CICLO_PHVA[this.ciclo];
  }

  readonly trackItem = (_indice: number, item: EstandarMinimo): string => item.id;

  estaGuardando(id: string): boolean {
    return this.guardandoIds.includes(id);
  }

  calificacionDe(id: string): CalificacionEstandar | null {
    return this.calificaciones[id] ?? null;
  }
}
