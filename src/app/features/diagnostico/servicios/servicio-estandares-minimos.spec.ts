import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { EstandarMinimo } from '../modelos';
import { ServicioEstandaresMinimos } from './servicio-estandares-minimos';

describe('ServicioEstandaresMinimos', () => {
  let servicio: ServicioEstandaresMinimos;
  let http: HttpTestingController;
  const catalogo: EstandarMinimo[] = [
    {
      id: 'est-1',
      ciclo_phva: 'PLANEAR',
      numeral: '1.1.1',
      descripcion: 'Recursos',
      valor_porcentual: '4.00',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioEstandaresMinimos],
    });
    servicio = TestBed.inject(ServicioEstandaresMinimos);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should listar el catalogo completo', () => {
    servicio.listar().subscribe((body) => expect(body).toEqual(catalogo));

    const solicitud = http.expectOne(`${environment.apiBaseUrl}/estandares-minimos`);
    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(catalogo);
  });

  it('should filtrar por ciclo_phva', () => {
    servicio.listar('HACER').subscribe((body) => expect(body).toEqual(catalogo));

    const solicitud = http.expectOne(
      `${environment.apiBaseUrl}/estandares-minimos?ciclo_phva=HACER`
    );
    expect(solicitud.request.method).toBe('GET');
    solicitud.flush(catalogo);
  });
});
