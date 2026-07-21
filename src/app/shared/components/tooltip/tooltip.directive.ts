import { Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';

export type PosicionTooltip = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') texto = '';
  @Input() posicionTooltip: PosicionTooltip = 'arriba';

  private referenciaOverlay: OverlayRef | null = null;
  private readonly identificador = `tooltip-${Math.random().toString(36).slice(2)}`;
  private readonly overlay = inject(Overlay);
  private readonly anfitrion = inject(ElementRef<HTMLElement>);

  @HostListener('mouseenter')
  @HostListener('focusin')
  mostrar(): void {
    if (!this.texto || this.referenciaOverlay) {
      return;
    }

    this.referenciaOverlay = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.anfitrion)
        .withPositions(this.obtenerPosiciones()),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    // Escribir en el pane del overlay: dispose() destruye el nodo (sin DomPortal/leak).
    const pane = this.referenciaOverlay.overlayElement;
    pane.id = this.identificador;
    pane.setAttribute('role', 'tooltip');
    pane.className = 'rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-lg';
    pane.textContent = this.texto;
    this.anfitrion.nativeElement.setAttribute('aria-describedby', this.identificador);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  @HostListener('keydown.escape')
  ocultar(): void {
    this.referenciaOverlay?.dispose();
    this.referenciaOverlay = null;
    this.anfitrion.nativeElement.removeAttribute('aria-describedby');
  }

  ngOnDestroy(): void {
    this.ocultar();
  }

  private obtenerPosiciones() {
    const porPosicion = {
      arriba: {
        originX: 'center' as const,
        originY: 'top' as const,
        overlayX: 'center' as const,
        overlayY: 'bottom' as const,
        offsetY: -8,
      },
      abajo: {
        originX: 'center' as const,
        originY: 'bottom' as const,
        overlayX: 'center' as const,
        overlayY: 'top' as const,
        offsetY: 8,
      },
      izquierda: {
        originX: 'start' as const,
        originY: 'center' as const,
        overlayX: 'end' as const,
        overlayY: 'center' as const,
        offsetX: -8,
      },
      derecha: {
        originX: 'end' as const,
        originY: 'center' as const,
        overlayX: 'start' as const,
        overlayY: 'center' as const,
        offsetX: 8,
      },
    };
    return [porPosicion[this.posicionTooltip]];
  }
}
