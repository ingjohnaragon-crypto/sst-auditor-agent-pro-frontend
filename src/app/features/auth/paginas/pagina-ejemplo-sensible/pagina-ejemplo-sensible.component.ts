import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiTieneRolDirective } from '../../../../shared/directivas/si-tiene-rol.directive';

/** Placeholder de rutas sensibles (médica / siniestralidad). */
@Component({
  selector: 'app-pagina-ejemplo-sensible',
  standalone: true,
  imports: [CommonModule, SiTieneRolDirective],
  templateUrl: './pagina-ejemplo-sensible.component.html',
  styleUrls: ['./pagina-ejemplo-sensible.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaEjemploSensibleComponent {}
