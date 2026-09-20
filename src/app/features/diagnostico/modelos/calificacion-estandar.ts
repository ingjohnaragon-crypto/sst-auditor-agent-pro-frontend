import type { ResultadoCalificacion } from './resultado-calificacion';

export interface CalificacionEstandar {
  estandar_id: string;
  resultado: ResultadoCalificacion;
  puntaje: string;
  observaciones: string | null;
}
