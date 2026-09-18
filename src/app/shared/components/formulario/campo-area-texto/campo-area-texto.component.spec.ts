import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CampoAreaTextoComponent } from './campo-area-texto.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoAreaTextoComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-area-texto idControl="campo-notas" formControlName="notas"></app-campo-area-texto>
    </form>
  `,
})
class AnfitrionComponent {
  grupo = new FormGroup({ notas: new FormControl('hola') });
}

describe('CampoAreaTextoComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('should renderizar textarea con el valor', () => {
    const area = (fixture.nativeElement as HTMLElement).querySelector('textarea') as HTMLTextAreaElement;
    expect(area.value).toBe('hola');
  });

  it('should cubrir ControlValueAccessor', () => {
    const campo = fixture.debugElement.query(By.directive(CampoAreaTextoComponent))
      .componentInstance as CampoAreaTextoComponent;
    const onChange = jest.fn();
    const onTouched = jest.fn();
    campo.registerOnChange(onChange);
    campo.registerOnTouched(onTouched);
    campo.writeValue(null);
    expect(campo.valor).toBe('');
    campo.alCambiar('nota');
    expect(onChange).toHaveBeenCalledWith('nota');
    campo.setDisabledState(true);
    expect(campo.deshabilitado).toBe(true);
    campo.alBlur();
    expect(onTouched).toHaveBeenCalled();
  });
});

describe('CampoAreaTextoComponent sin FormControl', () => {
  it('should ejecutar callbacks CVA por defecto sin lanzar', async () => {
    await TestBed.configureTestingModule({
      imports: [CampoAreaTextoComponent],
    }).compileComponents();
    const solo = TestBed.createComponent(CampoAreaTextoComponent);
    const campo = solo.componentInstance;
    expect(() => {
      campo.alCambiar('x');
      campo.alBlur();
    }).not.toThrow();
  });
});
