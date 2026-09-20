import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-resultado-finalizacion',
  standalone: true,
  imports: [NgIf],
  templateUrl: './resultado-finalizacion.component.html',
  styleUrls: ['./resultado-finalizacion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadoFinalizacionComponent {
  @Input() puntajeTotal: string | null = null;
  @Input() requierePlanMejora = false;
}
