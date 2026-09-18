import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

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

  it('should mostrar mensaje email', () => {
    const control = new FormControl('x', Validators.email);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('correo válido');
  });

  it('should refrescar tras markAsTouched sin cambiar la referencia', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
    control.markAsTouched();
    fixture.componentInstance.refrescar();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');
  });

  it('should mostrar requiredTrue y mensaje generico para error desconocido', () => {
    // Angular Validators.requiredTrue emite clave `required`; aquí forzamos
    // la clave `requiredTrue` del mapa de mensajes del componente.
    const requerido = new FormControl(false, () => ({ requiredTrue: true }));
    requerido.markAsTouched();
    fixture.componentRef.setInput('control', requerido);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Debes marcar esta opción',
    );

    const custom = new FormControl('x', () => ({ customRule: true }));
    custom.markAsTouched();
    fixture.componentRef.setInput('control', custom);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('no es válido');
  });

  it('should mostrar por dirty sin touched y mensaje vacio si no hay errores', () => {
    const control = new FormControl('', Validators.required);
    control.markAsDirty();
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');

    const valido = new FormControl('ok');
    valido.markAsTouched();
    fixture.componentRef.setInput('control', valido);
    fixture.detectChanges();
    expect(fixture.componentInstance.mensaje).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });
});
