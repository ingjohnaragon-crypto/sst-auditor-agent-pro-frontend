import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { RespuestaCumplimientoPhva } from '../../modelos';
import { GraficoCumplimientoPhvaComponent } from './grafico-cumplimiento-phva.component';

function cumplimiento(parcial: Partial<RespuestaCumplimientoPhva> = {}): RespuestaCumplimientoPhva {
  return {
    autoevaluacion_id: 'ae-1',
    empresa_id: 'e-1',
    perfil: 'TABLA_7',
    puntaje_total: '72.50',
    umbral_plan_mejora: '85.00',
    requiere_plan_mejora: true,
    finalizada: false,
    fases: [
      {
        ciclo_phva: 'ACTUAR',
        peso_maximo: '10.00',
        puntaje_obtenido: '5.50',
        porcentaje_cumplimiento: '55.00',
        brecha: '4.50',
      },
      {
        ciclo_phva: 'PLANEAR',
        peso_maximo: '25.00',
        puntaje_obtenido: '20.00',
        porcentaje_cumplimiento: '80.00',
        brecha: '5.00',
      },
      {
        ciclo_phva: 'HACER',
        peso_maximo: '40.00',
        puntaje_obtenido: '30.00',
        porcentaje_cumplimiento: '75.00',
        brecha: '10.00',
      },
      {
        ciclo_phva: 'VERIFICAR',
        peso_maximo: '25.00',
        puntaje_obtenido: '17.00',
        porcentaje_cumplimiento: '68.00',
        brecha: '8.00',
      },
    ],
    ...parcial,
  };
}

describe('GraficoCumplimientoPhvaComponent', () => {
  let fixture: ComponentFixture<GraficoCumplimientoPhvaComponent>;
  let componente: GraficoCumplimientoPhvaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoCumplimientoPhvaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GraficoCumplimientoPhvaComponent);
    componente = fixture.componentInstance;
  });

  it('should mostrar porcentajes del API y orden PHVA aunque ACTUAR llegue primero', () => {
    componente.estado = 'listo';
    componente.cumplimiento = cumplimiento();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Planear');
    expect(texto).toContain('Hacer');
    expect(texto).toContain('Verificar');
    expect(texto).toContain('Actuar');
    expect(texto).toContain('80.00');
    expect(texto).toContain('4.50');
    expect(texto.indexOf('Planear')).toBeLessThan(texto.indexOf('Hacer'));
    expect(texto.indexOf('Hacer')).toBeLessThan(texto.indexOf('Verificar'));
    expect(texto.indexOf('Verificar')).toBeLessThan(texto.indexOf('Actuar'));

    const barras = fixture.nativeElement.querySelectorAll('[role="progressbar"]');
    expect(barras[0].getAttribute('aria-valuenow')).toBe('80');
    expect(barras[0].getAttribute('aria-label')).toContain('Planear: 80.00 por ciento');
  });

  it('should mostrar brecha global y alerta de plan de mejora', () => {
    componente.estado = 'listo';
    componente.cumplimiento = cumplimiento();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Brecha al umbral: 12.50 pts');
    expect(texto).toContain('Requiere plan de mejora (umbral 85.00 %).');
  });

  it('should mostrar estado cargando', () => {
    componente.estado = 'cargando';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Cargando cumplimiento PHVA'
    );
  });

  it('should mostrar estado vacio sin barras', () => {
    componente.estado = 'vacio';
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain(
      'No hay autoevaluación para mostrar el cumplimiento PHVA.'
    );
    expect(host.querySelectorAll('[role="progressbar"]').length).toBe(0);
  });

  it('should mostrar error y emitir reintento', () => {
    const reintentar = jest.fn();
    componente.estado = 'error';
    componente.mensajeError = 'Autoevaluación inexistente';
    componente.alReintentar.subscribe(reintentar);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Autoevaluación inexistente'
    );
    const boton = (fixture.nativeElement as HTMLElement).querySelector('app-boton button');
    boton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(reintentar).toHaveBeenCalled();
  });

  it('should mostrar hueco accesible cuando falta una fase', () => {
    componente.estado = 'listo';
    componente.cumplimiento = cumplimiento({
      fases: [
        {
          ciclo_phva: 'PLANEAR',
          peso_maximo: '25.00',
          puntaje_obtenido: '20.00',
          porcentaje_cumplimiento: '80.00',
          brecha: '5.00',
        },
      ],
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sin dato');
    expect(
      componente.etiquetaAria({
        ciclo: 'HACER',
        etiqueta: 'Hacer',
        fase: null,
        colorBarra: 'bg-emerald-500',
      })
    ).toBe('Hacer: sin dato');
  });

  it('should usar variante oscura y acotar anchos invalidos', () => {
    componente.variante = 'oscuro';
    componente.cumplimiento = cumplimiento({
      puntaje_total: 'no-num',
      umbral_plan_mejora: 'x',
      requiere_plan_mejora: false,
      finalizada: true,
    });
    fixture.detectChanges();

    expect(componente.clasesContenedor).toContain('text-white');
    expect(componente.clasesEtiqueta).toContain('text-indigo-300');
    expect(componente.clasesPista).toContain('bg-slate-700');
    expect(componente.clasesPlaceholder).toContain('bg-slate-700');
    expect(componente.clasesChip).toContain('bg-white/10');
    expect(componente.distanciaAlUmbral).toBe('0.00');
    expect(componente.anchoBarra('abc')).toBe(0);
    expect(componente.anchoBarra('150')).toBe(100);
    expect(componente.anchoBarra('-10')).toBe(0);
  });
});
