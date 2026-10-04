import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { DistribucionRiesgos } from '../../modelos/resumen-ejecutivo.model';
import { BarrasDistribucionRiesgosComponent } from './barras-distribucion-riesgos.component';

describe('BarrasDistribucionRiesgosComponent', () => {
  let fixture: ComponentFixture<BarrasDistribucionRiesgosComponent>;

  function barras(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[role="progressbar"]')
    );
  }

  function ancho(indice: number): string {
    return barras()[indice]?.querySelector('span')?.style.width ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarrasDistribucionRiesgosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarrasDistribucionRiesgosComponent);
  });

  it('should mostrar los cuatro niveles y conservar el cero', () => {
    const distribucion: DistribucionRiesgos = { I: 2, II: 0, III: 1, IV: 4 };
    fixture.componentRef.setInput('distribucion', distribucion);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(barras()).toHaveLength(4);
    expect(texto).toContain('Nivel I');
    expect(texto).toContain('Nivel II');
    expect(texto).toContain('Nivel III');
    expect(texto).toContain('Nivel IV');
    expect(barras().map((barra) => barra.getAttribute('aria-valuenow'))).toEqual([
      '2',
      '0',
      '1',
      '4',
    ]);
    expect(ancho(3)).toBe('100%');
    expect(ancho(1)).toBe('0%');
    expect(barras()[1].getAttribute('aria-label')).toBe('Nivel II: 0');
  });

  it('should dejar el relleno en cero cuando no hay conteos', () => {
    fixture.componentRef.setInput('distribucion', { I: 0, II: 0, III: 0, IV: 0 });
    fixture.detectChanges();

    expect(barras().map((barra) => barra.getAttribute('aria-valuenow'))).toEqual([
      '0',
      '0',
      '0',
      '0',
    ]);
    expect(ancho(0)).toBe('0%');
    expect(ancho(3)).toBe('0%');
  });

  it('should tratar una distribucion nula como ceros', () => {
    fixture.componentRef.setInput('distribucion', null);
    fixture.detectChanges();

    expect(barras()).toHaveLength(4);
    expect(barras()[0].getAttribute('aria-valuenow')).toBe('0');
    expect(ancho(0)).toBe('0%');
  });
});
