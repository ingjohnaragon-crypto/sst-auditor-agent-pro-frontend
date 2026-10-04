export type ResultadoIrrenunciable = 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA' | 'SIN_CALIFICAR';

export interface DistribucionRiesgos {
  I: number;
  II: number;
  III: number;
  IV: number;
}

export interface IrrenunciableResumen {
  numeral: string;
  descripcion: string;
  resultado: ResultadoIrrenunciable;
}

export interface ResumenEjecutivo {
  empresa_id: string;
  cantidad_autoevaluaciones: number;
  autoevaluacion_id: string | null;
  requiere_plan_mejora: boolean;
  riesgos_nivel_i: number;
  riesgos_nivel_ii: number;
  distribucion_riesgos: DistribucionRiesgos;
  irrenunciables: IrrenunciableResumen[];
}
