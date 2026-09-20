import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-barra-avance-diagnostico',
  standalone: true,
  templateUrl: './barra-avance-diagnostico.component.html',
  styleUrls: ['./barra-avance-diagnostico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraAvanceDiagnosticoComponent {
  @Input() calificados = 0;
  @Input() total = 60;

  get porcentaje(): number {
    if (this.total <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.calificados / this.total) * 100));
  }

  get completa(): boolean {
    return this.calificados >= this.total && this.total > 0;
  }
}
