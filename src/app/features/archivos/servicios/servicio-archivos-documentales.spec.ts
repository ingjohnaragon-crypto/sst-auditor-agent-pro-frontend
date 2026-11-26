import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { ArchivoDocumental } from '../modelos';
import { ServicioArchivosDocumentales } from './servicio-archivos-documentales';

describe('ServicioArchivosDocumentales', () => {
  let servicio: ServicioArchivosDocumentales;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  const archivo: ArchivoDocumental = {
    id: 'a1',
    empresa_id: 'e1',
    nombre_original: 'acta.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 12,
    fecha_carga: '2026-09-24T00:00:00Z',
    usuario_id: 'u1',
    usuario_nombre: 'Ana Escritora',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioArchivosDocumentales],
    });
    servicio = TestBed.inject(ServicioArchivosDocumentales);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should listar archivos de la empresa', () => {
    servicio.listar('e1').subscribe((lista) => expect(lista).toEqual([archivo]));
    const req = http.expectOne(`${base}/empresas/e1/archivos`);
    expect(req.request.method).toBe('GET');
    req.flush([archivo]);
  });

  it('should enviar solo el campo archivo en multipart', () => {
    const file = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    servicio.cargar('e1', file).subscribe((body) => expect(body).toEqual(archivo));

    const req = http.expectOne(`${base}/empresas/e1/archivos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const datos = req.request.body as FormData;
    const parte = datos.get('archivo');
    expect(parte).toBeInstanceOf(File);
    expect((parte as File).name).toBe('acta.pdf');
    expect(datos.has('clave_objeto')).toBe(false);
    req.flush(archivo);
  });

  it('should descargar el binario como blob', () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    servicio.descargar('e1', 'a1').subscribe((body) => expect(body).toEqual(blob));
    const req = http.expectOne(`${base}/empresas/e1/archivos/a1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(blob);
  });

  it('should eliminar un archivo', () => {
    servicio.eliminar('e1', 'a1').subscribe((body) => expect(body).toBeNull());
    const req = http.expectOne(`${base}/empresas/e1/archivos/a1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
