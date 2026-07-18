import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ServicioSalud, PingRespuesta } from './nucleo/servicios/servicio-salud';

export type VistaPing =
  | { estado: 'cargando'; ping: null; error: null }
  | { estado: 'ok'; ping: PingRespuesta; error: null }
  | { estado: 'error'; ping: null; error: string };

@Component({
  selector: 'app-pagina-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit {
  vista$!: Observable<VistaPing>;

  constructor(private servicioSalud: ServicioSalud) {}

  ngOnInit(): void {
    this.vista$ = this.servicioSalud.obtenerPing().pipe(
      map(
        (ping): VistaPing => ({
          estado: 'ok',
          ping,
          error: null,
        })
      ),
      catchError(() =>
        of<VistaPing>({
          estado: 'error',
          ping: null,
          error: 'No se pudo obtener el ping. Verifica que el backend esté disponible.',
        })
      ),
      startWith<VistaPing>({ estado: 'cargando', ping: null, error: null })
    );
  }
}
