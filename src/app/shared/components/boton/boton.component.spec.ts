import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotonComponent } from './boton.component';

describe('BotonComponent', () => {
  let fixture: ComponentFixture<BotonComponent>;
  beforeEach(() => { fixture = TestBed.createComponent(BotonComponent); fixture.detectChanges(); });

  it('should emitir el clic cuando esta disponible', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alHacerClic, 'emit');
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalledTimes(1);
  });

  it('should no emitir el clic mientras carga', () => {
    fixture.componentInstance.cargando = true; fixture.detectChanges();
    const emitir = jest.spyOn(fixture.componentInstance.alHacerClic, 'emit');
    fixture.componentInstance.manejarClic(new MouseEvent('click'));
    expect(emitir).not.toHaveBeenCalled();
  });
});
