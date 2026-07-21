export type EstadoPasoEjecucion = 'pendiente' | 'activo' | 'completado' | 'error';

export interface PasoEjecucion {
  id: string;
  etiqueta: string;
  detalle?: string;
  estado: EstadoPasoEjecucion;
}

export type ModoLoader = 'bloqueante' | 'inline';

export interface ConfiguracionLoader {
  visible: boolean;
  titulo: string;
  mensaje?: string;
  pasos: PasoEjecucion[];
  /** 0–100; null = indeterminado */
  progreso: number | null;
  modo: ModoLoader;
  cancelable: boolean;
  etiquetaCancelar: string;
}

export const CONFIGURACION_LOADER_POR_DEFECTO: ConfiguracionLoader = {
  visible: true,
  titulo: 'Procesando…',
  mensaje: undefined,
  pasos: [],
  progreso: null,
  modo: 'bloqueante',
  cancelable: false,
  etiquetaCancelar: 'Cancelar',
};
