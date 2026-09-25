import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';

import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';
import { ROLES_ESCRITURA_DIAGNOSTICO } from '../../../../nucleo/auth/constantes-roles';
import type { RolUsuario } from '../../../../nucleo/auth/modelos/usuario-autenticado';
import type { Evidencia } from '../../modelos';
import { ServicioEvidencias } from '../../servicios/servicio-evidencias';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';
import { validarArchivoEvidencia } from '../../utilidades/validar-archivo-evidencia';
import { VisorEvidenciaComponent } from '../visor-evidencia/visor-evidencia.component';

@Component({
  selector: 'app-zona-carga-evidencia',
  standalone: true,
  imports: [NgIf, NgFor, SiTieneRolDirective, VisorEvidenciaComponent],
  templateUrl: './zona-carga-evidencia.component.html',
  styleUrls: ['./zona-carga-evidencia.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonaCargaEvidenciaComponent implements OnChanges {
  @Input({ required: true }) calificacionId!: string;
  @Input() readonly = false;

  readonly rolesEscritura: RolUsuario[] = [...ROLES_ESCRITURA_DIAGNOSTICO];
  evidencias: Evidencia[] = [];
  arrastrando = false;
  subiendo = false;
  error: string | null = null;
  evidenciaEnVisor: Evidencia | null = null;

  private readonly servicio = inject(ServicioEvidencias);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['calificacionId'] && this.calificacionId) {
      this.cargarLista();
    }
  }

  alArrastrarSobre(evento: DragEvent): void {
    evento.preventDefault();
    if (this.readonly || this.subiendo) {
      return;
    }
    this.arrastrando = true;
  }

  alSalirArrastre(): void {
    this.arrastrando = false;
  }

  alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando = false;
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) {
      this.intentarSubir(archivo);
    }
  }

  alSeleccionar(evento: Event): void {
    const input = evento.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const archivo = input.files?.[0];
    input.value = '';
    if (archivo) {
      this.intentarSubir(archivo);
    }
  }

  abrir(evidencia: Evidencia): void {
    if (!evidencia.activo) {
      return;
    }
    this.evidenciaEnVisor = null;
    this.cdr.detectChanges();
    this.evidenciaEnVisor = evidencia;
    this.cdr.markForCheck();
  }

  cerrarVisor(): void {
    this.evidenciaEnVisor = null;
  }

  private intentarSubir(archivo: File): void {
    if (this.readonly || this.subiendo) {
      return;
    }
    const mensaje = validarArchivoEvidencia(archivo);
    if (mensaje) {
      this.error = mensaje;
      this.cdr.markForCheck();
      return;
    }
    this.error = null;
    this.subiendo = true;
    this.servicio.subirArchivo(this.calificacionId, archivo).subscribe({
      next: (creada) => {
        this.evidencias = [creada, ...this.evidencias.filter((item) => item.id !== creada.id)];
        this.subiendo = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = mensajeErrorHttp(error);
        this.subiendo = false;
        this.cdr.markForCheck();
      },
    });
  }

  private cargarLista(): void {
    this.servicio.listarPorCalificacion(this.calificacionId).subscribe({
      next: (lista) => {
        this.evidencias = lista.filter((item) => item.activo);
        this.cdr.markForCheck();
      },
      error: () => {
        this.evidencias = [];
        this.cdr.markForCheck();
      },
    });
  }
}
