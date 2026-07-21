import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';

@Injectable({ providedIn: 'root' })
export class ServicioModal {
  private cerrarActivo: ((resultado?: unknown) => void) | null = null;

  constructor(private readonly dialogo: Dialog) {}

  abrir<R = unknown, T = unknown>(componente: ComponentType<T>, configuracion?: DialogConfig<unknown, DialogRef<R, T>>): DialogRef<R, T> {
    const referencia = this.dialogo.open<R, unknown, T>(componente, configuracion);
    this.cerrarActivo = (resultado?: unknown) => referencia.close(resultado as R);
    referencia.closed.subscribe(() => { this.cerrarActivo = null; });
    return referencia;
  }

  cerrar(resultado?: unknown): void { this.cerrarActivo?.(resultado); }
}
