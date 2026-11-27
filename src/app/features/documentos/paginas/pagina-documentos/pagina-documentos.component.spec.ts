import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import * as formatoArchivo from '../../../archivos/utilidades/formato-archivo';
import { ServicioEmpresas } from '../../../diagnostico/servicios/servicio-empresas';
import type { DocumentoEmpresa, TipoDocumentoSst } from '../../modelos';
import { ServicioDocumentosEmpresa } from '../../servicios/servicio-documentos-empresa';
import { PaginaDocumentosComponent } from './pagina-documentos.component';

describe('PaginaDocumentosComponent', () => {
  let fixture: ComponentFixture<PaginaDocumentosComponent>;
  let componente: PaginaDocumentosComponent;

  const usuario = signal<UsuarioAutenticado | null>(null);
  const empresasApi = {
    listar: jest.fn(),
  };
  const documentosApi = {
    listarCatalogo: jest.fn(),
    listarPorEmpresa: jest.fn(),
    cargar: jest.fn(),
    descargar: jest.fn(),
    marcarRevisado: jest.fn(),
  };

  const tipo: TipoDocumentoSst = {
    id: 't1',
    codigo: 'POLITICA_SST',
    nombre: 'Política de SST',
    fase: 'PLANEAR',
    descripcion: 'Política',
    obligatorio: true,
    estandares_ids: [],
  };

  const pendiente: DocumentoEmpresa = {
    id: null,
    empresa_id: 'e1',
    tipo_id: 't1',
    tipo_codigo: 'POLITICA_SST',
    tipo_nombre: 'Política de SST',
    fase: 'PLANEAR',
    estado: 'PENDIENTE',
    fecha_carga: null,
    nombre_original: null,
    tipo_mime: null,
    tamano_bytes: null,
    usuario_nombre: null,
  };

  const cargado: DocumentoEmpresa = {
    ...pendiente,
    id: 'd1',
    estado: 'CARGADO',
    fecha_carga: '2026-11-26T00:00:00Z',
    nombre_original: 'politica.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 10,
    usuario_nombre: 'Ana',
  };

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: 'u1',
      nombre_completo: 'Ana',
      correo: 'ana@empresa.com',
      rol,
    });
  }

  beforeEach(async () => {
    establecerUsuario('AUDITOR_SST');
    empresasApi.listar.mockReturnValue(of([{ id: 'e1', razon_social: 'ACME', nit: '1' }]));
    documentosApi.listarCatalogo.mockReturnValue(of([tipo]));
    documentosApi.listarPorEmpresa.mockReturnValue(of([pendiente]));
    documentosApi.cargar.mockReset();
    documentosApi.descargar.mockReset();
    documentosApi.marcarRevisado.mockReset();

    await TestBed.configureTestingModule({
      imports: [PaginaDocumentosComponent],
      providers: [
        { provide: ServicioEmpresas, useValue: empresasApi },
        { provide: ServicioDocumentosEmpresa, useValue: documentosApi },
        {
          provide: ServicioAutenticacion,
          useValue: { usuarioActual: usuario.asReadonly() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaDocumentosComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should listar catálogo y documentos al cargar con una sola empresa', () => {
    expect(empresasApi.listar).toHaveBeenCalled();
    expect(documentosApi.listarCatalogo).toHaveBeenCalled();
    expect(documentosApi.listarPorEmpresa).toHaveBeenCalledWith('e1');
    expect(componente.documentos).toEqual([pendiente]);
    expect(componente.puedeEscribir).toBe(true);
    expect(componente.avancePorcentaje).toBe(0);
    expect(componente.documentosCompletados).toBe(0);
  });

  it('should ocultar escritura when rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    expect(componente.puedeEscribir).toBe(false);
  });

  it('should filtrar vistas por fase activa y usar fallback de catálogo', () => {
    componente.catalogo = [];
    componente.documentos = [
      pendiente,
      { ...pendiente, tipo_id: 't2', fase: 'HACER', tipo_codigo: 'FURAT', tipo_nombre: 'FURAT' },
    ];
    componente.faseActiva = 'PLANEAR';
    expect(componente.vistasFase).toHaveLength(1);
    expect(componente.vistasFase[0].obligatorio).toBe(true);
    expect(componente.vistasFase[0].descripcion).toBe('');
  });

  it('should rechazar archivo invalido sin llamar al API', () => {
    const malo = new File(['x'], 'nota.txt', { type: 'text/plain' });
    componente.alCargarArchivo({ tipoId: 't1', archivo: malo });
    expect(documentosApi.cargar).not.toHaveBeenCalled();
    expect(componente.errorCarga).toContain('PDF');
  });

  it('should no cargar when no puede escribir o falta empresa', () => {
    const pdf = new File(['%PDF'], 'politica.pdf', { type: 'application/pdf' });
    establecerUsuario('CONSULTA');
    componente.alCargarArchivo({ tipoId: 't1', archivo: pdf });
    expect(documentosApi.cargar).not.toHaveBeenCalled();

    establecerUsuario('AUDITOR_SST');
    componente.empresaSeleccionadaId = '';
    componente.alCargarArchivo({ tipoId: 't1', archivo: pdf });
    expect(documentosApi.cargar).not.toHaveBeenCalled();
  });

  it('should refrescar listado after carga exitosa y subir avance', () => {
    documentosApi.cargar.mockReturnValue(of(cargado));
    documentosApi.listarCatalogo.mockClear();
    documentosApi.listarPorEmpresa.mockClear();
    documentosApi.listarCatalogo.mockReturnValue(of([tipo]));
    documentosApi.listarPorEmpresa.mockReturnValue(of([cargado]));
    const pdf = new File(['%PDF'], 'politica.pdf', { type: 'application/pdf' });
    componente.alCargarArchivo({ tipoId: 't1', archivo: pdf });
    expect(documentosApi.cargar).toHaveBeenCalledWith('e1', 't1', pdf);
    expect(documentosApi.listarPorEmpresa).toHaveBeenCalledWith('e1');
    expect(componente.mensajeExito).toContain('cargado');
    expect(componente.avancePorcentaje).toBe(100);
    expect(componente.documentosCompletados).toBe(1);
  });

  it('should mostrar error when la carga falla', () => {
    documentosApi.cargar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: { mensaje: 'Documento inválido' },
          })
      )
    );
    const pdf = new File(['%PDF'], 'politica.pdf', { type: 'application/pdf' });
    componente.alCargarArchivo({ tipoId: 't1', archivo: pdf });
    expect(componente.mensajeError).toBe('Documento inválido');
    expect(componente.errorCarga).toBe('Documento inválido');
  });

  it('should marcar revisado y actualizar estado local', () => {
    const revisado = { ...cargado, estado: 'REVISADO' as const };
    documentosApi.marcarRevisado.mockReturnValue(of(revisado));
    componente.documentos = [cargado];
    componente.marcarRevisado('t1');
    expect(documentosApi.marcarRevisado).toHaveBeenCalledWith('e1', 't1');
    expect(componente.documentos[0].estado).toBe('REVISADO');
  });

  it('should no marcar revisado when CONSULTA o sin empresa', () => {
    establecerUsuario('CONSULTA');
    componente.marcarRevisado('t1');
    expect(documentosApi.marcarRevisado).not.toHaveBeenCalled();

    establecerUsuario('AUDITOR_SST');
    componente.empresaSeleccionadaId = '';
    componente.marcarRevisado('t1');
    expect(documentosApi.marcarRevisado).not.toHaveBeenCalled();
  });

  it('should mostrar error when marcar revisado falla', () => {
    documentosApi.marcarRevisado.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { mensaje: 'Conflicto de estado' },
          })
      )
    );
    componente.documentos = [cargado];
    componente.marcarRevisado('t1');
    expect(componente.mensajeError).toBe('Conflicto de estado');
  });

  it('should descargar blob con el nombre del documento', () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    documentosApi.descargar.mockReturnValue(of(blob));
    const spy = jest.spyOn(formatoArchivo, 'dispararDescargaBlob').mockImplementation(() => undefined);
    componente.documentos = [cargado];
    componente.descargar('t1');
    expect(documentosApi.descargar).toHaveBeenCalledWith('e1', 't1');
    expect(spy).toHaveBeenCalledWith(blob, 'politica.pdf');
    spy.mockRestore();
  });

  it('should no descargar when pendiente o sin empresa', () => {
    componente.documentos = [pendiente];
    componente.descargar('t1');
    expect(documentosApi.descargar).not.toHaveBeenCalled();

    componente.documentos = [cargado];
    componente.empresaSeleccionadaId = '';
    componente.descargar('t1');
    expect(documentosApi.descargar).not.toHaveBeenCalled();
  });

  it('should mostrar error when descarga falla', () => {
    documentosApi.descargar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { mensaje: 'No encontrado' },
          })
      )
    );
    componente.documentos = [cargado];
    componente.descargar('t1');
    expect(componente.mensajeError).toBe('No encontrado');
  });

  it('should mostrar error when listar falla', () => {
    documentosApi.listarPorEmpresa.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 503,
            error: { mensaje: 'Sin R2' },
          })
      )
    );
    componente.cargarLista();
    expect(componente.mensajeError).toBe('Sin R2');
  });

  it('should cambiar fase activa', () => {
    componente.cambiarFase('ACTUAR');
    expect(componente.faseActiva).toBe('ACTUAR');
  });

  it('should listar al seleccionar empresa y limpiar al deseleccionar', () => {
    documentosApi.listarPorEmpresa.mockClear();
    documentosApi.listarCatalogo.mockClear();
    documentosApi.listarCatalogo.mockReturnValue(of([tipo]));
    documentosApi.listarPorEmpresa.mockReturnValue(of([cargado]));
    componente.empresaSeleccionadaId = 'e1';
    componente.seleccionarEmpresa();
    expect(documentosApi.listarPorEmpresa).toHaveBeenCalledWith('e1');

    componente.empresaSeleccionadaId = '';
    componente.seleccionarEmpresa();
    expect(componente.documentos).toEqual([]);
  });

  it('should no listar sin empresa seleccionada', () => {
    documentosApi.listarPorEmpresa.mockClear();
    componente.empresaSeleccionadaId = '';
    componente.cargarLista();
    expect(documentosApi.listarPorEmpresa).not.toHaveBeenCalled();
  });

  it('should mostrar error when fallan las empresas', () => {
    empresasApi.listar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { mensaje: 'Fallo empresas' },
          })
      )
    );
    componente.cargarEmpresas();
    expect(componente.mensajeError).toBe('Fallo empresas');
  });

  it('should usar nombre fallback when descarga sin nombre_original', () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    documentosApi.descargar.mockReturnValue(of(blob));
    const spy = jest.spyOn(formatoArchivo, 'dispararDescargaBlob').mockImplementation(() => undefined);
    componente.documentos = [{ ...cargado, nombre_original: null }];
    componente.descargar('t1');
    expect(spy).toHaveBeenCalledWith(blob, 'POLITICA_SST.bin');
    spy.mockRestore();
  });
});
