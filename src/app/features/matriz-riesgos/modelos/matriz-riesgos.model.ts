export type ClasificacionPeligro =
  | "BIOLOGICO"
  | "FISICO"
  | "QUIMICO"
  | "PSICOSOCIAL"
  | "BIOMECANICO"
  | "CONDICIONES_SEGURIDAD"
  | "FENOMENOS_NATURALES";

export type TipoControl = "ELIMINACION" | "SUSTITUCION" | "INGENIERIA" | "ADMINISTRATIVO" | "EPP";

export type InterpretacionNR = "I" | "II" | "III" | "IV";
export type NivelDeficiencia = 10 | 6 | 2 | 0;
export type NivelExposicion = 4 | 3 | 2 | 1;
export type NivelConsecuencia = 100 | 60 | 25 | 10;

export type AceptabilidadRiesgo =
  "NO_ACEPTABLE" | "ACEPTABLE_CON_CONTROL" | "MEJORABLE" | "ACEPTABLE";

export interface EmpresaMatriz {
  id: string;
  razon_social: string;
  nit: string;
}

export interface ProcesoActividad {
  id: string;
  empresa_id: string;
  nombre: string;
  es_rutinaria: boolean;
  zona_lugar: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SolicitudProcesoActividad {
  nombre: string;
  es_rutinaria: boolean;
  zona_lugar?: string | null;
}

export type SolicitudActualizarProceso = Partial<SolicitudProcesoActividad>;

export interface Peligro {
  id: string;
  proceso_actividad_id: string;
  clasificacion: ClasificacionPeligro;
  descripcion: string;
  efectos_posibles: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SolicitudPeligro {
  clasificacion: ClasificacionPeligro;
  descripcion: string;
  efectos_posibles?: string | null;
}

export type SolicitudActualizarPeligro = Partial<SolicitudPeligro>;

export interface EvaluacionRiesgo {
  id: string;
  peligro_id: string;
  nivel_deficiencia: number;
  nivel_exposicion: number;
  nivel_consecuencia: number;
  nivel_probabilidad: number;
  nivel_riesgo: number;
  interpretacion_nr: InterpretacionNR;
  aceptabilidad: AceptabilidadRiesgo;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/** El backend calcula todos los campos derivados; nunca deben enviarse aquí. */
export interface SolicitudEvaluacion {
  nivel_deficiencia: NivelDeficiencia;
  nivel_exposicion: NivelExposicion;
  nivel_consecuencia: NivelConsecuencia;
}

export interface ControlRiesgo {
  id: string;
  evaluacion_riesgo_id: string;
  tipo: TipoControl;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SolicitudControl {
  tipo: TipoControl;
  descripcion: string;
}

export type SolicitudActualizarControl = Partial<SolicitudControl>;

export interface PeligroMatriz {
  peligro: Peligro;
  evaluacion: EvaluacionRiesgo | null;
  controles: ControlRiesgo[];
}

export interface ProcesoMatriz {
  proceso: ProcesoActividad;
  peligros: PeligroMatriz[];
}

export interface RespuestaMatrizRiesgos {
  empresa_id: string;
  procesos: ProcesoMatriz[];
}

export interface RespuestaErrorApi {
  exito: false;
  codigo: string;
  mensaje: string;
  detalle: Record<string, unknown>[] | Record<string, unknown> | null;
}
