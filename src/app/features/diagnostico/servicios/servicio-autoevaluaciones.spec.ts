import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { Autoevaluacion, CalificacionEstandar } from '../modelos';
import { ServicioAutoevaluaciones } from './servicio-autoevaluaciones';

describe('ServicioAutoevaluaciones', () => {
  let servicio: ServicioAutoevaluaciones;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  const autoevaluacion: Autoevaluacion = {
    id: 'ae-1',
    empresa_id: 'e-1',
    usuario_id: 'u-1',
    fecha: '2026-09-19',
    puntaje_total: null,
    requiere_plan_mejora: false,
    calificaciones: [],
    fecha_creacion: '2026-09-19T10:00:00Z',
    fecha_actualizacion: '2026-09-19T10:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioAutoevaluaciones],
    });
    servicio = TestBed.inject(ServicioAutoevaluaciones);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should crear una autoevaluacion', () => {
    const solicitud = { empresa_id: 'e-1', fecha: '2026-09-19' };
    servicio.crear(solicitud).subscribe((body) => expect(body).toEqual(autoevaluacion));

    const req = http.expectOne(`${base}/autoevaluaciones`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(solicitud);
    req.flush(autoevaluacion);
  });

  it('should listar por empresa_id con HttpParams', () => {
    servicio.listarPorEmpresa('empresa/1').subscribe((body) => expect(body).toEqual([autoevaluacion]));

    const req = http.expectOne(
      (peticion) =>
        peticion.method === 'GET' &&
        peticion.url === `${base}/autoevaluaciones` &&
        peticion.params.get('empresa_id') === 'empresa/1'
    );
    req.flush([autoevaluacion]);
  });

  it('should obtener detalle por id', () => {
    servicio.obtenerPorId('ae/1').subscribe((body) => expect(body).toEqual(autoevaluacion));

    const req = http.expectOne(`${base}/autoevaluaciones/ae%2F1`);
    expect(req.request.method).toBe('GET');
    req.flush(autoevaluacion);
  });

  it('should calificar un estandar', () => {
    const calificacion: CalificacionEstandar = {
      estandar_id: 'est-1',
      resultado: 'CUMPLE',
      puntaje: '4.00',
      observaciones: 'ok',
    };
    servicio
      .calificar('ae-1', 'est/1', { resultado: 'CUMPLE', observaciones: 'ok' })
      .subscribe((body) => expect(body).toEqual(calificacion));

    const req = http.expectOne(`${base}/autoevaluaciones/ae-1/calificaciones/est%2F1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ resultado: 'CUMPLE', observaciones: 'ok' });
    req.flush(calificacion);
  });

  it('should finalizar una autoevaluacion', () => {
    const finalizada = { ...autoevaluacion, puntaje_total: '90.00' };
    servicio.finalizar('ae-1').subscribe((body) => expect(body).toEqual(finalizada));

    const req = http.expectOne(`${base}/autoevaluaciones/ae-1/finalizar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(finalizada);
  });
});
