import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { PlanMejora, SolicitudActividadCronograma } from '../modelos/plan-mejora.model';
import { ServicioPlanMejora } from './servicio-plan-mejora';

describe('ServicioPlanMejora', () => {
  let servicio: ServicioPlanMejora;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;
  const plan: PlanMejora = {
    id: 'plan-1',
    empresa_id: 'e-1',
    autoevaluacion_id: 'ae-1',
    actividades: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioPlanMejora],
    });
    servicio = TestBed.inject(ServicioPlanMejora);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should leer el plan de la autoevaluacion', () => {
    servicio.obtenerPorAutoevaluacion('ae/1').subscribe((body) => expect(body).toEqual(plan));

    const req = http.expectOne(`${base}/autoevaluaciones/ae%2F1/plan-mejora`);
    expect(req.request.method).toBe('GET');
    req.flush(plan);
  });

  it('should actualizar responsable e indicador reenviando descripcion y meses', () => {
    const solicitud: SolicitudActividadCronograma = {
      descripcion: 'Inspección',
      responsable: 'Luis',
      indicador: 'Cobertura',
      meses: [1, 12],
    };
    servicio
      .actualizarActividad('plan/1', 'act/1', solicitud)
      .subscribe((body) => expect(body).toEqual(plan));

    const req = http.expectOne(`${base}/planes-mejora/plan%2F1/actividades/act%2F1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(solicitud);
    req.flush(plan);
  });

  it('should crear una actividad y devolver el plan', () => {
    const solicitud: SolicitudActividadCronograma = {
      descripcion: 'Inspección',
      responsable: 'Luis',
      indicador: 'Cobertura',
      meses: [1],
    };
    servicio.agregarActividad('plan/1', solicitud).subscribe((body) => expect(body).toEqual(plan));

    const req = http.expectOne(`${base}/planes-mejora/plan%2F1/actividades`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(solicitud);
    req.flush(plan);
  });

  it('should quitar una actividad con 204', () => {
    servicio.quitarActividad('plan/1', 'act/1').subscribe((body) => expect(body).toBeNull());

    const req = http.expectOne(`${base}/planes-mejora/plan%2F1/actividades/act%2F1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
