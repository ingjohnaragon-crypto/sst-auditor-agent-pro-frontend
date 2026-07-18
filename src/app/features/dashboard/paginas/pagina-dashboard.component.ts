import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ServicioAutenticacion } from '../../../nucleo/auth/servicio-autenticacion';
import { SiTieneRolDirective } from '../../../shared/directivas/si-tiene-rol.directive';
import { TarjetaResumenComponent } from '../componentes/tarjeta-resumen.component';

@Component({
  selector: 'app-pagina-dashboard',
  standalone: true,
  imports: [RouterLink, SiTieneRolDirective, TarjetaResumenComponent],
  templateUrl: './pagina-dashboard.component.html',
  styleUrls: ['./pagina-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaDashboardComponent {
  readonly autenticacion = inject(ServicioAutenticacion);
}
