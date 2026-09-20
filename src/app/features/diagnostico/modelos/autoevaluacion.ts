import type { CalificacionEstandar } from './calificacion-estandar';

export interface Autoevaluacion {
  id: string;
  empresa_id: string;
  usuario_id: string;
  fecha: string;
  puntaje_total: string | null;
  requiere_plan_mejora: boolean;
  calificaciones: CalificacionEstandar[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}
