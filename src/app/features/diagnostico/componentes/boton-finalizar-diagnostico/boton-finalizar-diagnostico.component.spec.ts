import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonFinalizarDiagnosticoComponent } from './boton-finalizar-diagnostico.component';

describe('BotonFinalizarDiagnosticoComponent', () => {
  let fixture: ComponentFixture<BotonFinalizarDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonFinalizarDiagnosticoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BotonFinalizarDiagnosticoComponent);
  });

  it('should no emitir si esta deshabilitado', () => {
    const emitir = jest.fn();
    fixture.componentInstance.deshabilitado = true;
    fixture.componentInstance.alFinalizar.subscribe(emitir);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).not.toHaveBeenCalled();
  });

  it('should emitir al finalizar cuando esta habilitado', () => {
    const emitir = jest.fn();
    fixture.componentInstance.deshabilitado = false;
    fixture.componentInstance.alFinalizar.subscribe(emitir);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalled();
  });
});
