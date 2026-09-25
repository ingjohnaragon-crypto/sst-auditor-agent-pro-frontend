import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { Evidencia } from '../modelos';
import { ServicioEvidencias } from './servicio-evidencias';

describe('ServicioEvidencias', () => {
  let servicio: ServicioEvidencias;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  const evidencia: Evidencia = {
    id: 'ev-1',
    calificacion_estandar_id: 'cal-1',
    usuario_id: 'u-1',
    nombre_archivo: 'soporte.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 12,
    ruta_almacenamiento: 'evidencias/cal-1/abc.pdf',
    fecha_carga: '2026-09-24T00:00:00Z',
    activo: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioEvidencias],
    });
    servicio = TestBed.inject(ServicioEvidencias);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should enviar solo el campo archivo en multipart', () => {
    const archivo = new File(['%PDF'], 'soporte.pdf', { type: 'application/pdf' });
    servicio.subirArchivo('cal-1', archivo).subscribe((body) => expect(body).toEqual(evidencia));

    const req = http.expectOne(`${base}/calificaciones-estandar/cal-1/archivo`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const datos = req.request.body as FormData;
    const parte = datos.get('archivo');
    expect(parte).toBeInstanceOf(File);
    expect((parte as File).name).toBe('soporte.pdf');
    expect(datos.has('ruta_almacenamiento')).toBe(false);
    expect(datos.has('usuario_id')).toBe(false);
    expect(datos.has('tamano_bytes')).toBe(false);
    req.flush(evidencia);
  });

  it('should listar evidencias de la calificacion', () => {
    servicio.listarPorCalificacion('cal-1').subscribe((lista) => expect(lista).toEqual([evidencia]));
    const req = http.expectOne(`${base}/calificaciones-estandar/cal-1/evidencias`);
    expect(req.request.method).toBe('GET');
    req.flush([evidencia]);
  });

  it('should pedir un enlace de descarga fresco', () => {
    const enlace = { url: '/api/v1/descargas/evidencias?token=abc', expira_en_segundos: 300 };
    servicio.obtenerEnlaceDescarga('ev-1').subscribe((body) => expect(body).toEqual(enlace));
    const req = http.expectOne(`${base}/evidencias/ev-1/enlace-descarga`);
    expect(req.request.method).toBe('POST');
    req.flush(enlace);
  });
});
