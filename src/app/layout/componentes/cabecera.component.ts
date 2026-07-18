import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ServicioAutenticacion } from '../../nucleo/auth/servicio-autenticacion';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabeceraComponent {
  readonly autenticacion = inject(ServicioAutenticacion);

  get nombreRol(): string {
    const rol = this.autenticacion.usuarioActual()?.rol;
    if (!rol) {
      return 'Sin rol';
    }
    return rol.replace('_', ' ');
  }

  cerrarSesion(): void {
    this.autenticacion.cerrarSesion();
  }
}
