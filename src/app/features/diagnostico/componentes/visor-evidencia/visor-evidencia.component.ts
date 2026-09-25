import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';

import { environment } from '../../../../../environments/environment';
import type { Evidencia } from '../../modelos';
import { ServicioEvidencias } from '../../servicios/servicio-evidencias';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';
import { resolverUrlAbsoluta } from '../../utilidades/resolver-url-absoluta';

@Component({
  selector: 'app-visor-evidencia',
  standalone: true,
  imports: [NgIf],
  templateUrl: './visor-evidencia.component.html',
  styleUrls: ['./visor-evidencia.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisorEvidenciaComponent implements OnChanges {
  @Input() evidencia: Evidencia | null = null;
  @Output() alCerrar = new EventEmitter<void>();

  url: string | null = null;
  urlPdf: SafeResourceUrl | null = null;
  error: string | null = null;
  cargando = false;

  private readonly evidencias = inject(ServicioEvidencias);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);
  private solicitud = 0;

  get esPdf(): boolean {
    return this.evidencia?.tipo_mime === 'application/pdf';
  }

  get esImagen(): boolean {
    return this.evidencia?.tipo_mime === 'image/jpeg' || this.evidencia?.tipo_mime === 'image/png';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['evidencia']) {
      return;
    }
    this.url = null;
    this.urlPdf = null;
    this.error = null;
    const actual = this.evidencia;
    if (!actual || actual.activo === false) {
      this.cargando = false;
      if (actual && actual.activo === false) {
        this.error = 'La evidencia no está disponible.';
      }
      return;
    }
    this.pedirEnlace(actual.id);
  }

  cerrar(): void {
    this.solicitud += 1;
    this.url = null;
    this.urlPdf = null;
    this.alCerrar.emit();
  }

  private pedirEnlace(evidenciaId: string): void {
    const marca = ++this.solicitud;
    this.cargando = true;
    this.evidencias.obtenerEnlaceDescarga(evidenciaId).subscribe({
      next: (enlace) => {
        if (marca !== this.solicitud) {
          return;
        }
        const absoluta = resolverUrlAbsoluta(enlace.url, environment.apiBaseUrl);
        this.url = absoluta;
        this.urlPdf = this.sanitizer.bypassSecurityTrustResourceUrl(absoluta);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        if (marca !== this.solicitud) {
          return;
        }
        this.url = null;
        this.urlPdf = null;
        this.error = mensajeErrorHttp(error);
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }
}
