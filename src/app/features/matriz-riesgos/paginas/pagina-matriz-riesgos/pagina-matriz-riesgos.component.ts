import { NgClass, NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable, Subscription, finalize } from "rxjs";

import { AlertaComponent, BotonComponent, ServicioLoader, ServicioModal } from "@app/shared";

import { ROLES_ESCRITURA_SST } from "../../../../nucleo/auth/constantes-roles";
import { ServicioAutenticacion } from "../../../../nucleo/auth/servicio-autenticacion";
import {
  DatosConfirmacion,
  DialogoConfirmacionComponent,
} from "../../componentes/dialogo-confirmacion/dialogo-confirmacion.component";
import {
  DatosFormularioMatriz,
  DialogoFormularioMatrizComponent,
  ResultadoFormularioMatriz,
} from "../../componentes/dialogo-formulario-matriz/dialogo-formulario-matriz.component";
import type {
  ControlRiesgo,
  EmpresaMatriz,
  EvaluacionRiesgo,
  Peligro,
  PeligroMatriz,
  ProcesoActividad,
  RespuestaErrorApi,
  RespuestaMatrizRiesgos,
  SolicitudControl,
  SolicitudEvaluacion,
  SolicitudPeligro,
  SolicitudProcesoActividad,
} from "../../modelos";
import { ServicioEmpresasMatriz } from "../../servicios/servicio-empresas-matriz";
import { ServicioMatrizRiesgos } from "../../servicios/servicio-matriz-riesgos";

@Component({
  selector: "app-pagina-matriz-riesgos",
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule, AlertaComponent, BotonComponent],
  templateUrl: "./pagina-matriz-riesgos.component.html",
  styleUrls: ["./pagina-matriz-riesgos.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaMatrizRiesgosComponent implements OnInit, OnDestroy {
  readonly autenticacion = inject(ServicioAutenticacion);
  private readonly empresasApi = inject(ServicioEmpresasMatriz);
  private readonly matrizApi = inject(ServicioMatrizRiesgos);
  private readonly modal = inject(ServicioModal);
  private readonly loader = inject(ServicioLoader);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly suscripciones = new Subscription();
  private secuenciaCargaMatriz = 0;

  empresas: EmpresaMatriz[] = [];
  empresaSeleccionadaId = "";
  matriz: RespuestaMatrizRiesgos | null = null;
  cargandoEmpresas = false;
  cargandoMatriz = false;
  mensajeError = "";
  mensajeExito = "";

  readonly trackEmpresa = (_indice: number, empresa: EmpresaMatriz): string => empresa.id;
  readonly trackProceso = (_indice: number, nodo: { proceso: ProcesoActividad }): string =>
    nodo.proceso.id;
  readonly trackPeligro = (_indice: number, nodo: PeligroMatriz): string => nodo.peligro.id;
  readonly trackControl = (_indice: number, control: ControlRiesgo): string => control.id;

  get puedeEscribir(): boolean {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return !!rol && ROLES_ESCRITURA_SST.includes(rol);
  }

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
    this.loader.ocultar();
  }

  cargarEmpresas(): void {
    this.cargandoEmpresas = true;
    this.mensajeError = "";
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
              this.cargarMatriz();
            }
          },
          error: (error: HttpErrorResponse) => this.mostrarError(error),
        })
    );
  }

  seleccionarEmpresa(): void {
    this.secuenciaCargaMatriz += 1;
    this.matriz = null;
    this.mensajeError = "";
    this.mensajeExito = "";
    if (this.empresaSeleccionadaId) {
      this.cargarMatriz();
    } else {
      this.cargandoMatriz = false;
      this.loader.ocultar();
    }
  }

  cargarMatriz(): void {
    if (!this.empresaSeleccionadaId) {
      return;
    }
    const empresaId = this.empresaSeleccionadaId;
    const secuencia = ++this.secuenciaCargaMatriz;
    this.cargandoMatriz = true;
    this.mensajeError = "";
    this.loader.mostrar({
      titulo: "Cargando matriz GTC 45",
      mensaje: "Consultando procesos, peligros, evaluaciones y controles.",
      cancelable: false,
      progreso: null,
      pasos: [{ id: "matriz", etiqueta: "Cargar matriz de riesgos", estado: "activo" }],
    });
    this.suscripciones.add(
      this.matrizApi
        .obtenerMatriz(empresaId)
        .pipe(
          finalize(() => {
            if (secuencia !== this.secuenciaCargaMatriz) {
              return;
            }
            this.cargandoMatriz = false;
            this.loader.ocultar();
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (matriz) => {
            if (secuencia !== this.secuenciaCargaMatriz) {
              return;
            }
            this.matriz = matriz;
            this.loader.actualizarPaso("matriz", "completado");
          },
          error: (error: HttpErrorResponse) => {
            if (secuencia === this.secuenciaCargaMatriz) {
              this.mostrarError(error);
            }
          },
        })
    );
  }

  abrirCrearProceso(): void {
    if (!this.puedeEscribir || !this.empresaSeleccionadaId) {
      return;
    }
    this.abrirFormulario(
      { tipo: "proceso", titulo: "Agregar proceso o actividad" },
      (resultado) =>
        this.matrizApi.crearProceso(
          this.empresaSeleccionadaId,
          resultado as SolicitudProcesoActividad
        ),
      "Proceso creado correctamente."
    );
  }

  abrirEditarProceso(proceso: ProcesoActividad): void {
    this.abrirFormulario(
      {
        tipo: "proceso",
        titulo: "Editar proceso o actividad",
        valores: { ...proceso },
      },
      (resultado) =>
        this.matrizApi.actualizarProceso(proceso.id, resultado as SolicitudProcesoActividad),
      "Proceso actualizado correctamente."
    );
  }

  confirmarEliminarProceso(proceso: ProcesoActividad): void {
    this.confirmarEliminacion(
      {
        titulo: "Eliminar proceso",
        mensaje: `Se eliminará “${proceso.nombre}” y, por CASCADE, todos sus peligros, evaluaciones y controles.`,
      },
      () => this.matrizApi.eliminarProceso(proceso.id),
      "Proceso y su rama eliminados."
    );
  }

  abrirCrearPeligro(proceso: ProcesoActividad): void {
    this.abrirFormulario(
      { tipo: "peligro", titulo: `Agregar peligro en ${proceso.nombre}` },
      (resultado) => this.matrizApi.crearPeligro(proceso.id, resultado as SolicitudPeligro),
      "Peligro creado correctamente."
    );
  }

  abrirEditarPeligro(peligro: Peligro): void {
    this.abrirFormulario(
      {
        tipo: "peligro",
        titulo: "Editar peligro",
        valores: { ...peligro },
      },
      (resultado) => this.matrizApi.actualizarPeligro(peligro.id, resultado as SolicitudPeligro),
      "Peligro actualizado correctamente."
    );
  }

  confirmarEliminarPeligro(peligro: Peligro): void {
    this.confirmarEliminacion(
      {
        titulo: "Eliminar peligro",
        mensaje: `Se eliminará “${peligro.descripcion}” junto con su evaluación y controles.`,
      },
      () => this.matrizApi.eliminarPeligro(peligro.id),
      "Peligro eliminado correctamente."
    );
  }

  abrirEvaluacion(nodo: PeligroMatriz): void {
    this.abrirFormulario(
      {
        tipo: "evaluacion",
        titulo: nodo.evaluacion ? "Actualizar evaluación" : "Crear evaluación",
        valores: nodo.evaluacion ? { ...nodo.evaluacion } : undefined,
      },
      (resultado) =>
        this.matrizApi.guardarEvaluacion(nodo.peligro.id, resultado as SolicitudEvaluacion),
      "Evaluación guardada; derivados recalculados por el backend."
    );
  }

  abrirCrearControl(nodo: PeligroMatriz): void {
    if (!nodo.evaluacion) {
      this.mensajeError = "Primero debes crear la evaluación del peligro.";
      return;
    }
    const evaluacion = nodo.evaluacion;
    this.abrirFormulario(
      {
        tipo: "control",
        titulo: "Agregar control",
        cantidadControles: nodo.controles.length,
      },
      (resultado) => this.matrizApi.crearControl(evaluacion.id, resultado as SolicitudControl),
      "Control agregado correctamente."
    );
  }

  abrirEditarControl(control: ControlRiesgo, cantidadControles: number): void {
    this.abrirFormulario(
      {
        tipo: "control",
        titulo: "Editar control",
        valores: { ...control },
        cantidadControles: Math.max(0, cantidadControles - 1),
      },
      (resultado) => this.matrizApi.actualizarControl(control.id, resultado as SolicitudControl),
      "Control actualizado correctamente."
    );
  }

  confirmarEliminarControl(control: ControlRiesgo): void {
    this.confirmarEliminacion(
      {
        titulo: "Eliminar control",
        mensaje: `Se eliminará el control “${control.descripcion}”.`,
      },
      () => this.matrizApi.eliminarControl(control.id),
      "Control eliminado correctamente."
    );
  }

  etiquetaClasificacion(valor: string): string {
    return valor.replaceAll("_", " ").toLocaleLowerCase("es");
  }

  etiquetaAceptabilidad(valor: string): string {
    return valor.replaceAll("_", " ");
  }

  claseInterpretacion(evaluacion: EvaluacionRiesgo): string {
    const clases: Record<EvaluacionRiesgo["interpretacion_nr"], string> = {
      I: "border-red-300 bg-red-50 text-red-900",
      II: "border-orange-300 bg-orange-50 text-orange-900",
      III: "border-amber-300 bg-amber-50 text-amber-900",
      IV: "border-emerald-300 bg-emerald-50 text-emerald-900",
    };
    return clases[evaluacion.interpretacion_nr];
  }

  esEppUnico(nodo: PeligroMatriz): boolean {
    return nodo.controles.length === 1 && nodo.controles[0].tipo === "EPP";
  }

  private abrirFormulario(
    datos: DatosFormularioMatriz,
    ejecutar: (resultado: ResultadoFormularioMatriz) => Observable<unknown>,
    mensajeExito: string
  ): void {
    if (!this.puedeEscribir) {
      return;
    }
    const referencia = this.modal.abrir<
      ResultadoFormularioMatriz | undefined,
      DatosFormularioMatriz,
      DialogoFormularioMatrizComponent
    >(DialogoFormularioMatrizComponent, { data: datos });
    this.suscripciones.add(
      referencia.closed.subscribe((resultado) => {
        if (resultado) {
          this.ejecutarMutacion(ejecutar(resultado), mensajeExito);
        }
      })
    );
  }

  private confirmarEliminacion(
    datos: DatosConfirmacion,
    eliminar: () => Observable<void>,
    mensajeExito: string
  ): void {
    if (!this.puedeEscribir) {
      return;
    }
    const referencia = this.modal.abrir<boolean, DatosConfirmacion, DialogoConfirmacionComponent>(
      DialogoConfirmacionComponent,
      { data: datos }
    );
    this.suscripciones.add(
      referencia.closed.subscribe((confirmado) => {
        if (confirmado) {
          this.ejecutarMutacion(eliminar(), mensajeExito);
        }
      })
    );
  }

  private ejecutarMutacion(operacion: Observable<unknown>, mensajeExito: string): void {
    this.mensajeError = "";
    this.mensajeExito = "";
    this.suscripciones.add(
      operacion.subscribe({
        next: () => {
          this.mensajeExito = mensajeExito;
          this.cargarMatriz();
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      })
    );
  }

  private mostrarError(error: HttpErrorResponse): void {
    const respuesta = error.error as Partial<RespuestaErrorApi> | null;
    this.mensajeError =
      respuesta?.mensaje ??
      (error.status === 0
        ? "No fue posible conectar con el backend."
        : "No fue posible completar la operación.");
    this.cdr.markForCheck();
  }
}
