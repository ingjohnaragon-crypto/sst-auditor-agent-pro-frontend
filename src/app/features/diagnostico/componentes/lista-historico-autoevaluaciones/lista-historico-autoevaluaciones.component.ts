import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { Autoevaluacion } from '../../modelos';

@Component({
  selector: 'app-lista-historico-autoevaluaciones',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './lista-historico-autoevaluaciones.component.html',
  styleUrls: ['./lista-historico-autoevaluaciones.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaHistoricoAutoevaluacionesComponent {
  @Input() items: Autoevaluacion[] = [];
  @Output() alVerDetalle = new EventEmitter<string>();

  readonly trackItem = (_indice: number, item: Autoevaluacion): string => item.id;

  etiquetaEstado(item: Autoevaluacion): string {
    return item.puntaje_total != null ? 'Finalizada' : 'Borrador';
  }
}
