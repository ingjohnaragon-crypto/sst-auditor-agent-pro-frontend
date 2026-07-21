import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-campo-carga-archivo',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './campo-carga-archivo.component.html',
  styleUrls: ['./campo-carga-archivo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoCargaArchivoComponent),
      multi: true,
    },
  ],
})
export class CampoCargaArchivoComponent implements ControlValueAccessor {
  @Input() idControl = '';
  @Input() aceptar = '';
  @Input() multiple = false;

  @ViewChild('entradaArchivo') entradaArchivo?: ElementRef<HTMLInputElement>;

  archivos: File[] = [];
  deshabilitado = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (valor: File | File[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get nombres(): string[] {
    return this.archivos.map((a) => a.name);
  }

  writeValue(valor: File | File[] | null): void {
    if (!valor) {
      this.archivos = [];
      if (this.entradaArchivo) {
        this.entradaArchivo.nativeElement.value = '';
      }
    } else if (Array.isArray(valor)) {
      this.archivos = [...valor];
    } else {
      this.archivos = [valor];
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (valor: File | File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
    this.cdr.markForCheck();
  }

  alCambiar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const lista = input.files ? Array.from(input.files) : [];
    this.archivos = lista;
    if (lista.length === 0) {
      this.onChange(null);
    } else if (this.multiple) {
      this.onChange(lista);
    } else {
      this.onChange(lista[0] ?? null);
    }
    this.onTouched();
    this.cdr.markForCheck();
  }
}
