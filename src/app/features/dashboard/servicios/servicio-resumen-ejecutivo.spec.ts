import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { ResumenEjecutivo } from '../modelos/resumen-ejecutivo.model';
import { ServicioResumenEjecutivo } from './servicio-resumen-ejecutivo';

describe('ServicioResumenEjecutivo', () => {
  let servicio: ServicioResumenEjecutivo;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioResumenEjecutivo],
    });
    servicio = TestBed.inject(ServicioResumenEjecutivo);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should obtener el resumen ejecutivo y codificar el id', () => {
    const respuesta: ResumenEjecutivo = {
      empresa_id: 'empresa/1',
      cantidad_autoevaluaciones: 2,
      autoevaluacion_id: 'ae-1',
      requiere_plan_mejora: true,
      riesgos_nivel_i: 1,
      riesgos_nivel_ii: 0,
      distribucion_riesgos: { I: 1, II: 0, III: 3, IV: 4 },
      irrenunciables: [
        { numeral: '1.1.1', descripcion: 'Responsable del SG-SST', resultado: 'CUMPLE' },
        { numeral: '1.1.4', descripcion: 'Afiliación al sistema', resultado: 'NO_CUMPLE' },
      ],
    };

    let recibido: ResumenEjecutivo | undefined;
    servicio.obtener('empresa/1').subscribe((cuerpo) => {
      recibido = cuerpo;
    });

    const peticion = http.expectOne(`${base}/empresas/empresa%2F1/resumen-ejecutivo`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(respuesta);
    expect(recibido).toEqual(respuesta);
  });
});
