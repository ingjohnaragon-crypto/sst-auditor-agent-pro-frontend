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
  selector: 'app-campo-selector-multiple',
  standalone: true,
  imports: [NgFor],
  templateUrl: './campo-selector-multiple.component.html',
  styleUrls: ['./campo-selector-multiple.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoSelectorMultipleComponent),
      multi: true,
    },
  ],
})
export class CampoSelectorMultipleComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() opciones: OpcionCampo[] = [];

  valor: string[] = [];
  deshabilitado = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (valor: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valor: string[] | null): void {
    this.valor = Array.isArray(valor) ? [...valor] : [];
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (valor: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
    this.cdr.markForCheck();
  }

  estaSeleccionado(valorOpcion: string): boolean {
    return this.valor.includes(valorOpcion);
  }

  alCambiar(evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    this.valor = Array.from(select.selectedOptions).map((o) => o.value);
    this.onChange([...this.valor]);
  }

  alBlur(): void {
    this.onTouched();
  }
}
