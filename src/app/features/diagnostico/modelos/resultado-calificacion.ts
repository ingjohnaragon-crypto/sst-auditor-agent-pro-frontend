export type ResultadoCalificacion = 'CUMPLE' | 'NO_CUMPLE' | 'NO_APLICA';

export const RESULTADOS_CALIFICACION: readonly ResultadoCalificacion[] = [
  'CUMPLE',
  'NO_CUMPLE',
  'NO_APLICA',
];

export const ETIQUETAS_RESULTADO: Record<ResultadoCalificacion, string> = {
  CUMPLE: 'Cumple',
  NO_CUMPLE: 'No cumple',
  NO_APLICA: 'No aplica',
};
