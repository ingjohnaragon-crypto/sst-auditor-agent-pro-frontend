import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { AvanceFasePhva } from '../../utilidades/avance-por-ciclo';
import { NavegadorFasesPhvaComponent } from './navegador-fases-phva.component';

const fases: AvanceFasePhva[] = [
  {
    ciclo: 'PLANEAR',
    etiqueta: 'I. Planear',
    etiquetaCorta: 'Planear',
    numero: 1,
    total: 2,
    calificados: 2,
    completa: true,
  },
  {
    ciclo: 'HACER',
    etiqueta: 'II. Hacer',
    etiquetaCorta: 'Hacer',
    numero: 2,
    total: 2,
    calificados: 0,
    completa: false,
  },
  {
    ciclo: 'VERIFICAR',
    etiqueta: 'III. Verificar',
    etiquetaCorta: 'Verificar',
    numero: 3,
    total: 1,
    calificados: 0,
    completa: false,
  },
  {
    ciclo: 'ACTUAR',
    etiqueta: 'IV. Actuar',
    etiquetaCorta: 'Actuar',
    numero: 4,
    total: 1,
    calificados: 0,
    completa: false,
  },
];

describe('NavegadorFasesPhvaComponent', () => {
  let fixture: ComponentFixture<NavegadorFasesPhvaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegadorFasesPhvaComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(NavegadorFasesPhvaComponent);
    fixture.componentInstance.fases = fases;
    fixture.componentInstance.cicloActual = 'PLANEAR';
    fixture.detectChanges();
  });

  it('should mostrar las cuatro fases y emitir al elegir una', () => {
    const emitir = jest.fn();
    fixture.componentInstance.alSeleccionar.subscribe(emitir);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Planear');
    expect(texto).toContain('Hacer');
    expect(texto).toContain('Fase completa');
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    botones[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(emitir).toHaveBeenCalledWith('HACER');
  });

  it('should navegar a la fase siguiente y no retroceder en la primera', () => {
    const emitir = jest.fn();
    fixture.componentInstance.alSeleccionar.subscribe(emitir);
    fixture.componentInstance.irAnterior();
    expect(emitir).not.toHaveBeenCalled();
    fixture.componentInstance.irSiguiente();
    expect(emitir).toHaveBeenCalledWith('HACER');
  });

  it('should mostrar pendientes y ocultar continuar en la ultima fase', () => {
    fixture.componentRef.setInput('cicloActual', 'ACTUAR');
    fixture.componentRef.setInput('mostrarContinuar', false);
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Falta 1 ítem en Actuar');
    expect(texto).not.toContain('Continuar a');
    fixture.componentInstance.irSiguiente();
  });

  it('should cubrir textos de avance y clases de fase', () => {
    fixture.componentRef.setInput('cicloActual', 'HACER');
    fixture.detectChanges();
    expect(fixture.componentInstance.textoPendientes).toContain('Faltan 2 ítems');
    expect(fixture.componentInstance.etiquetaSiguiente).toBe('Verificar');
    expect(fixture.componentInstance.clasesFase(fases[0])).toContain('emerald');
    expect(fixture.componentInstance.clasesFase(fases[1])).toContain('indigo');
    expect(fixture.componentInstance.clasesFase(fases[2])).toContain('slate');
    const emitir = jest.fn();
    fixture.componentInstance.alSeleccionar.subscribe(emitir);
    fixture.componentInstance.irAnterior();
    expect(emitir).toHaveBeenCalledWith('PLANEAR');
    fixture.componentRef.setInput('cicloActual', 'ACTUAR');
    expect(fixture.componentInstance.etiquetaSiguiente).toBe('');
    fixture.componentRef.setInput('cicloActual', 'PLANEAR');
    fixture.componentInstance.fases = [];
    expect(fixture.componentInstance.etiquetaSiguiente).toBe('HACER');
    expect(fixture.componentInstance.textoPendientes).toBe('');
  });
});
