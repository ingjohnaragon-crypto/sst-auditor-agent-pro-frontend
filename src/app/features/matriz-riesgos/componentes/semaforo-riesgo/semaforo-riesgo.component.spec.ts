import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemaforoRiesgoComponent } from './semaforo-riesgo.component';

describe('SemaforoRiesgoComponent', () => {
  let fixture: ComponentFixture<SemaforoRiesgoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemaforoRiesgoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SemaforoRiesgoComponent);
  });

  it('should no renderizar cuando no hay interpretacion', () => {
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });

  it.each([
    ['I', 'NO_ACEPTABLE', 'bg-red-50'],
    ['II', 'ACEPTABLE_CON_CONTROL', 'bg-orange-50'],
    ['III', 'MEJORABLE', 'bg-amber-50'],
    ['IV', 'ACEPTABLE', 'bg-emerald-50'],
  ] as const)(
    'should mostrar nivel %s con aceptabilidad y color',
    (interpretacion, aceptabilidad, claseColor) => {
      fixture.componentRef.setInput('interpretacion', interpretacion);
      fixture.componentRef.setInput('aceptabilidad', aceptabilidad);
      fixture.detectChanges();
      const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(texto).toContain(`Nivel ${interpretacion}`);
      expect(texto).toContain(aceptabilidad.replaceAll('_', ' '));
      expect(fixture.componentInstance.clases).toContain(claseColor);
    },
  );

  it('should mostrar solo el nivel cuando no hay aceptabilidad', () => {
    fixture.componentRef.setInput('interpretacion', 'IV');
    fixture.componentRef.setInput('aceptabilidad', null);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('Nivel IV');
  });
});
