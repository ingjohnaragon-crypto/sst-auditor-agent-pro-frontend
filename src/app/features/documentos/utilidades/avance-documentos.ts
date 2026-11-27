import type { DocumentoEmpresa } from '../modelos';

/** Avance del gestor: (no_PENDIENTE / total) * 100. */
export function calcularAvanceDocumentos(docs: DocumentoEmpresa[]): number {
  if (docs.length === 0) {
    return 0;
  }
  const hechos = docs.filter((d) => d.estado !== 'PENDIENTE').length;
  return Math.round((hechos / docs.length) * 100);
}

export function etiquetarFase(fase: string): string {
  switch (fase) {
    case 'PLANEAR':
      return 'Planear';
    case 'HACER':
      return 'Hacer';
    case 'VERIFICAR':
      return 'Verificar';
    case 'ACTUAR':
      return 'Actuar';
    default:
      return fase;
  }
}

export function etiquetarEstado(estado: string): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'CARGADO':
      return 'Cargado';
    case 'REVISADO':
      return 'Revisado';
    default:
      return estado;
  }
}
