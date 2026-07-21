import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoNumeroComponent } from './campo-numero.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoNumeroComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-numero idControl="campo-edad" formControlName="edad"></app-campo-numero>
    </form>
  `,
})
class AnfitrionCampoNumeroComponent {
  grupo = new FormGroup({ edad: new FormControl<number | null>(10) });
}

describe('CampoNumeroComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoNumeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionCampoNumeroComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionCampoNumeroComponent);
    fixture.detectChanges();
  });

  it('should escribir numeros en el FormControl', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = '25';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.grupo.value.edad).toBe(25);
  });
});
