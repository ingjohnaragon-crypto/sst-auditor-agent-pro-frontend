import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoaderInteractivoComponent } from '../../shared/components/loader/loader-interactivo.component';
import { ServicioLoader } from '../../shared/components/loader/servicio-loader';
import { BarraLateralComponent } from '../componentes/barra-lateral/barra-lateral.component';
import { CabeceraComponent } from '../componentes/cabecera/cabecera.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    BarraLateralComponent,
    CabeceraComponent,
    LoaderInteractivoComponent,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly loader = inject(ServicioLoader);

  onCancelarLoader(): void {
    this.loader.notificarCancelacion();
  }
}
