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
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertaComponent, BotonComponent } from '@app/shared';

import { ROLES_ESCRITURA_SST } from '../../../../nucleo/auth/constantes-roles';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { dispararDescargaBlob } from '../../../archivos/utilidades/formato-archivo';
import { mensajeErrorHttp } from '../../../archivos/utilidades/mensaje-error-http';
import { validarArchivoDocumental } from '../../../archivos/utilidades/validar-archivo-documental';
import type { Empresa } from '../../../diagnostico/modelos';
import { ServicioEmpresas } from '../../../diagnostico/servicios/servicio-empresas';
import { ListaDocumentosFaseComponent } from '../../componentes/lista-documentos-fase/lista-documentos-fase.component';
import { PestanasFasePhvaComponent } from '../../componentes/pestanas-fase-phva/pestanas-fase-phva.component';
import type {
  DocumentoEmpresa,
  DocumentoVista,
  FaseDocumentoPhva,
  TipoDocumentoSst,
} from '../../modelos';
import { ServicioDocumentosEmpresa } from '../../servicios/servicio-documentos-empresa';
import { calcularAvanceDocumentos } from '../../utilidades/avance-documentos';

@Component({
  selector: 'app-pagina-documentos',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    AlertaComponent,
    BotonComponent,
    PestanasFasePhvaComponent,
    ListaDocumentosFaseComponent,
  ],
  templateUrl: './pagina-documentos.component.html',
  styleUrls: ['./pagina-documentos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDocumentosComponent implements OnInit, OnDestroy {
  private readonly empresasApi = inject(ServicioEmpresas);
  private readonly documentosApi = inject(ServicioDocumentosEmpresa);
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();

  empresas: Empresa[] = [];
  documentos: DocumentoEmpresa[] = [];
  catalogo: TipoDocumentoSst[] = [];
  empresaSeleccionadaId = '';
  faseActiva: FaseDocumentoPhva = 'PLANEAR';
  cargandoEmpresas = false;
  cargandoLista = false;
  subiendoTipoId: string | null = null;
  descargandoTipoId: string | null = null;
  revisandoTipoId: string | null = null;
  mensajeError = '';
  mensajeExito = '';
  errorCarga: string | null = null;

  readonly trackEmpresa = (_: number, empresa: Empresa): string => empresa.id;

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return !!rol && ROLES_ESCRITURA_SST.includes(rol);
  }

  get avancePorcentaje(): number {
    return calcularAvanceDocumentos(this.documentos);
  }

  get documentosCompletados(): number {
    return this.documentos.filter((d) => d.estado !== 'PENDIENTE').length;
  }

  get vistasFase(): DocumentoVista[] {
    const porTipo = new Map(this.catalogo.map((t) => [t.id, t]));
    return this.documentos
      .filter((d) => d.fase === this.faseActiva)
      .map((documento) => {
        const tipo = porTipo.get(documento.tipo_id);
        return {
          documento,
          obligatorio: tipo?.obligatorio ?? true,
          descripcion: tipo?.descripcion ?? '',
        };
      });
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
    this.documentos = [];
    this.mensajeError = '';
    this.mensajeExito = '';
    this.errorCarga = null;
    if (this.empresaSeleccionadaId) {
      this.cargarLista();
    }
    this.cdr.markForCheck();
  }

  cambiarFase(fase: FaseDocumentoPhva): void {
    this.faseActiva = fase;
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
      forkJoin({
        catalogo: this.documentosApi.listarCatalogo(),
        documentos: this.documentosApi.listarPorEmpresa(empresaId),
      })
        .pipe(
          finalize(() => {
            this.cargandoLista = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: ({ catalogo, documentos }) => {
            this.catalogo = catalogo;
            this.documentos = documentos;
          },
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  alCargarArchivo(evento: { tipoId: string; archivo: File }): void {
    if (!this.puedeEscribir || !this.empresaSeleccionadaId || this.subiendoTipoId) {
      return;
    }
    const invalido = validarArchivoDocumental(evento.archivo);
    if (invalido) {
      this.errorCarga = invalido;
      this.mensajeError = invalido;
      this.cdr.markForCheck();
      return;
    }
    this.errorCarga = null;
    this.subiendoTipoId = evento.tipoId;
    this.mensajeExito = '';
    const empresaId = this.empresaSeleccionadaId;
    this.suscripciones.add(
      this.documentosApi
        .cargar(empresaId, evento.tipoId, evento.archivo)
        .pipe(
          finalize(() => {
            this.subiendoTipoId = null;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.mensajeExito = 'Documento cargado correctamente.';
            this.cargarLista();
          },
          error: (error: unknown) => {
            this.errorCarga = mensajeErrorHttp(error);
            this.mensajeError = this.errorCarga;
            this.cdr.markForCheck();
          },
        })
    );
  }

  descargar(tipoId: string): void {
    if (!this.empresaSeleccionadaId || this.descargandoTipoId) {
      return;
    }
    const doc = this.documentos.find((d) => d.tipo_id === tipoId);
    if (!doc || doc.estado === 'PENDIENTE') {
      return;
    }
    this.descargandoTipoId = tipoId;
    this.mensajeError = '';
    const nombre = doc.nombre_original?.trim() || `${doc.tipo_codigo}.bin`;
    this.suscripciones.add(
      this.documentosApi
        .descargar(this.empresaSeleccionadaId, tipoId)
        .pipe(
          finalize(() => {
            this.descargandoTipoId = null;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (blob) => dispararDescargaBlob(blob, nombre),
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  marcarRevisado(tipoId: string): void {
    if (!this.puedeEscribir || !this.empresaSeleccionadaId || this.revisandoTipoId) {
      return;
    }
    this.revisandoTipoId = tipoId;
    this.mensajeError = '';
    const empresaId = this.empresaSeleccionadaId;
    this.suscripciones.add(
      this.documentosApi
        .marcarRevisado(empresaId, tipoId)
        .pipe(
          finalize(() => {
            this.revisandoTipoId = null;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (actualizado) => {
            this.documentos = this.documentos.map((d) =>
              d.tipo_id === tipoId ? actualizado : d
            );
            this.mensajeExito = 'Documento marcado como revisado.';
            this.cdr.markForCheck();
          },
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  private mostrarError(error: HttpErrorResponse | unknown): void {
    this.mensajeError = mensajeErrorHttp(error);
    this.cdr.markForCheck();
  }
}
