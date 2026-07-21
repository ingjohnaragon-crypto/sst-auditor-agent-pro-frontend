import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription, merge } from 'rxjs';

@Component({
  selector: 'app-mensaje-error-campo',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mensaje-error-campo.component.html',
  styleUrls: ['./mensaje-error-campo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensajeErrorCampoComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) control!: AbstractControl;
  @Input() idDescripcion?: string;

  private readonly cdr = inject(ChangeDetectorRef);
  private suscripcion: Subscription | null = null;

  private readonly mensajes: Record<string, string> = {
    required: 'Este campo es obligatorio.',
    requiredTrue: 'Debes marcar esta opción.',
    email: 'Ingresa un correo válido.',
    min: 'El valor es menor al mínimo permitido.',
    max: 'El valor supera el máximo permitido.',
    minlength: 'El texto es demasiado corto.',
    maxlength: 'El texto es demasiado largo.',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control'] && this.control) {
      this.suscripcion?.unsubscribe();
      // statusChanges no siempre dispara con markAsTouched: el padre también
      // fuerza CD tras markAllAsTouched. valueChanges cubre blur+escritura.
      this.suscripcion = merge(this.control.valueChanges, this.control.statusChanges).subscribe(
        () => this.cdr.markForCheck()
      );
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  /** Invocado por el compositor tras markAllAsTouched (no emite statusChanges). */
  refrescar(): void {
    this.cdr.markForCheck();
  }

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
