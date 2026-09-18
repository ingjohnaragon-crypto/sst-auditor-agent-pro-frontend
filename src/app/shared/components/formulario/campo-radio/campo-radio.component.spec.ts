import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

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

  it('should cubrir ControlValueAccessor', () => {
    const campo = fixture.debugElement.query(By.directive(CampoRadioComponent))
      .componentInstance as CampoRadioComponent;
    const onChange = jest.fn();
    const onTouched = jest.fn();
    campo.registerOnChange(onChange);
    campo.registerOnTouched(onTouched);
    campo.writeValue(null);
    expect(campo.valor).toBeNull();
    campo.setDisabledState(true);
    expect(campo.deshabilitado).toBe(true);
    campo.alCambiar('alto');
    expect(onChange).toHaveBeenCalledWith('alto');
    expect(onTouched).toHaveBeenCalled();
  });
});
