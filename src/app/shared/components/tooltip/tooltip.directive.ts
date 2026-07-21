import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, Inject, Input, OnDestroy } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DomPortal } from '@angular/cdk/portal';

export type PosicionTooltip = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') texto = '';
  @Input() posicionTooltip: PosicionTooltip = 'arriba';
  private referenciaOverlay: OverlayRef | null = null;
  private elementoTooltip: HTMLElement | null = null;
  private readonly identificador = `tooltip-${Math.random().toString(36).slice(2)}`;

  constructor(private readonly overlay: Overlay, private readonly anfitrion: ElementRef<HTMLElement>, @Inject(DOCUMENT) private readonly documento: Document) {}

  @HostListener('mouseenter') @HostListener('focusin') mostrar(): void {
    if (!this.texto || this.referenciaOverlay) return;
    const posiciones = this.obtenerPosiciones();
    this.referenciaOverlay = this.overlay.create({ positionStrategy: this.overlay.position().flexibleConnectedTo(this.anfitrion).withPositions(posiciones), scrollStrategy: this.overlay.scrollStrategies.reposition() });
    this.elementoTooltip = this.documento.createElement('div');
    this.elementoTooltip.id = this.identificador;
    this.elementoTooltip.setAttribute('role', 'tooltip');
    this.elementoTooltip.className = 'rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-lg';
    this.elementoTooltip.textContent = this.texto;
    this.documento.body.appendChild(this.elementoTooltip);
    this.referenciaOverlay.attach(new DomPortal(this.elementoTooltip));
    this.anfitrion.nativeElement.setAttribute('aria-describedby', this.identificador);
  }

  @HostListener('mouseleave') @HostListener('focusout') @HostListener('keydown.escape') ocultar(): void {
    this.referenciaOverlay?.dispose();
    this.referenciaOverlay = null;
    this.elementoTooltip = null;
    this.anfitrion.nativeElement.removeAttribute('aria-describedby');
  }

  ngOnDestroy(): void { this.ocultar(); }

  private obtenerPosiciones() {
    const porPosicion = {
      arriba: { originX: 'center' as const, originY: 'top' as const, overlayX: 'center' as const, overlayY: 'bottom' as const, offsetY: -8 },
      abajo: { originX: 'center' as const, originY: 'bottom' as const, overlayX: 'center' as const, overlayY: 'top' as const, offsetY: 8 },
      izquierda: { originX: 'start' as const, originY: 'center' as const, overlayX: 'end' as const, overlayY: 'center' as const, offsetX: -8 },
      derecha: { originX: 'end' as const, originY: 'center' as const, overlayX: 'start' as const, overlayY: 'center' as const, offsetX: 8 },
    };
    return [porPosicion[this.posicionTooltip]];
  }
}
