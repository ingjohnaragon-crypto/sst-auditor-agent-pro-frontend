import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<button [appTooltip]="texto" [posicionTooltip]="posicion">Información</button>`,
})
class AnfitrionTooltipPruebaComponent {
  texto = 'Ayuda';
  posicion: 'arriba' | 'abajo' | 'izquierda' | 'derecha' = 'arriba';
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<AnfitrionTooltipPruebaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    fixture = TestBed.createComponent(AnfitrionTooltipPruebaComponent);
    fixture.detectChanges();
  });

  function boton(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
  }

  it('should describir el anfitrion mientras el tooltip esta visible', () => {
    boton().dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(boton().getAttribute('aria-describedby')).toMatch(/^tooltip-/);
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Ayuda');

    boton().dispatchEvent(new Event('mouseleave'));
    expect(boton().hasAttribute('aria-describedby')).toBe(false);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('should mostrar el tooltip al recibir foco y ocultarlo con Escape', () => {
    boton().dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    boton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('should no dejar nodos tooltip huerfanos tras varios ciclos', () => {
    for (let i = 0; i < 3; i += 1) {
      boton().dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      boton().dispatchEvent(new Event('mouseleave'));
    }
    expect(document.querySelectorAll('[role="tooltip"]').length).toBe(0);
  });

  it('should respetar posicionTooltip abajo', () => {
    fixture.componentInstance.posicion = 'abajo';
    fixture.detectChanges();
    boton().dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();
    boton().dispatchEvent(new Event('mouseleave'));
  });
});
