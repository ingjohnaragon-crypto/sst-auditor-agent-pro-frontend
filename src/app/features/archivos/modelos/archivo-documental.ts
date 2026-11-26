export interface ArchivoDocumental {
  id: string;
  empresa_id: string;
  nombre_original: string;
  tipo_mime: string;
  tamano_bytes: number;
  fecha_carga: string;
  usuario_id: string;
  usuario_nombre: string | null;
}
