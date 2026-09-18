import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

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

  it('should cubrir writeValue y setDisabledState en modo booleano y grupo', () => {
    const campos = fixture.debugElement.queryAll(By.directive(CampoCheckboxComponent));
    const simple = campos[0].componentInstance as CampoCheckboxComponent;
    const grupo = campos[1].componentInstance as CampoCheckboxComponent;
    simple.writeValue(null);
    expect(simple.valorBooleano).toBe(false);
    simple.writeValue(true);
    expect(simple.valorBooleano).toBe(true);
    simple.setDisabledState(true);
    expect(simple.deshabilitado).toBe(true);
    grupo.writeValue(null);
    expect(grupo.valorGrupo).toEqual([]);
    grupo.writeValue(['b']);
    expect(grupo.valorGrupo).toEqual(['b']);
    grupo.alCambiarGrupo('b', false);
    expect(grupo.valorGrupo).toEqual([]);
  });
});
