import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertaComponent, BotonComponent, ServicioModal } from '@app/shared';

import { ROLES_ESCRITURA_SST } from '../../../../nucleo/auth/constantes-roles';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import type { Empresa } from '../../../diagnostico/modelos';
import { ServicioEmpresas } from '../../../diagnostico/servicios/servicio-empresas';
import {
  DatosConfirmacion,
  DialogoConfirmacionComponent,
} from '../../../matriz-riesgos/componentes/dialogo-confirmacion/dialogo-confirmacion.component';
import { ListaArchivosComponent } from '../../componentes/lista-archivos/lista-archivos.component';
import { ZonaCargaArchivoComponent } from '../../componentes/zona-carga-archivo/zona-carga-archivo.component';
import type { ArchivoDocumental } from '../../modelos';
import { ServicioArchivosDocumentales } from '../../servicios/servicio-archivos-documentales';
import { dispararDescargaBlob } from '../../utilidades/formato-archivo';
import { mensajeErrorHttp } from '../../utilidades/mensaje-error-http';
import { validarArchivoDocumental } from '../../utilidades/validar-archivo-documental';

@Component({
  selector: 'app-pagina-archivos',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    AlertaComponent,
    BotonComponent,
    ListaArchivosComponent,
    ZonaCargaArchivoComponent,
  ],
  templateUrl: './pagina-archivos.component.html',
  styleUrls: ['./pagina-archivos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaArchivosComponent implements OnInit, OnDestroy {
  private readonly empresasApi = inject(ServicioEmpresas);
  private readonly archivosApi = inject(ServicioArchivosDocumentales);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly modal = inject(ServicioModal);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();

  empresas: Empresa[] = [];
  archivos: ArchivoDocumental[] = [];
  empresaSeleccionadaId = '';
  cargandoEmpresas = false;
  cargandoLista = false;
  subiendo = false;
  descargandoId: string | null = null;
  eliminandoId: string | null = null;
  mensajeError = '';
  mensajeExito = '';
  errorCarga: string | null = null;

  readonly trackEmpresa = (_: number, empresa: Empresa): string => empresa.id;

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return !!rol && ROLES_ESCRITURA_SST.includes(rol);
  }

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  cargarEmpresas(): void {
    this.cargandoEmpresas = true;
    this.mensajeError = '';
    this.suscripciones.add(
      this.empresasApi
        .listar()
        .pipe(
          finalize(() => {
            this.cargandoEmpresas = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (empresas) => {
            this.empresas = empresas;
            if (empresas.length === 1) {
              this.empresaSeleccionadaId = empresas[0].id;
              this.cargarLista();
            }
          },
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  seleccionarEmpresa(): void {
    this.archivos = [];
    this.mensajeError = '';
    this.mensajeExito = '';
    this.errorCarga = null;
    if (this.empresaSeleccionadaId) {
      this.cargarLista();
    }
    this.cdr.markForCheck();
  }

  cargarLista(): void {
    if (!this.empresaSeleccionadaId) {
      return;
    }
    const empresaId = this.empresaSeleccionadaId;
    this.cargandoLista = true;
    this.mensajeError = '';
    this.suscripciones.add(
      this.archivosApi
        .listar(empresaId)
        .pipe(
          finalize(() => {
            this.cargandoLista = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (lista) => {
            this.archivos = lista;
          },
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  alSeleccionarArchivo(archivo: File): void {
    if (!this.puedeEscribir || !this.empresaSeleccionadaId || this.subiendo) {
      return;
    }
    const invalido = validarArchivoDocumental(archivo);
    if (invalido) {
      this.errorCarga = invalido;
      this.cdr.markForCheck();
      return;
    }
    this.errorCarga = null;
    this.subiendo = true;
    this.mensajeExito = '';
    const empresaId = this.empresaSeleccionadaId;
    this.suscripciones.add(
      this.archivosApi
        .cargar(empresaId, archivo)
        .pipe(
          finalize(() => {
            this.subiendo = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.mensajeExito = 'Archivo cargado correctamente.';
            this.cargarLista();
          },
          error: (error: unknown) => {
            this.errorCarga = mensajeErrorHttp(error);
            this.cdr.markForCheck();
          },
        })
    );
  }

  descargar(archivo: ArchivoDocumental): void {
    if (!this.empresaSeleccionadaId || this.descargandoId) {
      return;
    }
    this.descargandoId = archivo.id;
    this.mensajeError = '';
    this.suscripciones.add(
      this.archivosApi
        .descargar(this.empresaSeleccionadaId, archivo.id)
        .pipe(
          finalize(() => {
            this.descargandoId = null;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (blob) => dispararDescargaBlob(blob, archivo.nombre_original),
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  eliminar(archivo: ArchivoDocumental): void {
    if (!this.puedeEscribir || !this.empresaSeleccionadaId) {
      return;
    }
    const datos: DatosConfirmacion = {
      titulo: 'Eliminar archivo',
      mensaje: `¿Eliminar «${archivo.nombre_original}» del repositorio documental? Esta acción no se puede deshacer.`,
    };
    const referencia = this.modal.abrir<boolean, DatosConfirmacion, DialogoConfirmacionComponent>(
      DialogoConfirmacionComponent,
      { data: datos }
    );
    this.suscripciones.add(
      referencia.closed.subscribe((confirmado) => {
        if (!confirmado || !this.empresaSeleccionadaId) {
          return;
        }
        this.eliminandoId = archivo.id;
        this.mensajeError = '';
        const empresaId = this.empresaSeleccionadaId;
        this.suscripciones.add(
          this.archivosApi
            .eliminar(empresaId, archivo.id)
            .pipe(
              finalize(() => {
                this.eliminandoId = null;
                this.cdr.markForCheck();
              })
            )
            .subscribe({
              next: () => {
                this.mensajeExito = 'Archivo eliminado.';
                this.archivos = this.archivos.filter((item) => item.id !== archivo.id);
                this.cdr.markForCheck();
              },
              error: (error: HttpErrorResponse) => this.mostrarError(error),
            })
        );
      })
    );
  }

  private mostrarError(error: HttpErrorResponse | unknown): void {
    this.mensajeError = mensajeErrorHttp(error);
    this.cdr.markForCheck();
  }
}
