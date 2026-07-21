import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  BotonComponent,
  CampoFormulario,
  FormularioDinamicoComponent,
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
export class PaginaDashboardComponent {
  readonly autenticacion = inject(ServicioAutenticacion);
  mensajeAccionRapida = '';
  mensajeFormularioDemo = '';

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

  mostrarAccionRapida(): void {
    this.mensajeAccionRapida = 'Las acciones rápidas estarán disponibles próximamente.';
  }

  alEnviarDemo(valores: Record<string, unknown>): void {
    this.mensajeFormularioDemo = `Formulario demo enviado: ${JSON.stringify(valores)}`;
  }
}
