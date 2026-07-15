import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioSalud } from './nucleo/servicios/servicio-salud';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <main class="p-6">
      <h1 class="text-2xl mb-4">sst-auditor-agent-pro-frontend</h1>
      <ng-container *ngIf="(ping$ | async) as ping; else cargando">
        <p class="ping-resultado">{{ ping.mensaje }}</p>
      </ng-container>
      <ng-template #cargando>
        <p>Cargando ping...</p>
      </ng-template>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit {
  ping$!: Observable<{ mensaje: string }>;

  constructor(private servicioSalud: ServicioSalud) {}

  ngOnInit(): void {
    this.ping$ = this.servicioSalud.obtenerPing();
  }
}
