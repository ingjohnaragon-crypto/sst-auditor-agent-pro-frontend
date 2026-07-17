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
    <main
      class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 selection:bg-indigo-100 sm:px-6"
    >
      <section
        class="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/60 sm:p-10"
        aria-labelledby="titulo-login"
      >
        <header class="mb-9 text-center">
          <div
            class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200"
            aria-hidden="true"
          >
            <svg
              class="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p class="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
            Gestión integral SG-SST
          </p>
          <h1 id="titulo-login" class="text-3xl font-black tracking-tight text-slate-900">
            SST-Audit <span class="text-indigo-600">Pro</span>
          </h1>
          <p class="mt-3 text-sm font-medium text-slate-400">
            Ingresa tus credenciales para continuar
          </p>
        </header>

        <form class="flex flex-col gap-5" [formGroup]="formulario" (ngSubmit)="enviar()">
          <label class="flex flex-col gap-2" for="correo">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Correo electrónico
            </span>
            <input
              id="correo"
              type="email"
              formControlName="correo"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 transition placeholder:text-slate-300 hover:border-slate-300"
              autocomplete="username"
              placeholder="nombre@empresa.com"
            />
          </label>

          <label class="flex flex-col gap-2" for="contrasena">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Contraseña
            </span>
            <input
              id="contrasena"
              type="password"
              formControlName="contrasena"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 transition placeholder:text-slate-300 hover:border-slate-300"
              autocomplete="current-password"
              placeholder="Mínimo 8 caracteres"
            />
          </label>

          <p
            *ngIf="error()"
            class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {{ error() }}
          </p>

          <button
            type="submit"
            class="mt-1 flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="formulario.invalid || enviando()"
          >
            {{ enviando() ? 'Ingresando…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Seguridad y Salud en el Trabajo
        </p>
      </section>
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
