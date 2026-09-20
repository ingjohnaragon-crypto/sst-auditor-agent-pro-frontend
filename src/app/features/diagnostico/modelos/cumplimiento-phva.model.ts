import type { CicloPhva } from './ciclo-phva';

export interface CumplimientoFasePhva {
  ciclo_phva: CicloPhva;
  peso_maximo: string;
  puntaje_obtenido: string;
  porcentaje_cumplimiento: string;
  brecha: string;
}

export interface RespuestaCumplimientoPhva {
  autoevaluacion_id: string;
  empresa_id: string;
  perfil: string;
  puntaje_total: string;
  umbral_plan_mejora: string;
  requiere_plan_mejora: boolean;
  finalizada: boolean;
  fases: CumplimientoFasePhva[];
}
