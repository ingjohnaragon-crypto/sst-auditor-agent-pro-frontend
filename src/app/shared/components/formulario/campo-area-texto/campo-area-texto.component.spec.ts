import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
});
