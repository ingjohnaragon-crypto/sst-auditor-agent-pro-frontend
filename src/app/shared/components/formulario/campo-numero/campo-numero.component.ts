import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-campo-numero',
  standalone: true,
  templateUrl: './campo-numero.component.html',
  styleUrls: ['./campo-numero.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoNumeroComponent),
      multi: true,
    },
  ],
})
export class CampoNumeroComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() idDescripcion = '';
  @Input() placeholder = '';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;

  valor: number | null = null;
  deshabilitado = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (valor: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valor: number | null): void {
    this.valor = valor ?? null;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (valor: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
    this.cdr.markForCheck();
  }

  alCambiar(crudo: string): void {
    const valor = crudo === '' ? null : Number(crudo);
    this.valor = Number.isNaN(valor as number) ? null : valor;
    this.onChange(this.valor);
  }

  alBlur(): void {
    this.onTouched();
  }
}
