import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraAvanceDiagnosticoComponent } from './barra-avance-diagnostico.component';

describe('BarraAvanceDiagnosticoComponent', () => {
  let fixture: ComponentFixture<BarraAvanceDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraAvanceDiagnosticoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BarraAvanceDiagnosticoComponent);
  });

  it('should mostrar 0/60', () => {
    fixture.componentInstance.calificados = 0;
    fixture.componentInstance.total = 60;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('0 / 60');
  });

  it('should mostrar 60/60 y barra completa', () => {
    fixture.componentInstance.calificados = 60;
    fixture.componentInstance.total = 60;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('60 / 60');
    expect(fixture.componentInstance.completa).toBe(true);
  });

  it('should devolver 0 si el total es invalido', () => {
    fixture.componentInstance.total = 0;
    expect(fixture.componentInstance.porcentaje).toBe(0);
  });
});
