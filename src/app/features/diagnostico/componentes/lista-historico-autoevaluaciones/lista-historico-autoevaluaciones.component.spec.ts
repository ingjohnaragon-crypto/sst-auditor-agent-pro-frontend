import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Autoevaluacion } from '../../modelos';
import { ListaHistoricoAutoevaluacionesComponent } from './lista-historico-autoevaluaciones.component';

const item: Autoevaluacion = {
  id: 'ae-1',
  empresa_id: 'e-1',
  usuario_id: 'u-1',
  fecha: '2026-09-19',
  puntaje_total: '90.00',
  requiere_plan_mejora: false,
  calificaciones: [],
  fecha_creacion: '2026-09-19T10:00:00Z',
  fecha_actualizacion: '2026-09-19T10:00:00Z',
};

describe('ListaHistoricoAutoevaluacionesComponent', () => {
  let fixture: ComponentFixture<ListaHistoricoAutoevaluacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaHistoricoAutoevaluacionesComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ListaHistoricoAutoevaluacionesComponent);
  });

  it('should emitir ver detalle', () => {
    const emitir = jest.fn();
    fixture.componentInstance.items = [item];
    fixture.componentInstance.alVerDetalle.subscribe(emitir);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalledWith('ae-1');
  });

  it('should etiquetar borrador si no hay puntaje', () => {
    expect(
      fixture.componentInstance.etiquetaEstado({ ...item, puntaje_total: null })
    ).toBe('Borrador');
  });
});
