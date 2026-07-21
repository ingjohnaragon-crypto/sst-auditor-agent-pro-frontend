import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { TooltipDirective } from './tooltip.directive';

@Component({ standalone: true, imports: [TooltipDirective], template: '<button appTooltip="Ayuda">Información</button>' })
class AnfitrionTooltipPruebaComponent {}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<AnfitrionTooltipPruebaComponent>;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [OverlayModule] }); fixture = TestBed.createComponent(AnfitrionTooltipPruebaComponent); fixture.detectChanges(); });

  it('should describir el anfitrion mientras el tooltip esta visible', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    boton.dispatchEvent(new Event('mouseenter')); fixture.detectChanges();
    expect(boton.getAttribute('aria-describedby')).toMatch(/^tooltip-/);
    boton.dispatchEvent(new Event('mouseleave'));
    expect(boton.hasAttribute('aria-describedby')).toBe(false);
  });
});
