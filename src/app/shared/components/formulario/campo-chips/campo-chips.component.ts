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

@Component({
  selector: 'app-campo-chips',
  standalone: true,
  imports: [NgFor],
  templateUrl: './campo-chips.component.html',
  styleUrls: ['./campo-chips.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoChipsComponent),
      multi: true,
    },
  ],
})
export class CampoChipsComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() placeholder = '';

  valor: string[] = [];
  borrador = '';
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

  alTecla(evento: KeyboardEvent): void {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      this.agregarChip();
      return;
    }
    if (evento.key === 'Backspace' && this.borrador === '' && this.valor.length > 0) {
      this.valor = this.valor.slice(0, -1);
      this.emitir();
    }
  }

  agregarChip(): void {
    const texto = this.borrador.trim();
    if (!texto || this.valor.includes(texto)) {
      this.borrador = '';
      return;
    }
    this.valor = [...this.valor, texto];
    this.borrador = '';
    this.emitir();
  }

  quitarChip(indice: number): void {
    this.valor = this.valor.filter((_, i) => i !== indice);
    this.emitir();
  }

  alBlur(): void {
    this.onTouched();
  }

  private emitir(): void {
    this.onChange([...this.valor]);
    this.cdr.markForCheck();
  }
}
