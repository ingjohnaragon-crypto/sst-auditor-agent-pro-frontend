import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import type { OpcionCampo } from '../campo-formulario.model';

@Component({
  selector: 'app-campo-selector',
  standalone: true,
  imports: [NgFor],
  templateUrl: './campo-selector.component.html',
  styleUrls: ['./campo-selector.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoSelectorComponent),
      multi: true,
    },
  ],
})
export class CampoSelectorComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() placeholder = '';
  @Input() opciones: OpcionCampo[] = [];

  valor: string | null = null;
  deshabilitado = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (valor: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valor: string | null): void {
    this.valor = valor ?? null;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (valor: string | null) => void): void {
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
    this.valor = valor === '' ? null : valor;
    this.onChange(this.valor);
  }

  alBlur(): void {
    this.onTouched();
  }
}
