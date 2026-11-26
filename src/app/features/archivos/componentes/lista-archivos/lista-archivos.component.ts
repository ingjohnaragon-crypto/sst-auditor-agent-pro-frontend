import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { ArchivoDocumental } from '../../modelos';
import { formatearTamanoBytes } from '../../utilidades/formato-archivo';

@Component({
  selector: 'app-lista-archivos',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './lista-archivos.component.html',
  styleUrls: ['./lista-archivos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaArchivosComponent {
  @Input({ required: true }) archivos: ArchivoDocumental[] = [];
  @Input() puedeEscribir = false;
  @Input() descargandoId: string | null = null;
  @Input() eliminandoId: string | null = null;

  @Output() readonly alDescargar = new EventEmitter<ArchivoDocumental>();
  @Output() readonly alEliminar = new EventEmitter<ArchivoDocumental>();

  readonly trackArchivo = (_: number, archivo: ArchivoDocumental): string => archivo.id;
  readonly formatearTamano = formatearTamanoBytes;

  quienCargo(archivo: ArchivoDocumental): string {
    return archivo.usuario_nombre?.trim() || 'Usuario desconocido';
  }
}
