import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiTieneRolDirective } from '../../../shared/directivas/si-tiene-rol.directive';

/** Placeholder de rutas sensibles (médica / siniestralidad). */
@Component({
  selector: 'app-pagina-ejemplo-sensible',
  standalone: true,
  imports: [CommonModule, SiTieneRolDirective],
  template: `
    <main class="p-6">
      <h1 class="text-2xl mb-2">Área sensible (ejemplo)</h1>
      <p>Ruta restringida a ADMINISTRADOR y AUDITOR_SST.</p>
      <p *appSiTieneRol="['ADMINISTRADOR']" class="mt-2 text-sm">
        Visible solo para ADMINISTRADOR.
      </p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaEjemploSensibleComponent {}
