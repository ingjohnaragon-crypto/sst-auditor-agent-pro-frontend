import type { ResultadoCalificacion } from './resultado-calificacion';

export interface CalificacionEstandar {
  /** Identificador de la fila `calificaciones_estandar`. Distinto de `estandar_id`. */
  id?: string | null;
  estandar_id: string;
  resultado: ResultadoCalificacion;
  puntaje: string;
  observaciones: string | null;
}
