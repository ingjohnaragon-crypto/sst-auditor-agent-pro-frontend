import { Injectable, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';

@Injectable({ providedIn: 'root' })
export class ServicioModal {
  private readonly dialogo = inject(Dialog);
  private referenciaActiva: DialogRef<unknown, unknown> | null = null;

  abrir<R = unknown, D = unknown, C = unknown>(
    componente: ComponentType<C>,
    configuracion?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    // Un solo diálogo activo: cerrar el anterior antes de abrir otro.
    this.referenciaActiva?.close();

    const referencia = this.dialogo.open<R, D, C>(componente, {
      disableClose: false,
      hasBackdrop: true,
      // Por encima de la barra lateral (z-50); el CSS global refuerza el container.
      ...configuracion,
    });
    this.referenciaActiva = referencia as DialogRef<unknown, unknown>;
    referencia.closed.subscribe(() => {
      if (this.referenciaActiva === (referencia as DialogRef<unknown, unknown>)) {
        this.referenciaActiva = null;
      }
    });
    return referencia;
  }

  cerrar(resultado?: unknown): void {
    this.referenciaActiva?.close(resultado);
  }
}
