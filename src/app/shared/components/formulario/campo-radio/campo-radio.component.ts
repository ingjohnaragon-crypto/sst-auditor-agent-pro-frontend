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
  selector: 'app-campo-radio',
  standalone: true,
  imports: [NgFor],
  templateUrl: './campo-radio.component.html',
  styleUrls: ['./campo-radio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoRadioComponent),
      multi: true,
    },
  ],
})
export class CampoRadioComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() idDescripcion = '';
  @Input() nombreGrupo = '';
  @Input() etiqueta = '';
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
    this.valor = valor;
    this.onChange(valor);
    this.onTouched();
  }
}
