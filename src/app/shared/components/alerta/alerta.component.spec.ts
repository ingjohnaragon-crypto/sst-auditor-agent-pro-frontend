import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertaComponent } from './alerta.component';

describe('AlertaComponent', () => {
  let fixture: ComponentFixture<AlertaComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertaComponent);
    fixture.componentRef.setInput('mensaje', 'Mensaje de prueba');
    fixture.detectChanges();
  });

  it('should usar un anuncio asertivo para errores', () => {
    fixture.componentRef.setInput('tipo', 'error');
    fixture.detectChanges();
    const alerta = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alerta?.getAttribute('aria-live')).toBe('assertive');
  });

  it('should usar status polite para exito e informativa', () => {
    fixture.componentRef.setInput('tipo', 'exito');
    fixture.detectChanges();
    let nodo = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');
    expect(nodo?.getAttribute('aria-live')).toBe('polite');

    fixture.componentRef.setInput('tipo', 'informativa');
    fixture.detectChanges();
    nodo = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');
    expect(nodo?.getAttribute('aria-live')).toBe('polite');
  });

  it('should emitir al cerrar una alerta cerrable', () => {
    fixture.componentRef.setInput('cerrable', true);
    fixture.detectChanges();
    const emitir = jest.spyOn(fixture.componentInstance.alCerrar, 'emit');
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalled();
  });

  it('should no renderizar boton de cierre si no es cerrable', () => {
    fixture.componentRef.setInput('cerrable', false);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('button')).toBeNull();
  });

  it('should mostrar el titulo cuando se provee', () => {
    fixture.componentRef.setInput('titulo', 'Aviso');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aviso');
  });
});
