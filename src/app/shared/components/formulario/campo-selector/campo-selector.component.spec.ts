import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

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

  it('should cubrir ControlValueAccessor y valor vacio', () => {
    const campo = fixture.debugElement.query(By.directive(CampoSelectorComponent))
      .componentInstance as CampoSelectorComponent;
    const onChange = jest.fn();
    const onTouched = jest.fn();
    campo.registerOnChange(onChange);
    campo.registerOnTouched(onTouched);
    campo.writeValue(null);
    expect(campo.valor).toBeNull();
    campo.alCambiar('');
    expect(onChange).toHaveBeenCalledWith(null);
    campo.alCambiar('C');
    expect(onChange).toHaveBeenLastCalledWith('C');
    campo.setDisabledState(true);
    expect(campo.deshabilitado).toBe(true);
    campo.alBlur();
    expect(onTouched).toHaveBeenCalled();
  });
});
