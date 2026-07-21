import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'texto';
export type TamanoBoton = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-boton',
  standalone: true,
  imports: [NgIf],
  templateUrl: './boton.component.html',
  styleUrls: ['./boton.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotonComponent {
  /** El contenido se proyecta para permitir combinar texto e iconos libremente. */
  @Input() variante: VarianteBoton = 'primario';
  @Input() tamano: TamanoBoton = 'md';
  @Input() tipo: 'button' | 'submit' | 'reset' = 'button';
  @Input() deshabilitado = false;
  @Input() cargando = false;
  @Output() alHacerClic = new EventEmitter<MouseEvent>();

  private readonly clasesPorVariante: Record<VarianteBoton, string> = {
    primario: 'bg-marca text-white hover:bg-indigo-700 focus:ring-marca',
    secundario:
      'border border-slate-300 bg-superficie text-slate-700 hover:bg-fondo focus:ring-slate-400',
    peligro: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    texto: 'bg-transparent text-marca hover:bg-indigo-50 focus:ring-marca',
  };

  private readonly clasesPorTamano: Record<TamanoBoton, string> = {
    sm: 'min-h-8 px-3 py-1.5 text-xs',
    md: 'min-h-10 px-4 py-2 text-sm',
    lg: 'min-h-12 px-5 py-3 text-base',
  };

  get clases(): string {
    return `inline-flex items-center justify-center gap-2 rounded-control font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${this.clasesPorVariante[this.variante]} ${this.clasesPorTamano[this.tamano]}`;
  }

  manejarClic(evento: MouseEvent): void {
    if (!this.deshabilitado && !this.cargando) this.alHacerClic.emit(evento);
  }
}
