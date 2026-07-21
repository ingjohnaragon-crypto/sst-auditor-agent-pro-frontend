import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoCargaArchivoComponent } from './campo-carga-archivo.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoCargaArchivoComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-carga-archivo
        idControl="campo-archivo"
        [multiple]="multiple"
        formControlName="archivo"
      ></app-campo-carga-archivo>
    </form>
  `,
})
class AnfitrionCampoCargaArchivoComponent {
  multiple = false;
  grupo = new FormGroup({
    archivo: new FormControl<File | File[] | null>(null),
  });
}

describe('CampoCargaArchivoComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoCargaArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionCampoCargaArchivoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionCampoCargaArchivoComponent);
    fixture.detectChanges();
  });

  it('should asignar File al FormControl', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    const archivo = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [archivo] });
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.grupo.value.archivo).toBe(archivo);
  });

  it('should asignar File[] cuando multiple es true', () => {
    fixture.componentInstance.multiple = true;
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    const a = new File(['a'], 'a.pdf');
    const b = new File(['b'], 'b.pdf');
    Object.defineProperty(input, 'files', { value: [a, b] });
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.grupo.value.archivo).toEqual([a, b]);
  });

  it('should limpiar el input al writeValue(null)', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    const archivo = new File(['x'], 'x.pdf');
    Object.defineProperty(input, 'files', { value: [archivo] });
    input.dispatchEvent(new Event('change'));
    fixture.componentInstance.grupo.get('archivo')?.setValue(null);
    fixture.detectChanges();
    expect(input.value).toBe('');
  });
});
