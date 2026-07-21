import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderInteractivoComponent } from './loader-interactivo.component';
import type { PasoEjecucion } from './paso-ejecucion.model';

describe('LoaderInteractivoComponent', () => {
  let fixture: ComponentFixture<LoaderInteractivoComponent>;
  let componente: LoaderInteractivoComponent;

  const pasosEjemplo: PasoEjecucion[] = [
    { id: '1', etiqueta: 'Pendiente', estado: 'pendiente' },
    { id: '2', etiqueta: 'Activo', estado: 'activo' },
    { id: '3', etiqueta: 'Hecho', estado: 'completado' },
    { id: '4', etiqueta: 'Fallo', estado: 'error' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderInteractivoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderInteractivoComponent);
    componente = fixture.componentInstance;
  });

  it('should no mostrar panel si visible es false', () => {
    componente.visible = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="loader-panel"]')).toBeNull();
  });

  it('should mostrar titulo y spinner sin progressbar en modo indeterminado', () => {
    componente.visible = true;
    componente.titulo = 'Cargando datos';
    componente.progreso = null;
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Cargando datos');
    expect(root.querySelector('.animate-spin')).toBeTruthy();
    expect(root.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('should exponer aria-valuenow en progreso determinado', () => {
    componente.visible = true;
    componente.progreso = 40;
    fixture.detectChanges();

    const barra = (fixture.nativeElement as HTMLElement).querySelector('[role="progressbar"]');
    expect(barra?.getAttribute('aria-valuenow')).toBe('40');
  });

  it('should renderizar los cuatro estados de paso', () => {
    componente.visible = true;
    componente.pasos = pasosEjemplo;
    fixture.detectChanges();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-estado]');
    const estados = Array.from(items).map((el) => el.getAttribute('data-estado'));
    expect(estados).toEqual(['pendiente', 'activo', 'completado', 'error']);
  });

  it('should emitir alCancelar al clic del boton si cancelable', () => {
    const spy = jest.fn();
    componente.visible = true;
    componente.cancelable = true;
    componente.alCancelar.subscribe(spy);
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector(
      'app-boton button'
    ) as HTMLButtonElement;
    boton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emitir alCancelar con Esc solo si cancelable', () => {
    const spy = jest.fn();
    componente.visible = true;
    componente.cancelable = false;
    componente.alCancelar.subscribe(spy);
    fixture.detectChanges();

    componente.alPulsarEscape();
    expect(spy).not.toHaveBeenCalled();

    componente.cancelable = true;
    componente.alPulsarEscape();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should cancelar con backdrop solo si cancelable', () => {
    const spy = jest.fn();
    componente.visible = true;
    componente.modo = 'bloqueante';
    componente.cancelable = false;
    componente.alCancelar.subscribe(spy);
    fixture.detectChanges();

    const backdrop = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="loader-backdrop"]'
    ) as HTMLElement;
    backdrop.click();
    expect(spy).not.toHaveBeenCalled();

    componente.cancelable = true;
    fixture.detectChanges();
    (
      (fixture.nativeElement as HTMLElement).querySelector(
        '[data-testid="loader-backdrop"]'
      ) as HTMLElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });

  it('should modo inline no montar backdrop ni aria-modal', () => {
    componente.visible = true;
    componente.modo = 'inline';
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-testid="loader-inline"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="loader-backdrop"]')).toBeNull();
    expect(root.querySelector('[aria-modal="true"]')).toBeNull();
  });

  it('should anunciar paso activo con detalle en aria-live', () => {
    componente.visible = true;
    componente.pasos = [
      { id: '1', etiqueta: 'Analizar', estado: 'activo', detalle: 'Archivos SG-SST' },
    ];
    fixture.detectChanges();
    expect(componente.textoAnuncio).toBe('Analizar. Archivos SG-SST');
  });
});
