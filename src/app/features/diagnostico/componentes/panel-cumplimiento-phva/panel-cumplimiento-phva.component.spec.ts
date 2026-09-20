import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import type { SimpleChange } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import type { RespuestaCumplimientoPhva } from '../../modelos';
import {
  DEBOUNCE_RECARGA_CUMPLIMIENTO_MS,
  PanelCumplimientoPhvaComponent,
} from './panel-cumplimiento-phva.component';

const respuesta: RespuestaCumplimientoPhva = {
  autoevaluacion_id: 'ae-1',
  empresa_id: 'e-1',
  perfil: 'TABLA_7',
  puntaje_total: '72.50',
  umbral_plan_mejora: '85.00',
  requiere_plan_mejora: true,
  finalizada: true,
  fases: [
    {
      ciclo_phva: 'PLANEAR',
      peso_maximo: '25.00',
      puntaje_obtenido: '20.00',
      porcentaje_cumplimiento: '80.00',
      brecha: '5.00',
    },
  ],
};

describe('PanelCumplimientoPhvaComponent', () => {
  let fixture: ComponentFixture<PanelCumplimientoPhvaComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelCumplimientoPhvaComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelCumplimientoPhvaComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('should no llamar HTTP y mostrar vacio sin id', () => {
    expect(http.match(() => true).length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay autoevaluación para mostrar el cumplimiento PHVA.'
    );
  });

  it('should cargar cumplimiento cuando hay id', () => {
    fixture.componentInstance.autoevaluacionId = 'ae-1';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: {
        currentValue: 'ae-1',
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    const solicitud = http.expectOne(
      `${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`
    );
    solicitud.flush(respuesta);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('80.00');
    expect(fixture.componentInstance.estado).toBe('listo');
  });

  it('should mostrar error con el mensaje del API en 404', () => {
    fixture.componentInstance.autoevaluacionId = 'ae-404';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: {
        currentValue: 'ae-404',
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    const solicitud = http.expectOne(
      `${environment.apiBaseUrl}/autoevaluaciones/ae-404/cumplimiento-phva`
    );
    solicitud.flush(
      { exito: false, codigo: 'AUTOEVALUACION_NO_ENCONTRADA', mensaje: 'No existe', detalle: [] },
      { status: 404, statusText: 'Not Found' }
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.estado).toBe('error');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No existe');
  });

  it('should reintentar y mostrar error de conexion', () => {
    fixture.componentInstance.autoevaluacionId = 'ae-0';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: {
        currentValue: 'ae-0',
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    http
      .expectOne(`${environment.apiBaseUrl}/autoevaluaciones/ae-0/cumplimiento-phva`)
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible conectar con el backend.');

    fixture.componentInstance.reintentar();
    fixture.detectChanges();
    http
      .expectOne(`${environment.apiBaseUrl}/autoevaluaciones/ae-0/cumplimiento-phva`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(fixture.componentInstance.mensajeError).toBe('No fue posible completar la operación.');
  });

  it('should ignorar respuestas tardias cuando cambia el id', () => {
    fixture.componentInstance.autoevaluacionId = 'ae-1';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: {
        currentValue: 'ae-1',
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const primera = http.expectOne(
      `${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`
    );

    fixture.componentInstance.autoevaluacionId = 'ae-2';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: {
        currentValue: 'ae-2',
        previousValue: 'ae-1',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const segunda = http.expectOne(
      `${environment.apiBaseUrl}/autoevaluaciones/ae-2/cumplimiento-phva`
    );

    expect(primera.cancelled).toBe(true);
    segunda.flush({ ...respuesta, autoevaluacion_id: 'ae-2', puntaje_total: '10.00' });
    fixture.detectChanges();
    expect(fixture.componentInstance.cumplimiento?.autoevaluacion_id).toBe('ae-2');
  });

  it('should tratar id en blanco como vacio', () => {
    fixture.componentInstance.autoevaluacionId = '   ';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: {
        currentValue: '   ',
        previousValue: 'ae-1',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(http.match(() => true).length).toBe(0);
    expect(fixture.componentInstance.estado).toBe('vacio');
  });

  it('should no recargar si el cambio no es el id', () => {
    fixture.componentInstance.ngOnChanges({
      variante: {
        currentValue: 'oscuro',
        previousValue: 'claro',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(http.match(() => true).length).toBe(0);
  });

  it('should refrescar en silencio al cambiar recarga', fakeAsync(() => {
    fixture.componentInstance.autoevaluacionId = 'ae-1';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: cambio('ae-1', null),
    });
    fixture.detectChanges();
    http
      .expectOne(`${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`)
      .flush(respuesta);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('80.00');

    fixture.componentInstance.recarga = 'v2';
    fixture.componentInstance.ngOnChanges({
      recarga: cambio('v2', null),
    });
    fixture.detectChanges();
    expect(http.match(() => true).length).toBe(0);
    expect(fixture.componentInstance.estado).toBe('listo');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('80.00');

    tick(DEBOUNCE_RECARGA_CUMPLIMIENTO_MS);
    const recarga = http.expectOne(
      `${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`
    );
    expect(fixture.componentInstance.estado).toBe('listo');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('80.00');
    recarga.flush({
      ...respuesta,
      puntaje_total: '40.00',
      fases: [{ ...respuesta.fases[0], porcentaje_cumplimiento: '40.00' }],
    });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('40.00');
  }));

  it('should cancelar el GET de recarga si cambia de nuevo', fakeAsync(() => {
    fixture.componentInstance.autoevaluacionId = 'ae-1';
    fixture.componentInstance.ngOnChanges({
      autoevaluacionId: cambio('ae-1', null),
    });
    fixture.detectChanges();
    http
      .expectOne(`${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`)
      .flush(respuesta);
    fixture.detectChanges();

    fixture.componentInstance.recarga = 'v2';
    fixture.componentInstance.ngOnChanges({ recarga: cambio('v2', 'v1') });
    tick(DEBOUNCE_RECARGA_CUMPLIMIENTO_MS);
    const primera = http.expectOne(
      `${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`
    );

    fixture.componentInstance.recarga = 'v3';
    fixture.componentInstance.ngOnChanges({ recarga: cambio('v3', 'v2') });
    tick(DEBOUNCE_RECARGA_CUMPLIMIENTO_MS);
    expect(primera.cancelled).toBe(true);
    http
      .expectOne(`${environment.apiBaseUrl}/autoevaluaciones/ae-1/cumplimiento-phva`)
      .flush({ ...respuesta, puntaje_total: '11.00' });
    expect(fixture.componentInstance.cumplimiento?.puntaje_total).toBe('11.00');
  }));
});

function cambio(currentValue: unknown, previousValue: unknown): SimpleChange {
  return {
    currentValue,
    previousValue,
    firstChange: false,
    isFirstChange: () => false,
  };
}
