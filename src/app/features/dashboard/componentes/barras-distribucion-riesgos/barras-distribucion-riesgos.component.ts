import { NgClass, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { DistribucionRiesgos } from '../../modelos/resumen-ejecutivo.model';

interface NivelBarra {
  clave: keyof DistribucionRiesgos;
  etiqueta: string;
  color: string;
}

const NIVELES: NivelBarra[] = [
  { clave: 'I', etiqueta: 'Nivel I', color: 'bg-red-500' },
  { clave: 'II', etiqueta: 'Nivel II', color: 'bg-orange-500' },
  { clave: 'III', etiqueta: 'Nivel III', color: 'bg-amber-400' },
  { clave: 'IV', etiqueta: 'Nivel IV', color: 'bg-emerald-500' },
];

@Component({
  selector: 'app-barras-distribucion-riesgos',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './barras-distribucion-riesgos.component.html',
  styleUrls: ['./barras-distribucion-riesgos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarrasDistribucionRiesgosComponent {
  @Input() distribucion: DistribucionRiesgos | null = null;

  readonly niveles = NIVELES;

  readonly trackNivel = (_indice: number, nivel: NivelBarra): string => nivel.clave;

  conteo(clave: keyof DistribucionRiesgos): number {
    return this.distribucion?.[clave] ?? 0;
  }

  get maximo(): number {
    return Math.max(this.conteo('I'), this.conteo('II'), this.conteo('III'), this.conteo('IV'));
  }

  ancho(clave: keyof DistribucionRiesgos): number {
    const maximo = this.maximo;
    if (maximo <= 0) {
      return 0;
    }
    return (this.conteo(clave) / maximo) * 100;
  }

  etiquetaAria(nivel: NivelBarra): string {
    return `${nivel.etiqueta}: ${this.conteo(nivel.clave)}`;
  }
}
