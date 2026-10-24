import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type {
  RolUsuario,
  UsuarioAutenticado,
} from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { ActividadCronograma } from '../../modelos/plan-mejora.model';
import {
  GrillaCronogramaComponent,
  type CambioMesCronograma,
} from './grilla-cronograma.component';

describe('GrillaCronogramaComponent', () => {
  let fixture: ComponentFixture<GrillaCronogramaComponent>;
  const usuario = signal<UsuarioAutenticado | null>(null);

  const actividades: ActividadCronograma[] = [
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
  ];

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: 'u-1',
      nombre_completo: 'Ana',
      correo: 'ana@empresa.com',
      rol,
    });
  }

  async function crear(): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [GrillaCronogramaComponent],
      providers: [
        {
          provide: ServicioAutenticacion,
          useValue: { usuarioActual: usuario.asReadonly() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(GrillaCronogramaComponent);
    fixture.componentRef.setInput('actividades', actividades);
    fixture.detectChanges();
  }

  beforeEach(() => {
    establecerUsuario('AUDITOR_SST');
  });

  it('should marcar ene y dic y permitir desplazamiento horizontal', async () => {
    await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    const ene = raiz.querySelector<HTMLInputElement>('input[aria-label="Ene"]');
    const feb = raiz.querySelector<HTMLInputElement>('input[aria-label="Feb"]');
    const dic = raiz.querySelector<HTMLInputElement>('input[aria-label="Dic"]');
    expect(raiz.querySelector('.overflow-x-auto')).not.toBeNull();
    expect(ene?.checked).toBe(true);
    expect(feb?.checked).toBe(false);
    expect(dic?.checked).toBe(true);
    expect(raiz.textContent?.indexOf('Inspección')).toBeLessThan(
      raiz.textContent?.indexOf('Capacitación') ?? -1
    );
  });

  it('should emitir la actividad y el mes al marcar', async () => {
    await crear();
    const emitidos: CambioMesCronograma[] = [];
    fixture.componentInstance.cambioMes.subscribe((cambio) => emitidos.push(cambio));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLInputElement>('input[aria-label="Feb"]')
      ?.click();

    expect(emitidos).toEqual([{ actividad: actividades[0], mes: 2 }]);
  });

  it('should emitir el id al quitar', async () => {
    await crear();
    const emitidos: string[] = [];
    fixture.componentInstance.quitar.subscribe((id) => emitidos.push(id));
    const boton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((el) => el.textContent?.includes('Quitar'));
    boton?.click();

    expect(emitidos).toEqual(['act-1']);
  });

  it('should mostrar la marca sin casilla ni quitar cuando el rol es CONSULTA', async () => {
    establecerUsuario('CONSULTA');
    await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('input')).toBeNull();
    expect(raiz.textContent).not.toContain('Quitar');
    expect(raiz.querySelector('[aria-label="Ene"]')?.textContent).toContain('●');
    expect(raiz.querySelector('[aria-label="Feb"]')).toBeNull();
  });
});
