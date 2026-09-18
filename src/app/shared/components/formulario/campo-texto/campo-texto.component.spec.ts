import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CampoTextoComponent } from './campo-texto.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoTextoComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-texto idControl="campo-nombre" formControlName="nombre"></app-campo-texto>
    </form>
  `,
})
class AnfitrionCampoTextoComponent {
  grupo = new FormGroup({ nombre: new FormControl('Ana') });
}

describe('CampoTextoComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoTextoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionCampoTextoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionCampoTextoComponent);
    fixture.detectChanges();
  });

  it('should renderizar el valor del FormControl', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Ana');
  });

  it('should propagar cambios al FormControl', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'Bea';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.grupo.value.nombre).toBe('Bea');
  });

  it('should respetar disabled del FormControl', () => {
    fixture.componentInstance.grupo.get('nombre')?.disable();
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should cubrir ControlValueAccessor writeValue null y blur', () => {
    const campo = fixture.debugElement.query(By.directive(CampoTextoComponent))
      .componentInstance as CampoTextoComponent;
    // Callbacks por defecto (no-op) antes de registrar listeners reales.
    campo.alCambiar('tmp');
    campo.alBlur();
    const onChange = jest.fn();
    const onTouched = jest.fn();
    campo.registerOnChange(onChange);
    campo.registerOnTouched(onTouched);
    campo.writeValue(null);
    expect(campo.valor).toBe('');
    campo.writeValue('Zoe');
    expect(campo.valor).toBe('Zoe');
    campo.setDisabledState(true);
    expect(campo.deshabilitado).toBe(true);
    campo.alCambiar('Lia');
    expect(onChange).toHaveBeenCalledWith('Lia');
    campo.alBlur();
    expect(onTouched).toHaveBeenCalled();
  });
});

describe('CampoTextoComponent sin FormControl', () => {
  it('should ejecutar callbacks CVA por defecto sin lanzar', async () => {
    await TestBed.configureTestingModule({
      imports: [CampoTextoComponent],
    }).compileComponents();
    const solo = TestBed.createComponent(CampoTextoComponent);
    const campo = solo.componentInstance;
    expect(() => {
      campo.alCambiar('x');
      campo.alBlur();
      campo.writeValue(null);
    }).not.toThrow();
    expect(campo.valor).toBe('');
  });
});
