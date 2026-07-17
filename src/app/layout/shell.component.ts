import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BarraLateralComponent } from './componentes/barra-lateral.component';
import { CabeceraComponent } from './componentes/cabecera.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BarraLateralComponent, CabeceraComponent],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100">
      <app-barra-lateral />
      <main class="min-h-screen pl-20 transition-all md:pl-64">
        <div class="mx-auto max-w-7xl p-5 sm:p-7 md:p-12">
          <app-cabecera />
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
