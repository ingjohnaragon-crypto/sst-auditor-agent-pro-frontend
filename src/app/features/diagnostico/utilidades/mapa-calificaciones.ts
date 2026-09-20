import type { CalificacionEstandar } from '../modelos';

export function mapaCalificaciones(
  calificaciones: CalificacionEstandar[] | null | undefined
): Record<string, CalificacionEstandar> {
  const mapa: Record<string, CalificacionEstandar> = {};
  for (const item of calificaciones ?? []) {
    mapa[item.estandar_id] = item;
  }
  return mapa;
}
