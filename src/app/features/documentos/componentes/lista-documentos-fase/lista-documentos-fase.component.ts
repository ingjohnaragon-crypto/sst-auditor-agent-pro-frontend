import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import type { DocumentoVista } from '../../modelos';
import { TarjetaDocumentoComponent } from '../tarjeta-documento/tarjeta-documento.component';

@Component({
  selector: 'app-lista-documentos-fase',
  standalone: true,
  imports: [NgIf, NgFor, TarjetaDocumentoComponent],
  templateUrl: './lista-documentos-fase.component.html',
  styleUrls: ['./lista-documentos-fase.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaDocumentosFaseComponent {
  @Input({ required: true }) vistas: DocumentoVista[] = [];
  @Input() puedeEscribir = false;
  @Input() subiendoTipoId: string | null = null;
  @Input() descargandoTipoId: string | null = null;
  @Input() revisandoTipoId: string | null = null;

  @Output() readonly alCargar = new EventEmitter<{ tipoId: string; archivo: File }>();
  @Output() readonly alDescargar = new EventEmitter<string>();
  @Output() readonly alMarcarRevisado = new EventEmitter<string>();

  readonly trackVista = (_: number, vista: DocumentoVista): string => vista.documento.tipo_id;
}
