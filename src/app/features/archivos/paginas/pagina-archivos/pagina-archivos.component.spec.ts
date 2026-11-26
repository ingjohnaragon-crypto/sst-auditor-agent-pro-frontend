import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ServicioModal } from '@app/shared';

import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { ServicioEmpresas } from '../../../diagnostico/servicios/servicio-empresas';
import type { ArchivoDocumental } from '../../modelos';
import { ServicioArchivosDocumentales } from '../../servicios/servicio-archivos-documentales';
import { PaginaArchivosComponent } from './pagina-archivos.component';

describe('PaginaArchivosComponent', () => {
  let fixture: ComponentFixture<PaginaArchivosComponent>;
  let componente: PaginaArchivosComponent;

  const usuario = signal<UsuarioAutenticado | null>(null);
  const empresasApi = {
    listar: jest.fn(),
  };
  const archivosApi = {
    listar: jest.fn(),
    cargar: jest.fn(),
    descargar: jest.fn(),
    eliminar: jest.fn(),
  };
  const modalApi = {
    abrir: jest.fn(),
  };

  const archivo: ArchivoDocumental = {
    id: 'a1',
    empresa_id: 'e1',
    nombre_original: 'acta.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 100,
    fecha_carga: '2026-09-24T00:00:00Z',
    usuario_id: 'u1',
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
    archivosApi.listar.mockReturnValue(of([archivo]));
    modalApi.abrir.mockReturnValue({ closed: of(true) });

    await TestBed.configureTestingModule({
      imports: [PaginaArchivosComponent],
      providers: [
        { provide: ServicioEmpresas, useValue: empresasApi },
        { provide: ServicioArchivosDocumentales, useValue: archivosApi },
        {
          provide: ServicioAutenticacion,
          useValue: { usuarioActual: usuario.asReadonly() },
        },
        { provide: ServicioModal, useValue: modalApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaArchivosComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should listar archivos al cargar con una sola empresa', () => {
    expect(empresasApi.listar).toHaveBeenCalled();
    expect(archivosApi.listar).toHaveBeenCalledWith('e1');
    expect(componente.archivos).toEqual([archivo]);
    expect(componente.puedeEscribir).toBe(true);
  });

  it('should ocultar escritura when rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    expect(componente.puedeEscribir).toBe(false);
  });

  it('should rechazar archivo invalido sin llamar al API', () => {
    const malo = new File(['x'], 'nota.txt', { type: 'text/plain' });
    componente.alSeleccionarArchivo(malo);
    expect(archivosApi.cargar).not.toHaveBeenCalled();
    expect(componente.errorCarga).toContain('PDF');
  });

  it('should refrescar listado after carga exitosa', () => {
    archivosApi.cargar.mockReturnValue(of(archivo));
    archivosApi.listar.mockClear();
    archivosApi.listar.mockReturnValue(of([archivo]));
    const pdf = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    componente.alSeleccionarArchivo(pdf);
    expect(archivosApi.cargar).toHaveBeenCalled();
    expect(archivosApi.listar).toHaveBeenCalledWith('e1');
    expect(componente.mensajeExito).toContain('cargado');
  });

  it('should eliminar de la lista when se confirma el borrado', () => {
    archivosApi.eliminar.mockClear();
    archivosApi.eliminar.mockReturnValue(of(void 0));
    componente.archivos = [archivo];
    componente.eliminar(archivo);
    expect(modalApi.abrir).toHaveBeenCalled();
    expect(archivosApi.eliminar).toHaveBeenCalledWith('e1', 'a1');
    expect(componente.archivos).toEqual([]);
  });

  it('should no eliminar when se cancela la confirmacion', () => {
    archivosApi.eliminar.mockClear();
    modalApi.abrir.mockReturnValue({ closed: of(false) });
    componente.archivos = [archivo];
    componente.eliminar(archivo);
    expect(archivosApi.eliminar).not.toHaveBeenCalled();
    expect(componente.archivos).toEqual([archivo]);
  });

  it('should mostrar error when listar falla', () => {
    archivosApi.listar.mockReturnValue(
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

  it('should listar al seleccionar empresa', () => {
    archivosApi.listar.mockClear();
    archivosApi.listar.mockReturnValue(of([archivo]));
    componente.empresaSeleccionadaId = 'e1';
    componente.seleccionarEmpresa();
    expect(archivosApi.listar).toHaveBeenCalledWith('e1');
  });

  it('should limpiar listado when se deselecciona empresa', () => {
    componente.archivos = [archivo];
    componente.empresaSeleccionadaId = '';
    componente.seleccionarEmpresa();
    expect(componente.archivos).toEqual([]);
  });

  it('should no listar sin empresa seleccionada', () => {
    archivosApi.listar.mockClear();
    componente.empresaSeleccionadaId = '';
    componente.cargarLista();
    expect(archivosApi.listar).not.toHaveBeenCalled();
  });

  it('should mostrar error de carga when el API falla', () => {
    archivosApi.cargar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: { mensaje: 'Archivo inválido' },
          })
      )
    );
    const pdf = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    componente.alSeleccionarArchivo(pdf);
    expect(componente.errorCarga).toBe('Archivo inválido');
  });

  it('should no cargar when rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    archivosApi.cargar.mockClear();
    const pdf = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    componente.alSeleccionarArchivo(pdf);
    expect(archivosApi.cargar).not.toHaveBeenCalled();
  });

  it('should descargar blob via API', () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    archivosApi.descargar.mockReturnValue(of(blob));
    const createObjectURL = jest.fn(() => 'blob:mock');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const appendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((n) => n);
    const createElement = jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      rel: '',
      click: jest.fn(),
      remove: jest.fn(),
    } as unknown as HTMLAnchorElement);

    try {
      componente.descargar(archivo);
      expect(archivosApi.descargar).toHaveBeenCalledWith('e1', 'a1');
      expect(createObjectURL).toHaveBeenCalled();
    } finally {
      createElement.mockRestore();
      appendChild.mockRestore();
    }
  });

  it('should mostrar error when descarga falla', () => {
    archivosApi.descargar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { mensaje: 'No encontrado' },
          })
      )
    );
    componente.descargar(archivo);
    expect(componente.mensajeError).toBe('No encontrado');
  });

  it('should mostrar error when eliminar falla', () => {
    archivosApi.eliminar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { mensaje: 'Sin permiso' },
          })
      )
    );
    modalApi.abrir.mockReturnValue({ closed: of(true) });
    componente.archivos = [archivo];
    componente.eliminar(archivo);
    expect(componente.mensajeError).toBe('Sin permiso');
    expect(componente.archivos).toEqual([archivo]);
  });

  it('should no eliminar when rol CONSULTA', () => {
    establecerUsuario('CONSULTA');
    modalApi.abrir.mockClear();
    componente.eliminar(archivo);
    expect(modalApi.abrir).not.toHaveBeenCalled();
  });

  it('should mostrar error when listar empresas falla', () => {
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
});
