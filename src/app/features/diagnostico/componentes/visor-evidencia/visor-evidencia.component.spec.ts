import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import type { Evidencia } from '../../modelos';
import { ServicioEvidencias } from '../../servicios/servicio-evidencias';
import { VisorEvidenciaComponent } from './visor-evidencia.component';

const pdf: Evidencia = {
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

describe('VisorEvidenciaComponent', () => {
  let fixture: ComponentFixture<VisorEvidenciaComponent>;
  let obtenerEnlaceDescarga: jest.Mock;

  beforeEach(async () => {
    obtenerEnlaceDescarga = jest.fn(() =>
      of({ url: '/api/v1/descargas/evidencias?token=abc', expira_en_segundos: 300 })
    );
    await TestBed.configureTestingModule({
      imports: [VisorEvidenciaComponent],
      providers: [
        {
          provide: ServicioEvidencias,
          useValue: { obtenerEnlaceDescarga },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VisorEvidenciaComponent);
  });

  it('should pedir el enlace y mostrar un iframe para PDF', () => {
    fixture.componentInstance.evidencia = pdf;
    fixture.componentInstance.ngOnChanges({
      evidencia: {
        currentValue: pdf,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
    expect(obtenerEnlaceDescarga).toHaveBeenCalledWith('ev-1');
    expect(fixture.nativeElement.querySelector('iframe')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('should mostrar una imagen y no un iframe', () => {
    const imagen: Evidencia = { ...pdf, tipo_mime: 'image/png', nombre_archivo: 'foto.png' };
    fixture.componentInstance.evidencia = imagen;
    fixture.componentInstance.ngOnChanges({
      evidencia: {
        currentValue: imagen,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('should mostrar el error del canje y no dejar un iframe vacio', () => {
    obtenerEnlaceDescarga.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { mensaje: 'El archivo no está disponible', codigo: 'ARCHIVO_NO_DISPONIBLE' },
          })
      )
    );
    fixture.componentInstance.evidencia = pdf;
    fixture.componentInstance.ngOnChanges({
      evidencia: {
        currentValue: pdf,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.error).toBe('El archivo no está disponible');
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('should no ofrecer visor util para una evidencia inactiva', () => {
    fixture.componentInstance.evidencia = { ...pdf, activo: false };
    fixture.componentInstance.ngOnChanges({
      evidencia: {
        currentValue: fixture.componentInstance.evidencia,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
    expect(obtenerEnlaceDescarga).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
    expect(fixture.componentInstance.error).toMatch(/no está disponible/);
  });
});
