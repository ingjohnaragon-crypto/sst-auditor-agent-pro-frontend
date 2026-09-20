import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { EstandarMinimo } from '../../modelos';
import { ItemCalificacionComponent } from './item-calificacion.component';

const estandar: EstandarMinimo = {
  id: 'est-1',
  ciclo_phva: 'PLANEAR',
  numeral: '1.1.1',
  descripcion: 'Recursos financieros',
  valor_porcentual: '4.00',
};

describe('ItemCalificacionComponent', () => {
  let fixture: ComponentFixture<ItemCalificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCalificacionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ItemCalificacionComponent);
    fixture.componentInstance.estandar = estandar;
  });

  it('should emitir resultado al calificar', () => {
    const emitir = jest.fn();
    fixture.componentInstance.alCalificar.subscribe(emitir);
    fixture.detectChanges();
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    botones[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(emitir).toHaveBeenCalledWith({ resultado: 'CUMPLE', observaciones: null });
  });

  it('should no emitir en readonly', () => {
    const emitir = jest.fn();
    fixture.componentInstance.readonly = true;
    fixture.componentInstance.alCalificar.subscribe(emitir);
    fixture.detectChanges();
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    botones[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(emitir).not.toHaveBeenCalled();
    expect((botones[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it('should aplicar clases de estado CUMPLE NO_CUMPLE y NO_APLICA', () => {
    fixture.componentInstance.calificacion = {
      estandar_id: 'est-1',
      resultado: 'CUMPLE',
      puntaje: '4.00',
      observaciones: 'ok',
    };
    fixture.componentInstance.ngOnChanges({
      calificacion: {
        currentValue: fixture.componentInstance.calificacion,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    expect(fixture.componentInstance.clasesTarjeta).toContain('emerald');
    expect(fixture.componentInstance.clasesBoton('CUMPLE')).toContain('bg-emerald-500');
    fixture.componentInstance.calificacion = {
      estandar_id: 'est-1',
      resultado: 'NO_CUMPLE',
      puntaje: '0.00',
      observaciones: null,
    };
    expect(fixture.componentInstance.clasesTarjeta).toContain('red');
    expect(fixture.componentInstance.clasesBoton('NO_CUMPLE')).toContain('bg-red-500');
    fixture.componentInstance.calificacion = {
      estandar_id: 'est-1',
      resultado: 'NO_APLICA',
      puntaje: '0.00',
      observaciones: null,
    };
    expect(fixture.componentInstance.clasesTarjeta).toContain('blue');
    expect(fixture.componentInstance.clasesBoton('NO_APLICA')).toContain('bg-blue-500');
  });

  it('should emitir observaciones y no hacerlo en readonly', () => {
    const emitir = jest.fn();
    fixture.componentInstance.alCambiarObservaciones.subscribe(emitir);
    fixture.componentInstance.alEscribirObservaciones('  nota  ');
    expect(emitir).toHaveBeenCalledWith('nota');
    fixture.componentInstance.readonly = true;
    fixture.componentInstance.alEscribirObservaciones('otra');
    expect(emitir).toHaveBeenCalledTimes(1);
  });
});
