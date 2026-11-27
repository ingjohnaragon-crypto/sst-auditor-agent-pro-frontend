import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
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
  });

  it('should ocultar escritura when rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    expect(componente.puedeEscribir).toBe(false);
  });

  it('should filtrar vistas por fase activa', () => {
    componente.documentos = [
      pendiente,
      { ...pendiente, tipo_id: 't2', fase: 'HACER', tipo_codigo: 'FURAT', tipo_nombre: 'FURAT' },
    ];
    componente.faseActiva = 'PLANEAR';
    expect(componente.vistasFase).toHaveLength(1);
    expect(componente.vistasFase[0].documento.tipo_id).toBe('t1');
  });

  it('should rechazar archivo invalido sin llamar al API', () => {
    const malo = new File(['x'], 'nota.txt', { type: 'text/plain' });
    componente.alCargarArchivo({ tipoId: 't1', archivo: malo });
    expect(documentosApi.cargar).not.toHaveBeenCalled();
    expect(componente.errorCarga).toContain('PDF');
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
  });

  it('should marcar revisado y actualizar estado local', () => {
    const revisado = { ...cargado, estado: 'REVISADO' as const };
    documentosApi.marcarRevisado.mockReturnValue(of(revisado));
    componente.documentos = [cargado];
    componente.marcarRevisado('t1');
    expect(documentosApi.marcarRevisado).toHaveBeenCalledWith('e1', 't1');
    expect(componente.documentos[0].estado).toBe('REVISADO');
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
});
