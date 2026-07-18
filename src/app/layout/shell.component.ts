import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BarraLateralComponent } from './componentes/barra-lateral.component';
import { CabeceraComponent } from './componentes/cabecera.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BarraLateralComponent, CabeceraComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
