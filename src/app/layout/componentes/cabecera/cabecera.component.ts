import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ServicioAutenticacion } from '../../../nucleo/auth/servicio-autenticacion';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabeceraComponent {
  readonly autenticacion = inject(ServicioAutenticacion);

  readonly nombreRol = computed(() => {
    const rol = this.autenticacion.usuarioActual()?.rol;
    return rol ? rol.replace('_', ' ') : 'Sin rol';
  });

  cerrarSesion(): void {
    this.autenticacion.cerrarSesion();
  }
}
