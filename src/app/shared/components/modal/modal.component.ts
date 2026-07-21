import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import type { DatosModal } from './datos-modal';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  private readonly referenciaDialogo = inject(DialogRef<unknown, ModalComponent>, {
    optional: true,
  });
  private readonly datos = inject<DatosModal>(DIALOG_DATA, { optional: true });

  /** Overrides opcionales cuando el modal se embebe fuera de Dialog. */
  @Input() titulo = '';
  @Input() cerrable = true;
  @Input() mensaje = '';
  @Output() alCerrar = new EventEmitter<void>();

  get tituloEfectivo(): string {
    return this.titulo || this.datos?.titulo || '';
  }

  get cerrableEfectivo(): boolean {
    return this.datos?.cerrable ?? this.cerrable;
  }

  get mensajeEfectivo(): string {
    return this.mensaje || this.datos?.mensaje || '';
  }

  get idTitulo(): string {
    return 'modal-titulo';
  }

  cerrar(): void {
    this.alCerrar.emit();
    this.referenciaDialogo?.close();
  }
}
