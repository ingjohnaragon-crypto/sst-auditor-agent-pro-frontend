import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { AceptabilidadRiesgo, InterpretacionNR } from '../../modelos';

@Component({
  selector: 'app-semaforo-riesgo',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './semaforo-riesgo.component.html',
  styleUrls: ['./semaforo-riesgo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemaforoRiesgoComponent {
  @Input() interpretacion: InterpretacionNR | null = null;
  @Input() aceptabilidad: AceptabilidadRiesgo | null = null;

  private readonly clasesPorNivel: Record<InterpretacionNR, string> = {
    I: 'border-red-300 bg-red-50 text-red-900',
    II: 'border-orange-300 bg-orange-50 text-orange-900',
    III: 'border-amber-300 bg-amber-50 text-amber-900',
    IV: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  };

  get visible(): boolean {
    return this.interpretacion !== null;
  }

  get clases(): string {
    if (!this.interpretacion) {
      return 'border-slate-200 bg-slate-50 text-slate-600';
    }
    return this.clasesPorNivel[this.interpretacion];
  }

  get etiqueta(): string {
    if (!this.interpretacion) {
      return '';
    }
    const aceptabilidad = this.aceptabilidad
      ? ` — ${this.aceptabilidad.replaceAll('_', ' ')}`
      : '';
    return `Nivel ${this.interpretacion}${aceptabilidad}`;
  }
}
