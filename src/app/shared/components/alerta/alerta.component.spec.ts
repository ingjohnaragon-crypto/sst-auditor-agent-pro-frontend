import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertaComponent } from './alerta.component';

describe('AlertaComponent', () => {
  let fixture: ComponentFixture<AlertaComponent>;
  beforeEach(() => { fixture = TestBed.createComponent(AlertaComponent); fixture.componentInstance.mensaje = 'Error de prueba'; fixture.detectChanges(); });

  it('should usar un anuncio asertivo para errores', () => {
    fixture.componentRef.setInput('tipo', 'error'); fixture.detectChanges();
    const alerta = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alerta?.getAttribute('aria-live')).toBe('assertive');
  });

  it('should emitir al cerrar una alerta cerrable', () => {
    fixture.componentRef.setInput('cerrable', true); fixture.detectChanges();
    const emitir = jest.spyOn(fixture.componentInstance.alCerrar, 'emit');
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalled();
  });
});
