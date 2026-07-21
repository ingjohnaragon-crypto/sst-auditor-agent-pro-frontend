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
  selector: 'app-campo-area-texto',
  standalone: true,
  templateUrl: './campo-area-texto.component.html',
  styleUrls: ['./campo-area-texto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoAreaTextoComponent),
      multi: true,
    },
  ],
})
export class CampoAreaTextoComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() placeholder = '';
  @Input() filas = 3;

  valor = '';
  deshabilitado = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (valor: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valor: string | null): void {
    this.valor = valor ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
    this.cdr.markForCheck();
  }

  alCambiar(valor: string): void {
    this.valor = valor;
    this.onChange(valor);
  }

  alBlur(): void {
    this.onTouched();
  }
}
