import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { MensajeErrorCampoComponent } from './mensaje-error-campo.component';

describe('MensajeErrorCampoComponent', () => {
  let fixture: ComponentFixture<MensajeErrorCampoComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MensajeErrorCampoComponent);
  });

  it('should no mostrar mensaje si el control es pristine', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });

  it('should mostrar mensaje required tras touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');
  });
});
