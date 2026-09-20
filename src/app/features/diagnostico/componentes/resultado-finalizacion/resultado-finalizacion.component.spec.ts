import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoFinalizacionComponent } from './resultado-finalizacion.component';

describe('ResultadoFinalizacionComponent', () => {
  it('should mostrar alerta de plan de mejora', async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoFinalizacionComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ResultadoFinalizacionComponent);
    fixture.componentInstance.puntajeTotal = '72.50';
    fixture.componentInstance.requierePlanMejora = true;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('72.50');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Requiere plan de mejora');
  });
});
