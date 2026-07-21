import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CampoChipsComponent } from './campo-chips.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CampoChipsComponent],
  template: `
    <form [formGroup]="grupo">
      <app-campo-chips idControl="campo-tags" formControlName="tags"></app-campo-chips>
    </form>
  `,
})
class AnfitrionCampoChipsComponent {
  grupo = new FormGroup({ tags: new FormControl<string[]>([]) });
}

describe('CampoChipsComponent', () => {
  let fixture: ComponentFixture<AnfitrionCampoChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionCampoChipsComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionCampoChipsComponent);
    fixture.detectChanges();
  });

  it('should agregar chip con Enter', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    input.value = 'sst';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.grupo.value.tags).toEqual(['sst']);
  });
});
