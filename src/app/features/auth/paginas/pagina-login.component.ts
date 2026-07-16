import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ServicioAutenticacion } from '../../../nucleo/auth/servicio-autenticacion';
import { resolverUrlRetorno } from '../../../nucleo/auth/resolver-url-retorno';

@Component({
  selector: 'app-pagina-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="p-6 max-w-md mx-auto">
      <h1 class="text-2xl mb-4">Iniciar sesión</h1>
      <form class="flex flex-col gap-3" [formGroup]="formulario" (ngSubmit)="enviar()">
        <label class="flex flex-col gap-1">
          <span>Correo</span>
          <input type="email" formControlName="correo" class="border p-2" autocomplete="username" />
        </label>
        <label class="flex flex-col gap-1">
          <span>Contraseña</span>
          <input
            type="password"
            formControlName="contrasena"
            class="border p-2"
            autocomplete="current-password"
          />
        </label>
        <p *ngIf="error()" class="text-red-600" role="alert">{{ error() }}</p>
        <button
          type="submit"
          class="bg-slate-800 text-white p-2"
          [disabled]="formulario.invalid || enviando()"
        >
          Entrar
        </button>
      </form>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaLoginComponent {
  private readonly autenticacion = inject(ServicioAutenticacion);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
  });

  enviar(): void {
    if (this.formulario.invalid) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);

    this.autenticacion.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.ruta.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(resolverUrlRetorno(returnUrl));
      },
      error: () => {
        this.error.set('No se pudo iniciar sesión. Verifica tus credenciales.');
        this.enviando.set(false);
      },
    });
  }
}
