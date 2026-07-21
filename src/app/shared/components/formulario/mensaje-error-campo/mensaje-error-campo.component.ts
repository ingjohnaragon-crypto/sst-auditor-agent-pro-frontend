import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-mensaje-error-campo',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mensaje-error-campo.component.html',
  styleUrls: ['./mensaje-error-campo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensajeErrorCampoComponent {
  @Input({ required: true }) control!: AbstractControl;
  @Input() idDescripcion?: string;

  private readonly mensajes: Record<string, string> = {
    required: 'Este campo es obligatorio.',
    email: 'Ingresa un correo válido.',
    min: 'El valor es menor al mínimo permitido.',
    max: 'El valor supera el máximo permitido.',
    minlength: 'El texto es demasiado corto.',
    maxlength: 'El texto es demasiado largo.',
  };

  get visible(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }

  get mensaje(): string {
    const errores = this.control.errors;
    if (!errores) {
      return '';
    }
    const clave = Object.keys(errores)[0];
    return this.mensajes[clave] ?? 'El valor no es válido.';
  }
}
