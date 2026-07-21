import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoSelectorMultipleComponent } from './campo-selector-multiple.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoSelectorMultipleComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-selector-multiple
        idControl="campo-areas"
        formControlName="areas"
        [opciones]="opciones"
      ></app-campo-selector-multiple>
    </form>
  `,
})
class AnfitrionComponent {
  opciones = [
    { valor: 'a', etiqueta: 'A' },
    { valor: 'b', etiqueta: 'B' },
  ];
  grupo = new FormGroup({ areas: new FormControl<string[]>(['a']) });
}

describe('CampoSelectorMultipleComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('should renderizar select multiple', () => {
    const select = (fixture.nativeElement as HTMLElement).querySelector('select') as HTMLSelectElement;
    expect(select.multiple).toBe(true);
    expect(select.options.length).toBe(2);
  });
});
