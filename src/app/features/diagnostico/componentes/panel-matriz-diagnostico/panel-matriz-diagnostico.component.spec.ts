import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelMatrizDiagnosticoComponent } from './panel-matriz-diagnostico.component';
import type { EstandarMinimo } from '../../modelos';

const estandares: EstandarMinimo[] = [
  {
    id: 'est-1',
    ciclo_phva: 'PLANEAR',
    numeral: '1.1.1',
    descripcion: 'Recursos',
    valor_porcentual: '4.00',
  },
  {
    id: 'est-2',
    ciclo_phva: 'HACER',
    numeral: '2.1.1',
    descripcion: 'Capacitación',
    valor_porcentual: '2.00',
  },
];

describe('PanelMatrizDiagnosticoComponent', () => {
  let fixture: ComponentFixture<PanelMatrizDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelMatrizDiagnosticoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PanelMatrizDiagnosticoComponent);
    fixture.componentRef.setInput('estandares', estandares);
    fixture.detectChanges();
  });

  it('should mostrar solo la fase actual y deshabilitar finalizar sin 60 items', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Resolución 0312');
    expect(texto).toContain('Recursos');
    expect(texto).not.toContain('Capacitación');
    expect(texto).toContain('Continuar a Hacer');
    expect(texto).not.toContain('Finalizar autoevaluación');
    expect(fixture.componentInstance.puedeFinalizar).toBe(false);
  });

  it('should pasar a la siguiente fase y mostrar finalizar en la ultima', () => {
    fixture.componentInstance.seleccionarFase('HACER');
    fixture.detectChanges();
    expect(fixture.componentInstance.cicloActual).toBe('HACER');
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Capacitación');
    expect(texto).not.toContain('Recursos');
    expect(texto).toContain('Finalizar autoevaluación');
    expect(texto).not.toContain('Continuar a');
  });

  it('should abrir la primera fase incompleta al cargar un borrador', () => {
    const otro = TestBed.createComponent(PanelMatrizDiagnosticoComponent);
    otro.componentRef.setInput('estandares', estandares);
    otro.componentRef.setInput('calificaciones', {
      'est-1': { estandar_id: 'est-1', resultado: 'CUMPLE', puntaje: '4.00', observaciones: null },
    });
    otro.detectChanges();
    expect(otro.componentInstance.cicloActual).toBe('HACER');
  });

  it('should iniciar en Planear si la autoevaluacion ya esta finalizada', () => {
    const otro = TestBed.createComponent(PanelMatrizDiagnosticoComponent);
    otro.componentRef.setInput('estandares', estandares);
    otro.componentRef.setInput('autoevaluacion', {
      id: 'ae-1',
      empresa_id: 'e-1',
      usuario_id: 'u-1',
      fecha: '2026-09-19',
      puntaje_total: '90.00',
      requiere_plan_mejora: false,
      calificaciones: [],
      fecha_creacion: '2026-09-19T10:00:00Z',
      fecha_actualizacion: '2026-09-19T10:00:00Z',
    });
    otro.detectChanges();
    expect(otro.componentInstance.cicloActual).toBe('PLANEAR');
    expect(otro.componentInstance.readonly).toBe(true);
  });
});
