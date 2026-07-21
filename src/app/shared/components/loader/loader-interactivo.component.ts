import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { BotonComponent } from '../boton/boton.component';
import type { ModoLoader, PasoEjecucion } from './paso-ejecucion.model';

@Component({
  selector: 'app-loader-interactivo',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgTemplateOutlet,
    BotonComponent,
    CdkTrapFocus,
  ],
  templateUrl: './loader-interactivo.component.html',
  styleUrls: ['./loader-interactivo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderInteractivoComponent {
  @Input() visible = false;
  @Input() titulo = 'Procesando…';
  @Input() mensaje?: string;
  @Input() pasos: PasoEjecucion[] = [];
  /** 0–100; null = indeterminado */
  @Input() progreso: number | null = null;
  @Input() modo: ModoLoader = 'bloqueante';
  @Input() cancelable = false;
  @Input() etiquetaCancelar = 'Cancelar';

  @Output() alCancelar = new EventEmitter<void>();

  readonly idTitulo = 'loader-titulo';

  get esBloqueante(): boolean {
    return this.modo === 'bloqueante';
  }

  get pasoActivo(): PasoEjecucion | undefined {
    return this.pasos.find((p) => p.estado === 'activo');
  }

  get textoAnuncio(): string {
    const activo = this.pasoActivo;
    if (activo) {
      return activo.detalle ? `${activo.etiqueta}. ${activo.detalle}` : activo.etiqueta;
    }
    return this.mensaje ?? this.titulo;
  }

  trackPorId(_indice: number, paso: PasoEjecucion): string {
    return paso.id;
  }

  cancelar(): void {
    if (this.cancelable) {
      this.alCancelar.emit();
    }
  }

  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    if (this.visible && this.cancelable) {
      this.alCancelar.emit();
    }
  }
}
