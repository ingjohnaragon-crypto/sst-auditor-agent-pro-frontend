import { DatePipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import type { DocumentoVista } from '../../modelos';
import { etiquetarEstado } from '../../utilidades/avance-documentos';

@Component({
  selector: 'app-tarjeta-documento',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './tarjeta-documento.component.html',
  styleUrls: ['./tarjeta-documento.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaDocumentoComponent {
  @Input({ required: true }) vista!: DocumentoVista;
  @Input() puedeEscribir = false;
  @Input() subiendoTipoId: string | null = null;
  @Input() descargandoTipoId: string | null = null;
  @Input() revisandoTipoId: string | null = null;

  @Output() readonly alCargar = new EventEmitter<{ tipoId: string; archivo: File }>();
  @Output() readonly alDescargar = new EventEmitter<string>();
  @Output() readonly alMarcarRevisado = new EventEmitter<string>();

  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  readonly etiquetar = etiquetarEstado;

  get tipoId(): string {
    return this.vista.documento.tipo_id;
  }

  get puedeDescargar(): boolean {
    return this.vista.documento.estado !== 'PENDIENTE';
  }

  get puedeRevisar(): boolean {
    return this.puedeEscribir && this.vista.documento.estado === 'CARGADO';
  }

  get subiendo(): boolean {
    return this.subiendoTipoId === this.tipoId;
  }

  abrirSelector(): void {
    if (!this.puedeEscribir || this.subiendo) {
      return;
    }
    this.inputArchivo?.nativeElement.click();
  }

  alCambiarArchivo(evento: Event): void {
    const input = evento.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const archivo = input.files?.[0];
    input.value = '';
    if (archivo) {
      this.alCargar.emit({ tipoId: this.tipoId, archivo });
    }
  }

  descargar(): void {
    if (this.puedeDescargar) {
      this.alDescargar.emit(this.tipoId);
    }
  }

  marcarRevisado(): void {
    if (this.puedeRevisar) {
      this.alMarcarRevisado.emit(this.tipoId);
    }
  }

  claseEstado(): string {
    switch (this.vista.documento.estado) {
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-800';
      case 'CARGADO':
        return 'bg-sky-100 text-sky-800';
      case 'REVISADO':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
