import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagina-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pagina-acceso-denegado.component.html',
  styleUrls: ['./pagina-acceso-denegado.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaAccesoDenegadoComponent {}
