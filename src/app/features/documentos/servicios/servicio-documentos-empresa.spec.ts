import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { DocumentoEmpresa, TipoDocumentoSst } from '../modelos';
import { ServicioDocumentosEmpresa } from './servicio-documentos-empresa';

describe('ServicioDocumentosEmpresa', () => {
  let servicio: ServicioDocumentosEmpresa;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  const tipo: TipoDocumentoSst = {
    id: 't1',
    codigo: 'POLITICA_SST',
    nombre: 'Política',
    fase: 'PLANEAR',
    descripcion: 'desc',
    obligatorio: true,
    estandares_ids: [],
  };

  const documento: DocumentoEmpresa = {
    id: 'd1',
    empresa_id: 'e1',
    tipo_id: 't1',
    tipo_codigo: 'POLITICA_SST',
    tipo_nombre: 'Política',
    fase: 'PLANEAR',
    estado: 'CARGADO',
    fecha_carga: '2026-11-26T00:00:00Z',
    nombre_original: 'politica.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 12,
    usuario_nombre: 'Ana',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioDocumentosEmpresa],
    });
    servicio = TestBed.inject(ServicioDocumentosEmpresa);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should listar el catálogo', () => {
    servicio.listarCatalogo().subscribe((lista) => expect(lista).toEqual([tipo]));
    const req = http.expectOne(`${base}/catalogo-documentos`);
    expect(req.request.method).toBe('GET');
    req.flush([tipo]);
  });

  it('should listar documentos de la empresa', () => {
    servicio.listarPorEmpresa('e1').subscribe((lista) => expect(lista).toEqual([documento]));
    const req = http.expectOne(`${base}/empresas/e1/documentos`);
    expect(req.request.method).toBe('GET');
    req.flush([documento]);
  });

  it('should enviar multipart con campo archivo', () => {
    const file = new File(['%PDF'], 'politica.pdf', { type: 'application/pdf' });
    servicio.cargar('e1', 't1', file).subscribe((body) => expect(body).toEqual(documento));

    const req = http.expectOne(`${base}/empresas/e1/documentos/t1/archivo`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const datos = req.request.body as FormData;
    expect(datos.get('archivo')).toBeInstanceOf(File);
    expect(datos.has('clave_objeto')).toBe(false);
    req.flush(documento);
  });

  it('should descargar blob', () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    servicio.descargar('e1', 't1').subscribe((body) => expect(body).toEqual(blob));
    const req = http.expectOne(`${base}/empresas/e1/documentos/t1/archivo`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(blob);
  });

  it('should marcar revisado con body estado', () => {
    const revisado = { ...documento, estado: 'REVISADO' as const };
    servicio.marcarRevisado('e1', 't1').subscribe((body) => expect(body).toEqual(revisado));
    const req = http.expectOne(`${base}/empresas/e1/documentos/t1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: 'REVISADO' });
    req.flush(revisado);
  });
});
