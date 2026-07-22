import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AlertaComponent,
  BotonComponent,
  CampoFormulario,
  ColumnaTabla,
  FormularioDinamicoComponent,
  ModalComponent,
  PasoEjecucion,
  ServicioLoader,
  ServicioModal,
  TablaComponent,
  TooltipDirective,
} from '@app/shared';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';
import { TarjetaResumenComponent } from '../../componentes/tarjeta-resumen/tarjeta-resumen.component';
import type {
  EstadoActividadHome,
  FilaActividadHome,
} from '../../modelos/fila-actividad-home.model';
import { ServicioResumenHome } from '../../servicios/servicio-resumen-home';

@Component({
  selector: 'app-pagina-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    SiTieneRolDirective,
    TarjetaResumenComponent,
    BotonComponent,
    AlertaComponent,
    TablaComponent,
    FormularioDinamicoComponent,
    TooltipDirective,
  ],
  templateUrl: './pagina-dashboard.component.html',
  styleUrls: ['./pagina-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDashboardComponent implements OnInit, OnDestroy {
  readonly autenticacion = inject(ServicioAutenticacion);
  private readonly resumenHome = inject(ServicioResumenHome);
  private readonly loader = inject(ServicioLoader);
  private readonly modal = inject(ServicioModal);
  private readonly cdr = inject(ChangeDetectorRef);

  actividad: FilaActividadHome[] = [];
  actividadCargando = false;
  alertaExitoVisible = false;
  mensajeAlerta = '';
  mensajeAccionRapida = '';
  mensajeFormularioDemo = '';
  mensajeLoaderDemo = '';
  mensajeAutoevaluacion = '';

  private timers: ReturnType<typeof setTimeout>[] = [];
  private suscripcionCancelar: Subscription | null = null;

  readonly columnasActividad: ColumnaTabla<FilaActividadHome>[] = [
    { clave: 'fecha', encabezado: 'Fecha', ordenable: true },
    { clave: 'evento', encabezado: 'Evento' },
    {
      clave: 'estado',
      encabezado: 'Estado',
      plantilla: (fila) => this.etiquetaEstado(fila.estado),
    },
  ];

  readonly trackActividad = (item: FilaActividadHome): string => item.id;

  readonly camposDemo: CampoFormulario[] = [
    {
      nombre: 'correo',
      tipo: 'texto',
      etiqueta: 'Correo de contacto',
      requerido: true,
      placeholder: 'nombre@empresa.com',
      validadores: [Validators.email],
    },
    {
      nombre: 'rol',
      tipo: 'selector',
      etiqueta: 'Rol preferido',
      requerido: true,
      opciones: [
        { valor: 'AUDITOR_SST', etiqueta: 'Auditor SST' },
        { valor: 'CONSULTA', etiqueta: 'Consulta' },
      ],
    },
    {
      nombre: 'recibirAvisos',
      tipo: 'checkbox',
      etiqueta: 'Recibir avisos del sistema',
    },
  ];

  ngOnInit(): void {
    this.actividad = this.resumenHome.obtenerActividad();
  }

  ngOnDestroy(): void {
    this.limpiarTimers();
    this.suscripcionCancelar?.unsubscribe();
  }

  abrirComoEmpezar(): void {
    this.modal.abrir(ModalComponent, {
      data: {
        titulo: '¿Cómo empezar?',
        cerrable: true,
        mensaje:
          'Usa Inicio para revisar tu resumen SG-SST. El diagnóstico Resolución 0312 y los planes de mejora se habilitarán en próximos entregables. Mientras tanto puedes explorar el área de auditoría si tu rol lo permite.',
      },
    });
  }

  actualizarResumen(): void {
    this.limpiarTimers();
    this.suscripcionCancelar?.unsubscribe();
    this.alertaExitoVisible = false;
    this.actividadCargando = true;
    this.cdr.markForCheck();

    const pasos: PasoEjecucion[] = [
      { id: 'sincronizar', etiqueta: 'Sincronizar sesión', estado: 'activo' },
      { id: 'recopilar', etiqueta: 'Recopilar actividad', estado: 'pendiente' },
      { id: 'actualizar', etiqueta: 'Actualizar resumen', estado: 'pendiente' },
    ];

    this.loader.mostrar({
      titulo: 'Actualizando resumen…',
      mensaje: 'Preparando la vista de inicio.',
      cancelable: true,
      progreso: 0,
      pasos,
    });

    this.suscripcionCancelar = this.loader.alCancelar$.subscribe(() => {
      this.limpiarTimers();
      this.actividadCargando = false;
      this.cdr.markForCheck();
    });

    const secuencia: Array<{
      delay: number;
      id: string;
      estado: PasoEjecucion['estado'];
      progreso: number;
      activarSiguiente?: string;
    }> = [
      {
        delay: 400,
        id: 'sincronizar',
        estado: 'completado',
        progreso: 35,
        activarSiguiente: 'recopilar',
      },
      {
        delay: 800,
        id: 'recopilar',
        estado: 'completado',
        progreso: 70,
        activarSiguiente: 'actualizar',
      },
      { delay: 1200, id: 'actualizar', estado: 'completado', progreso: 100 },
    ];

    for (const paso of secuencia) {
      this.timers.push(
        setTimeout(() => {
          this.loader.actualizarPaso(paso.id, paso.estado);
          if (paso.activarSiguiente) {
            this.loader.actualizarPaso(paso.activarSiguiente, 'activo');
          }
          this.loader.actualizar({ progreso: paso.progreso });
        }, paso.delay)
      );
    }

    this.timers.push(
      setTimeout(() => {
        this.actividad = this.resumenHome.refrescarActividad();
        this.loader.ocultar();
        this.actividadCargando = false;
        this.alertaExitoVisible = true;
        this.mensajeAlerta = 'Resumen de inicio actualizado correctamente.';
        this.cdr.markForCheck();
        this.suscripcionCancelar?.unsubscribe();
        this.suscripcionCancelar = null;
      }, 1600)
    );
  }

  mostrarNuevaAutoevaluacion(): void {
    this.mensajeAutoevaluacion =
      'La autoevaluación estará disponible cuando se habilite el módulo de diagnóstico.';
    this.cdr.markForCheck();
  }

  mostrarAccionRapida(): void {
    this.mensajeAccionRapida = 'Las acciones rápidas estarán disponibles próximamente.';
    this.cdr.markForCheck();
  }

  alEnviarDemo(valores: Record<string, unknown>): void {
    this.mensajeFormularioDemo = `Formulario demo enviado: ${JSON.stringify(valores)}`;
    this.cdr.markForCheck();
  }

  simularEjecucion(): void {
    this.limpiarTimers();
    this.suscripcionCancelar?.unsubscribe();
    this.mensajeLoaderDemo = '';

    const pasos: PasoEjecucion[] = [
      { id: 'validar', etiqueta: 'Validar entrada', estado: 'activo' },
      { id: 'analizar', etiqueta: 'Analizar evidencias', estado: 'pendiente' },
      { id: 'calcular', etiqueta: 'Calcular puntaje', estado: 'pendiente' },
    ];

    this.loader.mostrar({
      titulo: 'Simulación QA…',
      mensaje: 'Herramienta de componentes (SP-241).',
      cancelable: true,
      progreso: 0,
      pasos,
    });

    this.suscripcionCancelar = this.loader.alCancelar$.subscribe(() => {
      this.limpiarTimers();
      this.mensajeLoaderDemo = 'Ejecución simulada cancelada.';
      this.cdr.markForCheck();
    });

    this.timers.push(
      setTimeout(() => {
        this.loader.actualizarPaso('validar', 'completado');
        this.loader.actualizarPaso('analizar', 'activo');
        this.loader.actualizar({ progreso: 40 });
      }, 400)
    );
    this.timers.push(
      setTimeout(() => {
        this.loader.actualizarPaso('analizar', 'completado');
        this.loader.actualizarPaso('calcular', 'activo');
        this.loader.actualizar({ progreso: 80 });
      }, 800)
    );
    this.timers.push(
      setTimeout(() => {
        this.loader.actualizarPaso('calcular', 'completado');
        this.loader.actualizar({ progreso: 100 });
        this.loader.ocultar();
        this.mensajeLoaderDemo = 'Ejecución simulada completada.';
        this.cdr.markForCheck();
        this.suscripcionCancelar?.unsubscribe();
        this.suscripcionCancelar = null;
      }, 1200)
    );
  }

  cerrarAlertaExito(): void {
    this.alertaExitoVisible = false;
  }

  private etiquetaEstado(estado: EstadoActividadHome): string {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_curso':
        return 'En curso';
      default:
        return 'Pendiente';
    }
  }

  private limpiarTimers(): void {
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this.timers = [];
  }
}
