import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import {
  CONFIGURACION_LOADER_POR_DEFECTO,
  ConfiguracionLoader,
  EstadoPasoEjecucion,
  PasoEjecucion,
} from './paso-ejecucion.model';

function clampearProgreso(valor: number | null | undefined): number | null | undefined {
  if (valor === undefined) {
    return undefined;
  }
  if (valor === null) {
    return null;
  }
  return Math.min(100, Math.max(0, valor));
}

@Injectable({ providedIn: 'root' })
export class ServicioLoader {
  private readonly sujeto = new BehaviorSubject<ConfiguracionLoader | null>(null);
  private readonly cancelaciones = new Subject<void>();

  readonly estado$: Observable<ConfiguracionLoader | null> = this.sujeto.asObservable();
  readonly alCancelar$: Observable<void> = this.cancelaciones.asObservable();

  mostrar(parcial: Partial<ConfiguracionLoader> = {}): void {
    const progreso =
      clampearProgreso(parcial.progreso) ?? CONFIGURACION_LOADER_POR_DEFECTO.progreso;
    this.sujeto.next({
      ...CONFIGURACION_LOADER_POR_DEFECTO,
      ...parcial,
      progreso,
      pasos: (parcial.pasos ?? CONFIGURACION_LOADER_POR_DEFECTO.pasos).map((p) => ({ ...p })),
      visible: parcial.visible ?? true,
    });
  }

  actualizar(parcial: Partial<ConfiguracionLoader>): void {
    const actual = this.sujeto.value;
    if (!actual) {
      return;
    }
    const progreso =
      parcial.progreso !== undefined
        ? (clampearProgreso(parcial.progreso) as number | null)
        : actual.progreso;
    this.sujeto.next({
      ...actual,
      ...parcial,
      progreso,
      pasos: (parcial.pasos ?? actual.pasos).map((p) => ({ ...p })),
    });
  }

  actualizarPaso(id: string, estado: EstadoPasoEjecucion, detalle?: string): void {
    const actual = this.sujeto.value;
    if (!actual) {
      return;
    }
    const pasos: PasoEjecucion[] = actual.pasos.map((paso) =>
      paso.id === id
        ? {
            ...paso,
            estado,
            detalle: detalle !== undefined ? detalle : paso.detalle,
          }
        : { ...paso }
    );
    this.sujeto.next({ ...actual, pasos });
  }

  ocultar(): void {
    this.sujeto.next(null);
  }

  /** Notifica cancelación y oculta el loader (UX por defecto del plan). */
  notificarCancelacion(): void {
    this.cancelaciones.next();
    this.ocultar();
  }
}
