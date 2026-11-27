import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import type { FaseDocumentoPhva } from '../../modelos';
import { FASES_PHVA } from '../../modelos';
import { etiquetarFase } from '../../utilidades/avance-documentos';

@Component({
  selector: 'app-pestanas-fase-phva',
  standalone: true,
  imports: [NgFor],
  templateUrl: './pestanas-fase-phva.component.html',
  styleUrls: ['./pestanas-fase-phva.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PestanasFasePhvaComponent {
  @Input({ required: true }) faseActiva: FaseDocumentoPhva = 'PLANEAR';

  @Output() readonly alCambiarFase = new EventEmitter<FaseDocumentoPhva>();

  readonly fases = FASES_PHVA;
  readonly etiquetar = etiquetarFase;

  seleccionar(fase: FaseDocumentoPhva): void {
    if (fase !== this.faseActiva) {
      this.alCambiarFase.emit(fase);
    }
  }
}
