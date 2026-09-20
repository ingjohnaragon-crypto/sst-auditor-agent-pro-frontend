import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { RespuestaCumplimientoPhva } from '../modelos';
import { ServicioCumplimientoPhva } from './servicio-cumplimiento-phva';

describe('ServicioCumplimientoPhva', () => {
  let servicio: ServicioCumplimientoPhva;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioCumplimientoPhva],
    });
    servicio = TestBed.inject(ServicioCumplimientoPhva);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should obtener el cumplimiento PHVA y codificar el id', () => {
    const respuesta: RespuestaCumplimientoPhva = {
      autoevaluacion_id: 'empresa/1',
      empresa_id: 'e-1',
      perfil: 'TABLA_7',
      puntaje_total: '72.50',
      umbral_plan_mejora: '85.00',
      requiere_plan_mejora: true,
      finalizada: false,
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

    servicio.obtenerCumplimiento('empresa/1').subscribe((body) => expect(body).toBe(respuesta));

    const solicitud = http.expectOne(`${base}/autoevaluaciones/empresa%2F1/cumplimiento-phva`);
    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(respuesta);
  });
});
