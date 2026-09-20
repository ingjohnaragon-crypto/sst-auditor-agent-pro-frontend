export type CicloPhva = 'PLANEAR' | 'HACER' | 'VERIFICAR' | 'ACTUAR';

export const CICLOS_PHVA: readonly CicloPhva[] = ['PLANEAR', 'HACER', 'VERIFICAR', 'ACTUAR'];

export const ETIQUETAS_CICLO_PHVA: Record<CicloPhva, string> = {
  PLANEAR: 'I. Planear',
  HACER: 'II. Hacer',
  VERIFICAR: 'III. Verificar',
  ACTUAR: 'IV. Actuar',
};

export const ETIQUETAS_CICLO_PHVA_CORTAS: Record<CicloPhva, string> = {
  PLANEAR: 'Planear',
  HACER: 'Hacer',
  VERIFICAR: 'Verificar',
  ACTUAR: 'Actuar',
};
