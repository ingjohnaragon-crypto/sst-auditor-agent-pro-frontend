import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cabecera-diagnostico',
  standalone: true,
  imports: [NgIf],
  templateUrl: './cabecera-diagnostico.component.html',
  styleUrls: ['./cabecera-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabeceraDiagnosticoComponent {
  @Input() totalItems = 60;
  @Input() puntajeTotal: string | null = null;
}
