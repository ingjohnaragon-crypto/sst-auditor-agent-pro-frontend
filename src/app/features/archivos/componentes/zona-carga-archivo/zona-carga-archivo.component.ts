import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-zona-carga-archivo',
  standalone: true,
  imports: [NgIf],
  templateUrl: './zona-carga-archivo.component.html',
  styleUrls: ['./zona-carga-archivo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonaCargaArchivoComponent {
  @Input() deshabilitado = false;
  @Input() subiendo = false;
  @Input() error: string | null = null;

  @Output() readonly alSeleccionarArchivo = new EventEmitter<File>();

  arrastrando = false;

  alArrastrarSobre(evento: DragEvent): void {
    evento.preventDefault();
    if (this.deshabilitado || this.subiendo) {
      return;
    }
    this.arrastrando = true;
  }

  alSalirArrastre(): void {
    this.arrastrando = false;
  }

  alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando = false;
    if (this.deshabilitado || this.subiendo) {
      return;
    }
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) {
      this.alSeleccionarArchivo.emit(archivo);
    }
  }

  alCambiarInput(evento: Event): void {
    const input = evento.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const archivo = input.files?.[0];
    input.value = '';
    if (archivo) {
      this.alSeleccionarArchivo.emit(archivo);
    }
  }
}
