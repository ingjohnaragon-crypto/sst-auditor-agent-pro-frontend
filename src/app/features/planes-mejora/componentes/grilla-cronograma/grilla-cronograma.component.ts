import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';
import type { ActividadCronograma } from '../../modelos/plan-mejora.model';

export interface CambioMesCronograma {
  actividad: ActividadCronograma;
  mes: number;
}

export interface ColumnaMes {
  numero: number;
  etiqueta: string;
}

export const COLUMNAS_CRONOGRAMA: ColumnaMes[] = [
  { numero: 1, etiqueta: 'Ene' },
  { numero: 2, etiqueta: 'Feb' },
  { numero: 3, etiqueta: 'Mar' },
  { numero: 4, etiqueta: 'Abr' },
  { numero: 5, etiqueta: 'May' },
  { numero: 6, etiqueta: 'Jun' },
  { numero: 7, etiqueta: 'Jul' },
  { numero: 8, etiqueta: 'Ago' },
  { numero: 9, etiqueta: 'Sep' },
  { numero: 10, etiqueta: 'Oct' },
  { numero: 11, etiqueta: 'Nov' },
  { numero: 12, etiqueta: 'Dic' },
];

@Component({
  selector: 'app-grilla-cronograma',
  standalone: true,
  imports: [NgFor, NgIf, SiTieneRolDirective],
  templateUrl: './grilla-cronograma.component.html',
  styleUrls: ['./grilla-cronograma.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrillaCronogramaComponent {
  private readonly autenticacion = inject(ServicioAutenticacion);

  @Input() actividades: ActividadCronograma[] = [];
  @Output() cambioMes = new EventEmitter<CambioMesCronograma>();
  @Output() quitar = new EventEmitter<string>();

  readonly columnas = COLUMNAS_CRONOGRAMA;

  readonly trackActividad = (_indice: number, actividad: ActividadCronograma): string =>
    actividad.id;

  get soloLectura(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return rol !== 'ADMINISTRADOR' && rol !== 'AUDITOR_SST';
  }

  marcada(actividad: ActividadCronograma, mes: number): boolean {
    return actividad.meses.includes(mes);
  }

  alCambiar(actividad: ActividadCronograma, mes: number, evento: Event): void {
    evento.preventDefault();
    this.cambioMes.emit({ actividad, mes });
  }

  alQuitar(actividadId: string): void {
    this.quitar.emit(actividadId);
  }
}
