import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';
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

describe('PaginaHistoricoDiagnosticoComponent carrera HTTP', () => {
  let fixture: ComponentFixture<PaginaHistoricoDiagnosticoComponent>;
  let http: HttpTestingController;
  const empresas: Empresa[] = [{ id: 'e-1', razon_social: 'Acme', nit: '900' }];
  const historicoA: Autoevaluacion[] = [
    {
      id: 'ae-a',
      empresa_id: 'e-1',
      usuario_id: 'u-1',
      fecha: '2026-09-01',
      puntaje_total: '10.00',
      requiere_plan_mejora: true,
      calificaciones: [],
      fecha_creacion: '2026-09-01T10:00:00Z',
      fecha_actualizacion: '2026-09-01T10:00:00Z',
    },
  ];
  const historicoB: Autoevaluacion[] = [
    {
      id: 'ae-b',
      empresa_id: 'e-2',
      usuario_id: 'u-1',
      fecha: '2026-09-02',
      puntaje_total: '90.00',
      requiere_plan_mejora: false,
      calificaciones: [],
      fecha_creacion: '2026-09-02T10:00:00Z',
      fecha_actualizacion: '2026-09-02T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaHistoricoDiagnosticoComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: ServicioEmpresas, useValue: { listar: () => of(empresas) } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PaginaHistoricoDiagnosticoComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify({ ignoreCancelled: true });
  });

  it('should cancelar el listado de la empresa anterior', () => {
    fixture.componentInstance.seleccionarEmpresa('e-1');
    fixture.componentInstance.seleccionarEmpresa('e-2');
    const peticiones = http.match((req) => req.url.includes('/autoevaluaciones'));
    expect(peticiones).toHaveLength(2);
    expect(peticiones[0].cancelled).toBe(true);
    peticiones[1].flush(historicoB);
    expect(fixture.componentInstance.items).toEqual(historicoB);
    expect(peticiones[0].request.params.get('empresa_id')).toBe('e-1');
    expect(peticiones[1].request.params.get('empresa_id')).toBe('e-2');
    expect(() => peticiones[0].flush(historicoA)).toThrow(/cancelled/i);
  });
});
