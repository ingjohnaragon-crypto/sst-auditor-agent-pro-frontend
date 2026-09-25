export interface Evidencia {
  id: string;
  calificacion_estandar_id: string;
  usuario_id: string;
  nombre_archivo: string;
  tipo_mime: string;
  tamano_bytes: number;
  ruta_almacenamiento: string;
  fecha_carga: string;
  activo: boolean;
}
