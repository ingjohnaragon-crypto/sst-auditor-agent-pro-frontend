import {
  CICLOS_PHVA,
  ETIQUETAS_CICLO_PHVA,
  ETIQUETAS_CICLO_PHVA_CORTAS,
  type CalificacionEstandar,
  type CicloPhva,
  type EstandarMinimo,
} from '../modelos';
import { agruparEstandaresPorCiclo } from './agrupar-estandares-por-ciclo';

export interface AvanceFasePhva {
  ciclo: CicloPhva;
  etiqueta: string;
  etiquetaCorta: string;
  numero: number;
  total: number;
  calificados: number;
  completa: boolean;
}

export function avancesPorFase(
  estandares: EstandarMinimo[],
  calificaciones: Record<string, CalificacionEstandar>
): AvanceFasePhva[] {
  const grupos = agruparEstandaresPorCiclo(estandares);
  return CICLOS_PHVA.map((ciclo, indice) => {
    const items = grupos[ciclo];
    const calificados = items.filter((item) => calificaciones[item.id]).length;
    return {
      ciclo,
      etiqueta: ETIQUETAS_CICLO_PHVA[ciclo],
      etiquetaCorta: ETIQUETAS_CICLO_PHVA_CORTAS[ciclo],
      numero: indice + 1,
      total: items.length,
      calificados,
      completa: items.length > 0 && calificados >= items.length,
    };
  });
}

export function primeraFaseIncompleta(
  estandares: EstandarMinimo[],
  calificaciones: Record<string, CalificacionEstandar>
): CicloPhva {
  const avances = avancesPorFase(estandares, calificaciones);
  const incompleta = avances.find((fase) => fase.total > 0 && !fase.completa);
  return incompleta?.ciclo ?? 'PLANEAR';
}

export function ultimaFaseConItems(estandares: EstandarMinimo[]): CicloPhva {
  const grupos = agruparEstandaresPorCiclo(estandares);
  for (let indice = CICLOS_PHVA.length - 1; indice >= 0; indice -= 1) {
    const ciclo = CICLOS_PHVA[indice];
    if (grupos[ciclo].length > 0) {
      return ciclo;
    }
  }
  return 'PLANEAR';
}

export function cicloVecino(ciclo: CicloPhva, delta: -1 | 1): CicloPhva | null {
  const indice = CICLOS_PHVA.indexOf(ciclo) + delta;
  return CICLOS_PHVA[indice] ?? null;
}
