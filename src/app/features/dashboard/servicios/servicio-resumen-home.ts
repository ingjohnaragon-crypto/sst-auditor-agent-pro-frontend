import { Injectable } from '@angular/core';

import type { FilaActividadHome } from '../modelos/fila-actividad-home.model';

const ACTIVIDAD_INICIAL: FilaActividadHome[] = [
  {
    id: '1',
    fecha: '2026-07-18',
    evento: 'Inicio de sesión en SST-Audit Pro',
    estado: 'completado',
  },
  {
    id: '2',
    fecha: '2026-07-19',
    evento: 'Revisión de accesos del área de auditoría',
    estado: 'completado',
  },
  {
    id: '3',
    fecha: '2026-07-20',
    evento: 'Diagnóstico Resolución 0312 (pendiente de módulo)',
    estado: 'pendiente',
  },
  {
    id: '4',
    fecha: '2026-07-21',
    evento: 'Preparación de evidencias SG-SST',
    estado: 'en_curso',
  },
];

@Injectable({ providedIn: 'root' })
export class ServicioResumenHome {
  obtenerActividad(): FilaActividadHome[] {
    return ACTIVIDAD_INICIAL.map((fila) => ({ ...fila }));
  }

  /** Simula una actualización local sin HTTP. */
  refrescarActividad(): FilaActividadHome[] {
    const marca = new Date().toISOString().slice(0, 10);
    return [
      {
        id: `r-${Date.now()}`,
        fecha: marca,
        evento: 'Resumen de inicio actualizado',
        estado: 'completado',
      },
      ...this.obtenerActividad().slice(0, 3),
    ];
  }
}
