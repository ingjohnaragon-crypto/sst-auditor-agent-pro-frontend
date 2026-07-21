import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs/operators';

import {
  LoaderInteractivoComponent,
  ServicioLoader,
} from '@app/shared';
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

  /** Solo el host global monta loaders bloqueantes; inline vive en la feature. */
  readonly estadoBloqueante$ = this.loader.estado$.pipe(
    map((cfg) => (cfg && cfg.modo === 'bloqueante' ? cfg : null))
  );

  onCancelarLoader(): void {
    this.loader.notificarCancelacion();
  }
}
