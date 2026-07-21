import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoRadioComponent } from './campo-radio.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoRadioComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-radio
        idControl="campo-nivel"
        nombreGrupo="nivel"
        formControlName="nivel"
        [opciones]="opciones"
      ></app-campo-radio>
    </form>
  `,
})
class AnfitrionComponent {
  opciones = [
    { valor: 'alto', etiqueta: 'Alto' },
    { valor: 'bajo', etiqueta: 'Bajo' },
  ];
  grupo = new FormGroup({ nivel: new FormControl('alto') });
}

describe('CampoRadioComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('should cambiar el valor al seleccionar otra opcion', () => {
    const radios = (fixture.nativeElement as HTMLElement).querySelectorAll('input[type="radio"]');
    (radios[1] as HTMLInputElement).click();
    expect(fixture.componentInstance.grupo.value.nivel).toBe('bajo');
  });
});
