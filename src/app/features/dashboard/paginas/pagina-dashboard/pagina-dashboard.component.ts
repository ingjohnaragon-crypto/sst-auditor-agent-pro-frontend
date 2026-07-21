import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  BotonComponent,
  CampoFormulario,
  FormularioDinamicoComponent,
  PasoEjecucion,
  ServicioLoader,
} from '@app/shared';

import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';
import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';
import { TarjetaResumenComponent } from '../../componentes/tarjeta-resumen/tarjeta-resumen.component';

@Component({
  selector: 'app-pagina-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    SiTieneRolDirective,
    TarjetaResumenComponent,
    BotonComponent,
    FormularioDinamicoComponent,
  ],
  templateUrl: './pagina-dashboard.component.html',
  styleUrls: ['./pagina-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDashboardComponent implements OnDestroy {
  readonly autenticacion = inject(ServicioAutenticacion);
  private readonly loader = inject(ServicioLoader);
  private readonly cdr = inject(ChangeDetectorRef);

  mensajeAccionRapida = '';
  mensajeFormularioDemo = '';
  mensajeLoaderDemo = '';

  private timers: ReturnType<typeof setTimeout>[] = [];
  private suscripcionCancelar: Subscription | null = null;

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

  ngOnDestroy(): void {
    this.limpiarTimers();
    this.suscripcionCancelar?.unsubscribe();
  }

  mostrarAccionRapida(): void {
    this.mensajeAccionRapida = 'Las acciones rápidas estarán disponibles próximamente.';
  }

  alEnviarDemo(valores: Record<string, unknown>): void {
    this.mensajeFormularioDemo = `Formulario demo enviado: ${JSON.stringify(valores)}`;
  }

  simularEjecucion(): void {
    this.limpiarTimers();
    this.suscripcionCancelar?.unsubscribe();
    this.mensajeLoaderDemo = '';

    const pasos: PasoEjecucion[] = [
      { id: 'validar', etiqueta: 'Validar entrada', estado: 'activo' },
      { id: 'analizar', etiqueta: 'Analizar evidencias', estado: 'pendiente' },
      { id: 'calcular', etiqueta: 'Calcular puntaje', estado: 'pendiente' },
      { id: 'informe', etiqueta: 'Generar informe', estado: 'pendiente' },
    ];

    this.loader.mostrar({
      titulo: 'Ejecutando diagnóstico…',
      mensaje: 'Simulación de ejecución del sistema (SP-241).',
      cancelable: true,
      progreso: 0,
      pasos,
    });

    this.suscripcionCancelar = this.loader.alCancelar$.subscribe(() => {
      this.limpiarTimers();
      this.mensajeLoaderDemo = 'Ejecución simulada cancelada.';
      this.cdr.markForCheck();
    });

    const secuencia: Array<{
      delay: number;
      id: string;
      estado: PasoEjecucion['estado'];
      progreso: number;
      activarSiguiente?: string;
    }> = [
      { delay: 500, id: 'validar', estado: 'completado', progreso: 25, activarSiguiente: 'analizar' },
      { delay: 1000, id: 'analizar', estado: 'completado', progreso: 50, activarSiguiente: 'calcular' },
      { delay: 1500, id: 'calcular', estado: 'completado', progreso: 75, activarSiguiente: 'informe' },
      { delay: 2000, id: 'informe', estado: 'completado', progreso: 100 },
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
        this.loader.ocultar();
        this.mensajeLoaderDemo = 'Ejecución simulada completada.';
        this.cdr.markForCheck();
        this.suscripcionCancelar?.unsubscribe();
        this.suscripcionCancelar = null;
      }, 2500)
    );
  }

  private limpiarTimers(): void {
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this.timers = [];
  }
}
