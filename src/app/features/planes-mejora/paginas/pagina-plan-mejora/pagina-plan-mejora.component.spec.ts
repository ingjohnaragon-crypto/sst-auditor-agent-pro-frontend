import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { Autoevaluacion } from '../../../diagnostico/modelos';
import { ServicioAutoevaluaciones } from '../../../diagnostico/servicios/servicio-autoevaluaciones';
import type { PlanMejora } from '../../modelos/plan-mejora.model';
import { ServicioPlanMejora } from '../../servicios/servicio-plan-mejora';
import { PaginaPlanMejoraComponent } from './pagina-plan-mejora.component';

describe('PaginaPlanMejoraComponent', () => {
  let fixture: ComponentFixture<PaginaPlanMejoraComponent>;
  const usuario = signal<UsuarioAutenticado | null>(null);
  const params = new BehaviorSubject(convertToParamMap({ autoevaluacionId: 'ae-1' }));
  const obtenerPorId = jest.fn();
  const obtenerPorAutoevaluacion = jest.fn();
  const actualizarActividad = jest.fn();

  function autoevaluacion(requierePlanMejora: boolean): Autoevaluacion {
    return {
      id: 'ae-1',
      empresa_id: 'e-1',
      usuario_id: 'u-1',
      fecha: '2026-09-19',
      puntaje_total: '70.00',
      requiere_plan_mejora: requierePlanMejora,
      calificaciones: [],
      fecha_creacion: '2026-09-19T10:00:00Z',
      fecha_actualizacion: '2026-09-19T10:00:00Z',
    };
  }

  function plan(actividades: PlanMejora['actividades'] = []): PlanMejora {
    return {
      id: 'plan-1',
      empresa_id: 'e-1',
      autoevaluacion_id: 'ae-1',
      actividades,
    };
  }

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: 'u-1',
      nombre_completo: 'Ana',
      correo: 'ana@empresa.com',
      rol,
    });
  }

  function texto(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  async function crear(): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PaginaPlanMejoraComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params.asObservable() },
        },
        { provide: ServicioAutoevaluaciones, useValue: { obtenerPorId } },
        {
          provide: ServicioPlanMejora,
          useValue: { obtenerPorAutoevaluacion, actualizarActividad },
        },
        {
          provide: ServicioAutenticacion,
          useValue: { usuarioActual: usuario.asReadonly() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaPlanMejoraComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    establecerUsuario('AUDITOR_SST');
    params.next(convertToParamMap({ autoevaluacionId: 'ae-1' }));
    obtenerPorId.mockReset();
    obtenerPorAutoevaluacion.mockReset().mockReturnValue(of(plan()));
    actualizarActividad.mockReset();
  });

  it('should decir que no exige plan y no pedir el cronograma', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(false)));
    await crear();
    expect(texto()).toContain('Esta autoevaluación no exige plan de mejora.');
    expect(obtenerPorAutoevaluacion).not.toHaveBeenCalled();
  });

  it('should listar descripcion responsable indicador y meses en el orden del api', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Ana',
            indicador: 'Cobertura',
            meses: [12, 1],
          },
          {
            id: 'act-2',
            descripcion: 'Capacitación',
            responsable: 'Luis',
            indicador: 'Asistencia',
            meses: [3],
          },
        ])
      )
    );
    await crear();

    const articulos = (fixture.nativeElement as HTMLElement).querySelectorAll('article');
    const campos = articulos[0].querySelectorAll<HTMLInputElement>('input');
    expect(articulos[0].textContent).toContain('Inspección');
    expect(articulos[0].textContent).toContain('12, 1');
    expect(campos[0].value).toBe('Ana');
    expect(campos[1].value).toBe('Cobertura');
    expect(articulos[1].textContent).toContain('Capacitación');
    expect(texto().indexOf('Inspección')).toBeLessThan(texto().indexOf('Capacitación'));
  });

  it('should guardar reenviando descripcion y meses y reemplazar la lista', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Ana',
            indicador: 'Cobertura',
            meses: [1, 12],
          },
        ])
      )
    );
    actualizarActividad.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Luis',
            indicador: 'Cierres',
            meses: [1, 12],
          },
        ])
      )
    );
    await crear();
    fixture.componentInstance.edicion['act-1'].responsable = 'Luis';
    fixture.componentInstance.edicion['act-1'].indicador = 'Cierres';
    fixture.detectChanges();

    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Guardar'));
    boton?.click();
    fixture.detectChanges();

    expect(actualizarActividad).toHaveBeenCalledWith('plan-1', 'act-1', {
      descripcion: 'Inspección',
      responsable: 'Luis',
      indicador: 'Cierres',
      meses: [1, 12],
    });
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.value).toBe('Luis');
  });

  it('should ocultar la edicion cuando el rol es CONSULTA', async () => {
    establecerUsuario('CONSULTA');
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Ana',
            indicador: 'Cobertura',
            meses: [1],
          },
        ])
      )
    );
    await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('input')).toBeNull();
    expect(raiz.textContent).not.toContain('Guardar');
    expect(raiz.textContent).toContain('Inspección');
    expect(raiz.textContent).toContain('Ana');
    expect(raiz.textContent).toContain('Cobertura');
  });

  it('should decir que aun no hay plan cuando el get responde 404', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { codigo: 'PLAN_MEJORA_NO_ENCONTRADO', mensaje: 'No está' },
          })
      )
    );
    await crear();
    expect(texto()).toContain('Aún no hay plan de mejora para esta autoevaluación.');
    expect(texto()).not.toContain('no exige plan');
  });

  it('should decir que el plan no tiene actividades', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(of(plan([])));
    await crear();
    expect(texto()).toContain('Este plan todavía no tiene actividades.');
    expect(texto()).not.toContain('Agregar');
  });

  it('should mostrar el mensaje si la autoevaluacion no existe', async () => {
    obtenerPorId.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { mensaje: 'No existe la autoevaluación.' },
          })
      )
    );
    await crear();
    expect(texto()).toContain('No existe la autoevaluación.');
    expect(texto()).not.toContain('no exige plan');
    expect(obtenerPorAutoevaluacion).not.toHaveBeenCalled();
  });

  it('should mostrar el mensaje del put y conservar la lista', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Ana',
            indicador: 'Cobertura',
            meses: [1],
          },
        ])
      )
    );
    actualizarActividad.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            statusText: 'Unprocessable Entity',
            error: { mensaje: 'El responsable supera 150 caracteres.' },
          })
      )
    );
    await crear();
    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Guardar'));
    boton?.click();
    fixture.detectChanges();
    expect(texto()).toContain('El responsable supera 150 caracteres.');
    expect(texto()).toContain('Inspección');
  });

  it('should mostrar el mensaje si el plan falla por otro error', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            statusText: 'Error',
            error: { mensaje: 'Fallo al leer el plan.' },
          })
      )
    );
    await crear();
    expect(texto()).toContain('Fallo al leer el plan.');
    expect(texto()).not.toContain('Aún no hay plan');
  });
});
