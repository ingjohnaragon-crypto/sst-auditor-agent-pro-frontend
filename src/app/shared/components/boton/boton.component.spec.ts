import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotonComponent } from './boton.component';

describe('BotonComponent', () => {
  let fixture: ComponentFixture<BotonComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BotonComponent);
    fixture.detectChanges();
  });

  it('should emitir el clic cuando esta disponible', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alHacerClic, 'emit');
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalledTimes(1);
  });

  it('should no emitir el clic mientras carga', () => {
    fixture.componentRef.setInput('cargando', true);
    fixture.detectChanges();
    const emitir = jest.spyOn(fixture.componentInstance.alHacerClic, 'emit');
    fixture.componentInstance.manejarClic(new MouseEvent('click'));
    expect(emitir).not.toHaveBeenCalled();
  });

  it('should no emitir el clic si esta deshabilitado', () => {
    fixture.componentRef.setInput('deshabilitado', true);
    fixture.detectChanges();
    const emitir = jest.spyOn(fixture.componentInstance.alHacerClic, 'emit');
    fixture.componentInstance.manejarClic(new MouseEvent('click'));
    expect(emitir).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('button')?.hasAttribute('disabled')
    ).toBe(true);
  });

  it('should aplicar clases por variante y tamano', () => {
    fixture.componentRef.setInput('variante', 'peligro');
    fixture.componentRef.setInput('tamano', 'lg');
    fixture.detectChanges();
    const boton = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(boton?.className).toContain('bg-red-600');
    expect(boton?.className).toContain('min-h-12');
  });

  it('should marcar aria-busy solo mientras carga', () => {
    const boton = () => (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(boton()?.hasAttribute('aria-busy')).toBe(false);

    fixture.componentRef.setInput('cargando', true);
    fixture.detectChanges();
    expect(boton()?.getAttribute('aria-busy')).toBe('true');
  });
});
