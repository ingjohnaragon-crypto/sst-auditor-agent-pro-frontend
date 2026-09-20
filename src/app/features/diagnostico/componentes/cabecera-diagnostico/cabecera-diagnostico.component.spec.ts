import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabeceraDiagnosticoComponent } from './cabecera-diagnostico.component';

describe('CabeceraDiagnosticoComponent', () => {
  let fixture: ComponentFixture<CabeceraDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabeceraDiagnosticoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CabeceraDiagnosticoComponent);
  });

  it('should mostrar titulo Res. 0312 y puntaje', () => {
    fixture.componentInstance.puntajeTotal = '90.00';
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Resolución 0312');
    expect(texto).toContain('90.00');
    expect(texto).toContain('4 fases PHVA');
  });
});
