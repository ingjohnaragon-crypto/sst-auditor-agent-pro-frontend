import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

export type TipoAlerta = 'exito' | 'informativa' | 'advertencia' | 'error';

@Component({
  selector: 'app-alerta',
  standalone: true,
  imports: [NgIf],
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertaComponent {
  @Input() tipo: TipoAlerta = 'informativa';
  @Input() titulo = '';
  @Input({ required: true }) mensaje!: string;
  @Input() cerrable = false;
  @Output() alCerrar = new EventEmitter<void>();

  private readonly clasesPorTipo: Record<TipoAlerta, string> = {
    exito: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    informativa: 'border-sky-200 bg-sky-50 text-sky-900',
    advertencia: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  };

  get clases(): string {
    return `flex items-start gap-3 rounded-control border p-4 ${this.clasesPorTipo[this.tipo]}`;
  }

  get rol(): 'alert' | 'status' {
    return this.tipo === 'error' || this.tipo === 'advertencia' ? 'alert' : 'status';
  }

  get ariaLive(): 'assertive' | 'polite' {
    return this.rol === 'alert' ? 'assertive' : 'polite';
  }
}
