import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { BotonComponent } from '@app/shared';

@Component({
  selector: 'app-boton-finalizar-diagnostico',
  standalone: true,
  imports: [BotonComponent],
  templateUrl: './boton-finalizar-diagnostico.component.html',
  styleUrls: ['./boton-finalizar-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotonFinalizarDiagnosticoComponent {
  @Input() deshabilitado = true;
  @Input() cargando = false;
  @Output() alFinalizar = new EventEmitter<void>();
}
