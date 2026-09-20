import { agruparEstandaresPorCiclo } from './agrupar-estandares-por-ciclo';
import type { EstandarMinimo } from '../modelos';

describe('agruparEstandaresPorCiclo', () => {
  it('should agrupar y ordenar por numeral', () => {
    const estandares: EstandarMinimo[] = [
      {
        id: '2',
        ciclo_phva: 'HACER',
        numeral: '2.2',
        descripcion: 'B',
        valor_porcentual: '1',
      },
      {
        id: '1',
        ciclo_phva: 'HACER',
        numeral: '2.1',
        descripcion: 'A',
        valor_porcentual: '1',
      },
      {
        id: '3',
        ciclo_phva: 'PLANEAR',
        numeral: '1.1',
        descripcion: 'C',
        valor_porcentual: '1',
      },
    ];

    const grupos = agruparEstandaresPorCiclo(estandares);
    expect(grupos.HACER.map((item) => item.id)).toEqual(['1', '2']);
    expect(grupos.PLANEAR).toHaveLength(1);
    expect(grupos.VERIFICAR).toEqual([]);
  });
});
