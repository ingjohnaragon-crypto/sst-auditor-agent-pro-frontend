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
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="p-6">
      <h1 class="text-2xl mb-4">sst-auditor-agent-pro-frontend</h1>
      <ng-container *ngIf="vista$ | async as vista">
        <p *ngIf="vista.estado === 'cargando'">Cargando ping...</p>
        <p class="ping-resultado" *ngIf="vista.estado === 'ok'">{{ vista.ping.mensaje }}</p>
        <p class="ping-error text-red-600" *ngIf="vista.estado === 'error'" role="alert">
          {{ vista.error }}
        </p>
      </ng-container>
    </main>
  `,
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
