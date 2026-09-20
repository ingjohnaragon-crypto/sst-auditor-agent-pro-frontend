import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import type { Autoevaluacion, Empresa } from '../../modelos';
import { ServicioAutoevaluaciones } from '../../servicios/servicio-autoevaluaciones';
import { ServicioEmpresas } from '../../servicios/servicio-empresas';
import { PaginaHistoricoDiagnosticoComponent } from './pagina-historico-diagnostico.component';

describe('PaginaHistoricoDiagnosticoComponent', () => {
  let fixture: ComponentFixture<PaginaHistoricoDiagnosticoComponent>;
  const listarPorEmpresa = jest.fn();
  const empresas: Empresa[] = [{ id: 'e-1', razon_social: 'Acme', nit: '900' }];
  const historico: Autoevaluacion[] = [
    {
      id: 'ae-9',
      empresa_id: 'e-1',
      usuario_id: 'u-1',
      fecha: '2026-09-01',
      puntaje_total: '80.00',
      requiere_plan_mejora: true,
      calificaciones: [],
      fecha_creacion: '2026-09-01T10:00:00Z',
      fecha_actualizacion: '2026-09-01T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    listarPorEmpresa.mockReset().mockReturnValue(of(historico));
    await TestBed.configureTestingModule({
      imports: [PaginaHistoricoDiagnosticoComponent],
      providers: [
        provideRouter([]),
        { provide: ServicioEmpresas, useValue: { listar: () => of(empresas) } },
        { provide: ServicioAutoevaluaciones, useValue: { listarPorEmpresa } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaHistoricoDiagnosticoComponent);
    fixture.detectChanges();
  });

  it('should listar y navegar al detalle', () => {
    const router = TestBed.inject(Router);
    const navegar = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.seleccionarEmpresa('e-1');
    fixture.detectChanges();
    expect(listarPorEmpresa).toHaveBeenCalledWith('e-1');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2026-09-01');
    fixture.componentInstance.verDetalle('ae-9');
    expect(navegar).toHaveBeenCalledWith(['/diagnostico', 'ae-9']);
  });

  it('should limpiar al vaciar empresa y mostrar error de historico', () => {
    fixture.componentInstance.seleccionarEmpresa('');
    expect(fixture.componentInstance.items).toEqual([]);
    listarPorEmpresa.mockReturnValue(throwError(() => new Error('fail')));
    fixture.componentInstance.seleccionarEmpresa('e-1');
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');
  });

  it('should mostrar error si fallan las empresas', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PaginaHistoricoDiagnosticoComponent],
      providers: [
        provideRouter([]),
        { provide: ServicioEmpresas, useValue: { listar: () => throwError(() => new Error('fail')) } },
        { provide: ServicioAutoevaluaciones, useValue: { listarPorEmpresa } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaHistoricoDiagnosticoComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');
  });
});
