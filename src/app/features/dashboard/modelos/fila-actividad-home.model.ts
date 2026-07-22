export type EstadoActividadHome = 'completado' | 'pendiente' | 'en_curso';

export interface FilaActividadHome {
  id: string;
  fecha: string;
  evento: string;
  estado: EstadoActividadHome;
}
