import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ColorTarjetaResumen = 'indigo' | 'emerald' | 'amber' | 'sky';

@Component({
  selector: 'app-tarjeta-resumen',
  standalone: true,
  templateUrl: './tarjeta-resumen.component.html',
  styleUrls: ['./tarjeta-resumen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaResumenComponent {
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) valor: string | number = '—';
  @Input() subtitulo = '';
  @Input() color: ColorTarjetaResumen = 'indigo';
}
