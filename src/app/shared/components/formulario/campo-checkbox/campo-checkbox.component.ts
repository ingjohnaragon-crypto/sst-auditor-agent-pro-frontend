import { NgFor, NgIf } from '@angular/common';
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
  selector: 'app-campo-checkbox',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './campo-checkbox.component.html',
  styleUrls: ['./campo-checkbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoCheckboxComponent),
      multi: true,
    },
  ],
})
export class CampoCheckboxComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() idDescripcion = '';
  @Input() etiqueta = '';
  /** Si hay opciones, el valor es `string[]`; si no, `boolean`. */
  @Input() opciones: OpcionCampo[] = [];

  valorBooleano = false;
  valorGrupo: string[] = [];
  deshabilitado = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (valor: boolean | string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get esGrupo(): boolean {
    return this.opciones.length > 0;
  }

  writeValue(valor: boolean | string[] | null): void {
    if (this.esGrupo) {
      this.valorGrupo = Array.isArray(valor) ? [...valor] : [];
    } else {
      this.valorBooleano = !!valor;
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (valor: boolean | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
    this.cdr.markForCheck();
  }

  alCambiarBooleano(marcado: boolean): void {
    this.valorBooleano = marcado;
    this.onChange(marcado);
    this.onTouched();
  }

  alCambiarGrupo(valorOpcion: string, marcado: boolean): void {
    if (marcado) {
      if (!this.valorGrupo.includes(valorOpcion)) {
        this.valorGrupo = [...this.valorGrupo, valorOpcion];
      }
    } else {
      this.valorGrupo = this.valorGrupo.filter((v) => v !== valorOpcion);
    }
    this.onChange([...this.valorGrupo]);
    this.onTouched();
  }

  estaMarcado(valorOpcion: string): boolean {
    return this.valorGrupo.includes(valorOpcion);
  }
}
