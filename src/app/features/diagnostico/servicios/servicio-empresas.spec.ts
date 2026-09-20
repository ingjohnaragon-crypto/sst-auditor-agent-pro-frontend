import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { Empresa } from '../modelos';
import { ServicioEmpresas } from './servicio-empresas';

describe('ServicioEmpresas', () => {
  let servicio: ServicioEmpresas;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioEmpresas],
    });
    servicio = TestBed.inject(ServicioEmpresas);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should listar empresas desde GET /empresas', () => {
    const empresas: Empresa[] = [{ id: 'e-1', razon_social: 'Acme', nit: '900' }];

    servicio.listar().subscribe((body) => expect(body).toEqual(empresas));

    const solicitud = http.expectOne(`${environment.apiBaseUrl}/empresas`);
    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(empresas);
  });
});
