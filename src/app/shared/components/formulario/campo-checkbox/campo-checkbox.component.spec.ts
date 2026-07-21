import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoCheckboxComponent } from './campo-checkbox.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoCheckboxComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-checkbox
        idControl="campo-activo"
        etiqueta="Activo"
        formControlName="activo"
      ></app-campo-checkbox>
      <app-campo-checkbox
        idControl="campo-areas"
        etiqueta="Áreas"
        formControlName="areas"
        [opciones]="opciones"
      ></app-campo-checkbox>
    </form>
  `,
})
class AnfitrionCampoCheckboxComponent {
  opciones = [
    { valor: 'a', etiqueta: 'A' },
    { valor: 'b', etiqueta: 'B' },
  ];
  grupo = new FormGroup({
    activo: new FormControl(false),
    areas: new FormControl<string[]>([]),
  });
}

describe('CampoCheckboxComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionCampoCheckboxComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionCampoCheckboxComponent);
    fixture.detectChanges();
  });

  it('should emitir boolean al marcar', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '#campo-activo'
    ) as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.grupo.value.activo).toBe(true);
  });

  it('should emitir string[] en modo grupo', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '#campo-areas-a'
    ) as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.grupo.value.areas).toEqual(['a']);
  });
});
