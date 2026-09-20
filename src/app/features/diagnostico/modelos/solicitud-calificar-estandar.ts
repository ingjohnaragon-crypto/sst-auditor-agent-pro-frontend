import type { ResultadoCalificacion } from './resultado-calificacion';

export interface SolicitudCalificarEstandar {
  resultado: ResultadoCalificacion;
  observaciones?: string | null;
}
