import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServicioSalud, PingRespuesta } from './servicio-salud';
import { environment } from '../../../environments/environment';

describe('ServicioSalud', () => {
  let servicio: ServicioSalud;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioSalud],
    });
    servicio = TestBed.inject(ServicioSalud);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(servicio).toBeTruthy();
  });

  it('should GET ping and return PingRespuesta', () => {
    const mock: PingRespuesta = { mensaje: 'pong' };

    servicio.obtenerPing().subscribe((respuesta) => {
      expect(respuesta).toEqual(mock);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/ping`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
