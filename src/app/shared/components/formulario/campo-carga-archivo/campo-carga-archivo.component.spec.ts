import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoCargaArchivoComponent } from './campo-carga-archivo.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoCargaArchivoComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-carga-archivo idControl="campo-archivo" formControlName="archivo"></app-campo-carga-archivo>
    </form>
  `,
})
class AnfitrionCampoCargaArchivoComponent {
  grupo = new FormGroup({ archivo: new FormControl<File | null>(null) });
}

describe('CampoCargaArchivoComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoCargaArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionCampoCargaArchivoComponent] }).compileComponents();
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
});
