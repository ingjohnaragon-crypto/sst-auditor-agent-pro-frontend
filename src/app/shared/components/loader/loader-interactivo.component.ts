import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
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
export class LoaderInteractivoComponent implements OnDestroy {
  private static contadorIds = 0;

  private _visible = false;
  private _modo: ModoLoader = 'bloqueante';

  @Input()
  set visible(valor: boolean) {
    this._visible = valor;
    this.sincronizarScrollLock();
  }
  get visible(): boolean {
    return this._visible;
  }

  @Input() titulo = 'Procesando…';
  @Input() mensaje?: string;
  @Input() pasos: PasoEjecucion[] = [];
  /** 0–100; null = indeterminado */
  @Input() progreso: number | null = null;

  @Input()
  set modo(valor: ModoLoader) {
    this._modo = valor;
    this.sincronizarScrollLock();
  }
  get modo(): ModoLoader {
    return this._modo;
  }

  @Input() cancelable = false;
  @Input() etiquetaCancelar = 'Cancelar';

  @Output() alCancelar = new EventEmitter<void>();

  readonly idTitulo = `loader-titulo-${++LoaderInteractivoComponent.contadorIds}`;

  private overflowBodyAnterior = '';
  private scrollBloqueado = false;

  get esBloqueante(): boolean {
    return this.modo === 'bloqueante';
  }

  get progresoEfectivo(): number | null {
    if (this.progreso === null) {
      return null;
    }
    return Math.min(100, Math.max(0, this.progreso));
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

  ngOnDestroy(): void {
    this.liberarScrollLock();
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
    if (this.visible && this.cancelable && this.esBloqueante) {
      this.alCancelar.emit();
    }
  }

  private sincronizarScrollLock(): void {
    const debeBloquear = this.visible && this.esBloqueante;
    if (debeBloquear && !this.scrollBloqueado) {
      this.overflowBodyAnterior = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.scrollBloqueado = true;
      return;
    }
    if (!debeBloquear && this.scrollBloqueado) {
      this.liberarScrollLock();
    }
  }

  private liberarScrollLock(): void {
    if (!this.scrollBloqueado) {
      return;
    }
    document.body.style.overflow = this.overflowBodyAnterior;
    this.scrollBloqueado = false;
  }
}
