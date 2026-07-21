import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
});
