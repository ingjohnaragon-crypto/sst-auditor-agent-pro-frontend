import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  private readonly referenciaDialogo = inject(DialogRef<unknown, ModalComponent>, { optional: true });

  @Input() titulo = '';
  @Input() cerrable = true;
  @Output() alCerrar = new EventEmitter<void>();

  cerrar(): void {
    this.alCerrar.emit();
    this.referenciaDialogo?.close();
  }
}
