export interface ActividadCronograma {
  id: string;
  descripcion: string;
  responsable: string;
  indicador: string;
  meses: number[];
}

export interface PlanMejora {
  id: string;
  empresa_id: string;
  autoevaluacion_id: string;
  actividades: ActividadCronograma[];
}

export interface SolicitudActividadCronograma {
  descripcion: string;
  responsable: string;
  indicador: string;
  meses: number[];
}
