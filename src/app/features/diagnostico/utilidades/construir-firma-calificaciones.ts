import type { CalificacionEstandar } from '../modelos';

export function construirFirmaCalificaciones(
  calificaciones: Record<string, CalificacionEstandar>
): string {
  return Object.values(calificaciones)
    .map((item) => `${item.estandar_id}:${item.resultado}:${item.puntaje}`)
    .sort()
    .join('|');
}
