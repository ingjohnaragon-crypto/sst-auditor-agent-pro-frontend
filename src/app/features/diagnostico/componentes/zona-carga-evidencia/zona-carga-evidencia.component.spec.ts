import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
  const usuario = signal<UsuarioAutenticado | null>({
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  });

  beforeEach(async () => {
    subirArchivo = jest.fn(() => of(evidencia));
    await TestBed.configureTestingModule({
      imports: [ZonaCargaEvidenciaComponent],
      providers: [
        {
          provide: ServicioEvidencias,
          useValue: {
            listarPorCalificacion: () => of([]),
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
    const archivo = new File(['%PDF'], 'soporte.pdf', { type: 'application/pdf' });
    fixture.componentInstance.alSoltar(eventoSoltar(archivo));
    expect(subirArchivo).toHaveBeenCalledWith('cal-1', archivo);
    expect(fixture.componentInstance.evidencias).toEqual([evidencia]);
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
});

function eventoSoltar(archivo: File): DragEvent {
  return {
    preventDefault: () => undefined,
    dataTransfer: { files: [archivo] },
  } as unknown as DragEvent;
}
