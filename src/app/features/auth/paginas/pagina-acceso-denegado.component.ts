import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagina-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="p-6">
      <h1 class="text-2xl mb-2">Acceso denegado</h1>
      <p class="mb-4">No tienes permisos para ver esta página (403).</p>
      <a routerLink="/" class="underline">Volver al inicio</a>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaAccesoDenegadoComponent {}
