import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoSelectorComponent } from './campo-selector.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoSelectorComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-selector
        idControl="campo-rol"
        formControlName="rol"
        [opciones]="opciones"
      ></app-campo-selector>
    </form>
  `,
})
class AnfitrionCampoSelectorComponent {
  opciones = [
    { valor: 'A', etiqueta: 'Auditor' },
    { valor: 'C', etiqueta: 'Consulta' },
  ];
  grupo = new FormGroup({ rol: new FormControl('A') });
}

describe('CampoSelectorComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionCampoSelectorComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionCampoSelectorComponent);
    fixture.detectChanges();
  });

  it('should renderizar opciones y valor seleccionado', () => {
    const select = (fixture.nativeElement as HTMLElement).querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(2);
    expect(select.value).toBe('A');
  });
});
