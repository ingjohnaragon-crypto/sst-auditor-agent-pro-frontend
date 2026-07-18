import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { resolverUrlRetorno } from '../../../../nucleo/auth/resolver-url-retorno';
import { ServicioAutenticacion } from '../../../../nucleo/auth/servicio-autenticacion';

@Component({
  selector: 'app-pagina-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagina-login.component.html',
  styleUrls: ['./pagina-login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaLoginComponent implements OnInit {
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

  ngOnInit(): void {
    if (!this.autenticacion.estaAutenticado()) {
      return;
    }
    // Con sesión válida no tiene sentido mostrar el login: redirigimos al destino.
    this.autenticacion.esperarHidratacion().subscribe((usuario) => {
      if (usuario !== null) {
        void this.router.navigateByUrl(this.urlDestino());
      }
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);

    this.autenticacion
      .iniciarSesion(this.formulario.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.urlDestino());
        },
        error: () => {
          this.error.set('No se pudo iniciar sesión. Verifica tus credenciales.');
        },
      });
  }

  private urlDestino(): string {
    return resolverUrlRetorno(this.ruta.snapshot.queryParamMap.get('returnUrl'));
  }
}
