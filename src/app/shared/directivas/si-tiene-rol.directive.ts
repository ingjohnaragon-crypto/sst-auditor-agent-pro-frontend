import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';

import { ServicioAutenticacion } from '../../nucleo/auth/servicio-autenticacion';
import type { RolUsuario } from '../../nucleo/auth/modelos/usuario-autenticado';

/**
 * Directiva estructural: muestra el contenido si el usuario tiene alguno de los roles.
 * Control de UX — la autorización real la impone el backend con `requerir_roles`.
 *
 * Uso: `*appSiTieneRol="['AUDITOR_SST', 'ADMINISTRADOR']"`
 */
@Directive({
  selector: '[appSiTieneRol]',
  standalone: true,
})
export class SiTieneRolDirective {
  private readonly plantilla = inject(TemplateRef<unknown>);
  private readonly contenedor = inject(ViewContainerRef);
  private readonly autenticacion = inject(ServicioAutenticacion);

  private roles: RolUsuario[] = [];
  private vistaCreada = false;

  constructor() {
    effect(() => {
      // Dependencia reactiva del signal de sesión
      this.autenticacion.usuarioActual();
      this.actualizarVista();
    });
  }

  @Input({ required: true })
  set appSiTieneRol(roles: RolUsuario[] | RolUsuario) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.actualizarVista();
  }

  private actualizarVista(): void {
    const rol = this.autenticacion.usuarioActual()?.rol;
    const permitido = !!rol && this.roles.includes(rol);

    if (permitido && !this.vistaCreada) {
      this.contenedor.createEmbeddedView(this.plantilla);
      this.vistaCreada = true;
    } else if (!permitido && this.vistaCreada) {
      this.contenedor.clear();
      this.vistaCreada = false;
    }
  }
}
