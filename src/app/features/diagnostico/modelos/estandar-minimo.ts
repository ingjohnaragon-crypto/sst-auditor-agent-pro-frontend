import type { CicloPhva } from './ciclo-phva';

export interface EstandarMinimo {
  id: string;
  ciclo_phva: CicloPhva;
  numeral: string;
  descripcion: string;
  valor_porcentual: string;
}
