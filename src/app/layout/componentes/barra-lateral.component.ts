import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-lateral.component.html',
  styleUrls: ['./barra-lateral.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraLateralComponent {}
