import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  ETIQUETAS_RESULTADO,
  RESULTADOS_CALIFICACION,
  type CalificacionEstandar,
  type EstandarMinimo,
  type ResultadoCalificacion,
} from '../../modelos';

@Component({
  selector: 'app-item-calificacion',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './item-calificacion.component.html',
  styleUrls: ['./item-calificacion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemCalificacionComponent implements OnChanges {
  @Input({ required: true }) estandar!: EstandarMinimo;
  @Input() calificacion: CalificacionEstandar | null = null;
  @Input() readonly = false;
  @Input() guardando = false;
  @Output() alCalificar = new EventEmitter<{
    resultado: ResultadoCalificacion;
    observaciones: string | null;
  }>();
  @Output() alCambiarObservaciones = new EventEmitter<string | null>();

  readonly resultados = RESULTADOS_CALIFICACION;
  readonly etiquetas = ETIQUETAS_RESULTADO;
  observaciones = '';

  get resultadoActual(): ResultadoCalificacion | null {
    return this.calificacion?.resultado ?? null;
  }

  get clasesTarjeta(): string {
    switch (this.resultadoActual) {
      case 'CUMPLE':
        return 'border-emerald-200 bg-emerald-50/80';
      case 'NO_CUMPLE':
        return 'border-red-200 bg-red-50/80';
      case 'NO_APLICA':
        return 'border-blue-200 bg-blue-50/80';
      default:
        return 'border-slate-100 bg-white';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['calificacion']) {
      this.observaciones = this.calificacion?.observaciones ?? '';
    }
  }

  clasesBoton(resultado: ResultadoCalificacion): string {
    const activo = this.resultadoActual === resultado;
    const base =
      'min-h-11 rounded-2xl border-2 px-2 py-2 text-[10px] font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-60';
    if (!activo) {
      return `${base} border-slate-200 bg-white text-slate-500 hover:border-slate-300`;
    }
    if (resultado === 'CUMPLE') {
      return `${base} border-emerald-500 bg-emerald-500 text-white`;
    }
    if (resultado === 'NO_CUMPLE') {
      return `${base} border-red-500 bg-red-500 text-white`;
    }
    return `${base} border-blue-500 bg-blue-500 text-white`;
  }

  seleccionar(resultado: ResultadoCalificacion): void {
    if (this.readonly || this.guardando) {
      return;
    }
    this.alCalificar.emit({
      resultado,
      observaciones: this.observaciones.trim() ? this.observaciones.trim() : null,
    });
  }

  alEscribirObservaciones(valor: string): void {
    this.observaciones = valor;
    if (this.readonly) {
      return;
    }
    this.alCambiarObservaciones.emit(valor.trim() ? valor.trim() : null);
  }
}
