import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';

import type { RespuestaCumplimientoPhva } from '../../modelos';
import { ServicioCumplimientoPhva } from '../../servicios/servicio-cumplimiento-phva';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';
import {
  GraficoCumplimientoPhvaComponent,
  type EstadoGraficoCumplimiento,
  type VarianteGraficoCumplimiento,
} from '../grafico-cumplimiento-phva/grafico-cumplimiento-phva.component';

export const DEBOUNCE_RECARGA_CUMPLIMIENTO_MS = 400;

@Component({
  selector: 'app-panel-cumplimiento-phva',
  standalone: true,
  imports: [GraficoCumplimientoPhvaComponent],
  templateUrl: './panel-cumplimiento-phva.component.html',
  styleUrls: ['./panel-cumplimiento-phva.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelCumplimientoPhvaComponent implements OnChanges, OnDestroy {
  @Input() autoevaluacionId: string | null = null;
  @Input() recarga: unknown = null;
  @Input() variante: VarianteGraficoCumplimiento = 'claro';
  @Output() alCargarCumplimiento = new EventEmitter<RespuestaCumplimientoPhva | null>();

  estado: EstadoGraficoCumplimiento = 'vacio';
  cumplimiento: RespuestaCumplimientoPhva | null = null;
  mensajeError = '';

  private readonly api = inject(ServicioCumplimientoPhva);
  private readonly cdr = inject(ChangeDetectorRef);
  private carga: Subscription | null = null;
  private secuencia = 0;
  private debounceRecarga: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['autoevaluacionId']) {
      this.limpiarDebounceRecarga();
      this.cargar({ silencioso: false });
      return;
    }

    if (changes['recarga'] && !changes['recarga'].firstChange) {
      this.programarRecarga();
    }
  }

  ngOnDestroy(): void {
    this.limpiarDebounceRecarga();
    this.carga?.unsubscribe();
  }

  reintentar(): void {
    this.limpiarDebounceRecarga();
    this.cargar({ silencioso: false });
  }

  private programarRecarga(): void {
    this.limpiarDebounceRecarga();
    this.debounceRecarga = setTimeout(() => {
      this.debounceRecarga = null;
      this.cargar({ silencioso: true });
    }, DEBOUNCE_RECARGA_CUMPLIMIENTO_MS);
  }

  private limpiarDebounceRecarga(): void {
    if (this.debounceRecarga !== null) {
      clearTimeout(this.debounceRecarga);
      this.debounceRecarga = null;
    }
  }

  private cargar(opciones: { silencioso: boolean }): void {
    const id = this.autoevaluacionId?.trim() ? this.autoevaluacionId.trim() : null;
    this.secuencia += 1;
    const secuencia = this.secuencia;
    this.carga?.unsubscribe();
    this.carga = null;

    if (!id) {
      this.estado = 'vacio';
      this.cumplimiento = null;
      this.mensajeError = '';
      this.alCargarCumplimiento.emit(null);
      this.cdr.markForCheck();
      return;
    }

    const silencioso = opciones.silencioso && this.estado === 'listo' && this.cumplimiento !== null;
    if (!silencioso) {
      this.estado = 'cargando';
      this.cumplimiento = null;
      this.mensajeError = '';
      this.cdr.markForCheck();
    }

    this.carga = this.api.obtenerCumplimiento(id).subscribe({
      next: (datos) => {
        if (secuencia !== this.secuencia) {
          return;
        }
        this.cumplimiento = datos;
        this.estado = 'listo';
        this.mensajeError = '';
        this.alCargarCumplimiento.emit(datos);
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        if (secuencia !== this.secuencia) {
          return;
        }
        this.estado = 'error';
        this.cumplimiento = null;
        this.mensajeError = mensajeErrorHttp(error);
        this.alCargarCumplimiento.emit(null);
        this.cdr.markForCheck();
      },
    });
  }
}
