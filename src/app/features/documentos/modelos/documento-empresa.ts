export type FaseDocumentoPhva = 'PLANEAR' | 'HACER' | 'VERIFICAR' | 'ACTUAR';

export type EstadoDocumentoEmpresa = 'PENDIENTE' | 'CARGADO' | 'REVISADO';

export interface DocumentoEmpresa {
  id: string | null;
  empresa_id: string;
  tipo_id: string;
  tipo_codigo: string;
  tipo_nombre: string;
  fase: FaseDocumentoPhva;
  estado: EstadoDocumentoEmpresa;
  fecha_carga: string | null;
  nombre_original: string | null;
  tipo_mime: string | null;
  tamano_bytes: number | null;
  usuario_nombre: string | null;
}

export interface TipoDocumentoSst {
  id: string;
  codigo: string;
  nombre: string;
  fase: FaseDocumentoPhva;
  descripcion: string;
  obligatorio: boolean;
  estandares_ids: string[];
}

/** Vista de tarjeta: documento + metadatos del catálogo. */
export interface DocumentoVista {
  documento: DocumentoEmpresa;
  obligatorio: boolean;
  descripcion: string;
}

export const FASES_PHVA: readonly FaseDocumentoPhva[] = [
  'PLANEAR',
  'HACER',
  'VERIFICAR',
  'ACTUAR',
];
