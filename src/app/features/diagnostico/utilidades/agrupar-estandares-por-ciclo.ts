import { CICLOS_PHVA, type CicloPhva, type EstandarMinimo } from '../modelos';

export function agruparEstandaresPorCiclo(
  estandares: EstandarMinimo[]
): Record<CicloPhva, EstandarMinimo[]> {
  const grupos = {
    PLANEAR: [] as EstandarMinimo[],
    HACER: [] as EstandarMinimo[],
    VERIFICAR: [] as EstandarMinimo[],
    ACTUAR: [] as EstandarMinimo[],
  };

  for (const estandar of estandares) {
    grupos[estandar.ciclo_phva].push(estandar);
  }

  for (const ciclo of CICLOS_PHVA) {
    grupos[ciclo].sort((a, b) => a.numeral.localeCompare(b.numeral, 'es'));
  }

  return grupos;
}
