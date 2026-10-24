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
  const agregarActividad = jest.fn();
  const quitarActividad = jest.fn();

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
          useValue: { obtenerPorAutoevaluacion, actualizarActividad, agregarActividad, quitarActividad },
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
    agregarActividad.mockReset();
    quitarActividad.mockReset();
  });

  it('should decir que no exige plan y no pedir el cronograma', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(false)));
    await crear();
    expect(texto()).toContain('Esta autoevaluación no exige plan de mejora.');
    expect(obtenerPorAutoevaluacion).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-grilla-cronograma')).toBeNull();
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

    const raiz = fixture.nativeElement as HTMLElement;
    const articulos = raiz.querySelectorAll('article');
    const responsable = articulos[0].querySelector<HTMLInputElement>('input[name="responsable-act-1"]');
    const indicador = articulos[0].querySelector<HTMLInputElement>('input[name="indicador-act-1"]');
    const ene = raiz.querySelector<HTMLInputElement>('input[aria-label="Ene"]');
    const feb = raiz.querySelector<HTMLInputElement>('input[aria-label="Feb"]');
    const dic = raiz.querySelector<HTMLInputElement>('input[aria-label="Dic"]');
    expect(articulos[0].textContent).toContain('Inspección');
    expect(ene?.checked).toBe(true);
    expect(feb?.checked).toBe(false);
    expect(dic?.checked).toBe(true);
    expect(responsable?.value).toBe('Ana');
    expect(indicador?.value).toBe('Cobertura');
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
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        'input[name="responsable-act-1"]'
      )?.value
    ).toBe('Luis');
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
    expect(raiz.textContent).not.toContain('Agregar');
    expect(raiz.textContent).not.toContain('Quitar');
    expect(raiz.querySelector('[aria-label="Ene"]')?.textContent).toContain('●');
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
    expect((fixture.nativeElement as HTMLElement).querySelector('app-grilla-cronograma')).toBeNull();
  });

  it('should decir que el plan no tiene actividades', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(of(plan([])));
    await crear();
    expect(texto()).toContain('Este plan todavía no tiene actividades.');
    expect(texto()).toContain('Agregar');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-grilla-cronograma')).not.toBeNull();
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

  it('should desmarcar ene reenviando los datos persistidos', async () => {
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
        ])
      )
    );
    actualizarActividad.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Ana',
            indicador: 'Cobertura',
            meses: [12],
          },
        ])
      )
    );
    await crear();
    fixture.componentInstance.edicion['act-1'].responsable = 'Borrador';
    (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[aria-label="Ene"]')?.click();
    fixture.detectChanges();

    expect(actualizarActividad).toHaveBeenCalledWith('plan-1', 'act-1', {
      descripcion: 'Inspección',
      responsable: 'Ana',
      indicador: 'Cobertura',
      meses: [12],
    });
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[aria-label="Ene"]')
        ?.checked
    ).toBe(false);
  });

  it('should marcar un mes que no estaba', async () => {
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
        ])
      )
    );
    actualizarActividad.mockReturnValue(
      of(
        plan([
          {
            id: 'act-1',
            descripcion: 'Inspección',
            responsable: 'Ana',
            indicador: 'Cobertura',
            meses: [12, 1, 2],
          },
        ])
      )
    );
    await crear();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[aria-label="Feb"]')?.click();
    fixture.detectChanges();

    expect(actualizarActividad).toHaveBeenCalledWith('plan-1', 'act-1', {
      descripcion: 'Inspección',
      responsable: 'Ana',
      indicador: 'Cobertura',
      meses: [12, 1, 2],
    });
  });

  it('should mostrar el mensaje si el cambio de mes responde 422 y conservar la marca', async () => {
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
        ])
      )
    );
    actualizarActividad.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            statusText: 'Unprocessable Entity',
            error: { codigo: 'ACTIVIDAD_CRONOGRAMA_INVALIDA', mensaje: 'Mes inválido.' },
          })
      )
    );
    await crear();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[aria-label="Ene"]')?.click();
    fixture.detectChanges();

    expect(texto()).toContain('Mes inválido.');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[aria-label="Ene"]')
        ?.checked
    ).toBe(true);
  });

  it('should agregar una actividad y pintar el plan devuelto', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(of(plan([])));
    agregarActividad.mockReturnValue(
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
    fixture.componentInstance.altaDescripcion = 'Inspección';
    fixture.componentInstance.altaResponsable = 'Ana';
    fixture.componentInstance.altaIndicador = 'Cobertura';
    fixture.componentInstance.alternarAlta(1);
    fixture.componentInstance.alternarAlta(1);
    fixture.componentInstance.alternarAlta(1);
    fixture.detectChanges();

    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Agregar'));
    boton?.click();
    fixture.detectChanges();

    expect(agregarActividad).toHaveBeenCalledWith('plan-1', {
      descripcion: 'Inspección',
      responsable: 'Ana',
      indicador: 'Cobertura',
      meses: [1],
    });
    expect(texto()).toContain('Inspección');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[name="alta-descripcion"]')
        ?.value
    ).toBe('');
  });

  it('should mostrar el mensaje si el alta responde 422 y conservar el formulario', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion.mockReturnValue(of(plan([])));
    agregarActividad.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            statusText: 'Unprocessable Entity',
            error: { codigo: 'ACTIVIDAD_CRONOGRAMA_INVALIDA', mensaje: 'Falta la descripción.' },
          })
      )
    );
    await crear();
    const descripcion = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[name="alta-descripcion"]'
    );
    if (descripcion) {
      descripcion.value = 'Borrador';
      descripcion.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();
    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Agregar'));
    boton?.click();
    fixture.detectChanges();

    expect(texto()).toContain('Falta la descripción.');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')).toHaveLength(0);
    expect(fixture.componentInstance.altaDescripcion).toBe('Borrador');
  });

  it('should quitar la actividad y volver a leer el plan', async () => {
    obtenerPorId.mockReturnValue(of(autoevaluacion(true)));
    obtenerPorAutoevaluacion
      .mockReturnValueOnce(
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
      )
      .mockReturnValue(of(plan([])));
    quitarActividad.mockReturnValue(of(undefined));
    await crear();

    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Quitar'));
    boton?.click();
    fixture.detectChanges();

    expect(quitarActividad).toHaveBeenCalledWith('plan-1', 'act-1');
    expect(obtenerPorAutoevaluacion).toHaveBeenCalledTimes(2);
    expect(texto()).not.toContain('Inspección');
  });

  it('should conservar la fila si quitar falla', async () => {
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
    quitarActividad.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { mensaje: 'No se pudo quitar.' },
          })
      )
    );
    await crear();
    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Quitar'));
    boton?.click();
    fixture.detectChanges();

    expect(obtenerPorAutoevaluacion).toHaveBeenCalledTimes(1);
    expect(texto()).toContain('Inspección');
    expect(texto()).toContain('No se pudo quitar.');
  });
});
