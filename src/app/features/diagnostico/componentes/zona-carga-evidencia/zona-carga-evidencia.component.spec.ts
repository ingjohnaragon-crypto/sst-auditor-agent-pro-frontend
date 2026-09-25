import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type { UsuarioAutenticado } from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { Evidencia } from '../../modelos';
import { ServicioEvidencias } from '../../servicios/servicio-evidencias';
import { ZonaCargaEvidenciaComponent } from './zona-carga-evidencia.component';

const evidencia: Evidencia = {
  id: 'ev-1',
  calificacion_estandar_id: 'cal-1',
  usuario_id: 'u-1',
  nombre_archivo: 'soporte.pdf',
  tipo_mime: 'application/pdf',
  tamano_bytes: 4,
  ruta_almacenamiento: 'evidencias/cal-1/a.pdf',
  fecha_carga: '2026-09-24T00:00:00Z',
  activo: true,
};

describe('ZonaCargaEvidenciaComponent', () => {
  let fixture: ComponentFixture<ZonaCargaEvidenciaComponent>;
  let subirArchivo: jest.Mock;
  let listarPorCalificacion: jest.Mock;
  const usuario = signal<UsuarioAutenticado | null>({
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  });

  beforeEach(async () => {
    subirArchivo = jest.fn(() => of(evidencia));
    listarPorCalificacion = jest.fn(() => of([]));
    await TestBed.configureTestingModule({
      imports: [ZonaCargaEvidenciaComponent],
      providers: [
        {
          provide: ServicioEvidencias,
          useValue: {
            listarPorCalificacion,
            subirArchivo,
            obtenerEnlaceDescarga: () => of({ url: '/api/v1/descargas/evidencias?token=abc', expira_en_segundos: 300 }),
          },
        },
        {
          provide: ServicioAutenticacion,
          useValue: { usuarioActual: usuario.asReadonly() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ZonaCargaEvidenciaComponent);
    fixture.componentInstance.calificacionId = 'cal-1';
  });

  it('should no llamar al API si el archivo no es PDF JPEG o PNG', () => {
    fixture.detectChanges();
    const archivo = new File(['x'], 'virus.exe', { type: 'application/octet-stream' });
    fixture.componentInstance.alSoltar(eventoSoltar(archivo));
    expect(subirArchivo).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error).toMatch(/PDF, JPEG y PNG/);
  });

  it('should subir un PDF valido al soltarlo', () => {
    fixture.detectChanges();
    const previa = { ...evidencia, id: 'ev-vieja', nombre_archivo: 'antes.pdf' };
    fixture.componentInstance.evidencias = [previa, evidencia];
    const archivo = new File(['%PDF'], 'soporte.pdf', { type: 'application/pdf' });
    fixture.componentInstance.alSoltar(eventoSoltar(archivo));
    expect(subirArchivo).toHaveBeenCalledWith('cal-1', archivo);
    expect(fixture.componentInstance.evidencias).toEqual([evidencia, previa]);
  });

  it('should ocultar la zona de carga para CONSULTA', () => {
    usuario.set({
      id: '2',
      nombre_completo: 'Leo',
      correo: 'leo@empresa.com',
      rol: 'CONSULTA',
    });
    fixture.detectChanges();
    const zona = (fixture.nativeElement as HTMLElement).querySelector('input[type="file"]');
    expect(zona).toBeNull();
  });

  it('should ignorar el arrastre en readonly o mientras sube', () => {
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    componente.readonly = true;
    componente.alArrastrarSobre(eventoSoltar(pdfValido()));
    expect(componente.arrastrando).toBe(false);
    componente.alSoltar(eventoSoltar(pdfValido()));
    expect(subirArchivo).not.toHaveBeenCalled();

    componente.readonly = false;
    const pendiente = new Subject<Evidencia>();
    subirArchivo.mockReturnValue(pendiente.asObservable());
    componente.alSoltar(eventoSoltar(pdfValido()));
    componente.alArrastrarSobre(eventoSoltar(pdfValido()));
    componente.alSoltar(eventoSoltar(pdfValido()));
    expect(componente.arrastrando).toBe(false);
    expect(subirArchivo).toHaveBeenCalledTimes(1);
  });

  it('should marcar y limpiar el estado de arrastre', () => {
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    componente.alArrastrarSobre(eventoSoltar(pdfValido()));
    expect(componente.arrastrando).toBe(true);
    componente.alSalirArrastre();
    expect(componente.arrastrando).toBe(false);
  });

  it('should ignorar un drop sin archivo y un evento que no es input', () => {
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    componente.alSoltar({ preventDefault: () => undefined, dataTransfer: null } as unknown as DragEvent);
    componente.alSeleccionar({ target: document.createElement('div') } as unknown as Event);
    expect(subirArchivo).not.toHaveBeenCalled();
  });

  it('should subir desde el selector y mostrar el error del API', () => {
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const input = document.createElement('input');
    const archivo = pdfValido();
    Object.defineProperty(input, 'files', { value: [archivo] });
    componente.alSeleccionar({ target: input } as unknown as Event);
    expect(subirArchivo).toHaveBeenCalledWith('cal-1', archivo);
    expect(input.value).toBe('');

    subirArchivo.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { mensaje: 'Archivo inválido' } }))
    );
    componente.alSeleccionar({ target: input } as unknown as Event);
    expect(componente.error).toBe('Archivo inválido');
    expect(componente.subiendo).toBe(false);
  });

  it('should listar solo activas y vaciar la lista si el GET falla', () => {
    const inactiva = { ...evidencia, id: 'ev-0', activo: false };
    listarPorCalificacion.mockReturnValue(of([inactiva, evidencia]));
    fixture.componentInstance.ngOnChanges({
      calificacionId: {
        currentValue: 'cal-1',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    expect(fixture.componentInstance.evidencias).toEqual([evidencia]);

    listarPorCalificacion.mockReturnValue(throwError(() => new Error('red')));
    fixture.componentInstance.ngOnChanges({
      calificacionId: {
        currentValue: 'cal-2',
        previousValue: 'cal-1',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(fixture.componentInstance.evidencias).toEqual([]);
  });

  it('should abrir y cerrar el visor solo si la evidencia esta activa', () => {
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    componente.abrir({ ...evidencia, activo: false });
    expect(componente.evidenciaEnVisor).toBeNull();
    componente.abrir(evidencia);
    expect(componente.evidenciaEnVisor).toEqual(evidencia);
    componente.cerrarVisor();
    expect(componente.evidenciaEnVisor).toBeNull();
  });

  it('should no recargar la lista si el id queda vacio', () => {
    fixture.detectChanges();
    listarPorCalificacion.mockClear();
    fixture.componentInstance.calificacionId = '';
    fixture.componentInstance.ngOnChanges({
      calificacionId: {
        currentValue: '',
        previousValue: 'cal-1',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.componentInstance.ngOnChanges({});
    expect(listarPorCalificacion).not.toHaveBeenCalled();
  });
});

function pdfValido(): File {
  return new File(['%PDF'], 'soporte.pdf', { type: 'application/pdf' });
}

function eventoSoltar(archivo: File): DragEvent {
  return {
    preventDefault: () => undefined,
    dataTransfer: { files: [archivo] },
  } as unknown as DragEvent;
}
