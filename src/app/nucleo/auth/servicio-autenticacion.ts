import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { AlmacenTokens } from './almacen-tokens';
import type { CredencialesLogin } from './modelos/credenciales-login';
import type { RespuestaTokenAcceso } from './modelos/respuesta-token-acceso';
import type { RespuestaTokens } from './modelos/respuesta-tokens';
import type { UsuarioAutenticado } from './modelos/usuario-autenticado';

@Injectable({ providedIn: 'root' })
export class ServicioAutenticacion {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly almacen = inject(AlmacenTokens);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly usuario = signal<UsuarioAutenticado | null>(null);
  readonly usuarioActual = this.usuario.asReadonly();

  private refreshEnCurso$: Observable<string> | null = null;
  private hidratacionEnCurso$: Observable<UsuarioAutenticado | null> | null = null;

  constructor() {
    if (this.almacen.obtenerTokenAcceso()) {
      // Al recargar (F5) hay token pero aún no hay perfil: hidratamos una sola vez
      // y compartimos el resultado para que el guard pueda esperarlo.
      this.hidratacionEnCurso$ = this.obtenerYo().pipe(
        map((usuario): UsuarioAutenticado | null => usuario),
        catchError(() => {
          this.limpiarSesionLocal();
          return of(null);
        }),
        finalize(() => {
          this.hidratacionEnCurso$ = null;
        }),
        shareReplay(1),
      );
      this.hidratacionEnCurso$.subscribe();
    }
  }

  /**
   * Emite el usuario autenticado una vez terminada la hidratación de sesión,
   * o `null` si no hay sesión válida. Si no hay hidratación en curso, emite
   * el estado actual de inmediato.
   */
  esperarHidratacion(): Observable<UsuarioAutenticado | null> {
    return this.hidratacionEnCurso$ ?? of(this.usuario());
  }

  estaAutenticado(): boolean {
    return this.almacen.obtenerTokenAcceso() !== null;
  }

  iniciarSesion(credenciales: CredencialesLogin): Observable<UsuarioAutenticado> {
    return this.http.post<RespuestaTokens>(`${this.baseUrl}/auth/login`, credenciales).pipe(
      tap((tokens) => {
        this.almacen.guardarPar(tokens.token_acceso, tokens.token_refresco);
      }),
      switchMap(() => this.obtenerYo()),
    );
  }

  refrescarToken(): Observable<string> {
    if (this.refreshEnCurso$) {
      return this.refreshEnCurso$;
    }

    const tokenRefresco = this.almacen.obtenerTokenRefresco();
    if (!tokenRefresco) {
      return throwError(() => new Error('No hay token de refresco'));
    }

    this.refreshEnCurso$ = this.http
      .post<RespuestaTokenAcceso>(`${this.baseUrl}/auth/refresh`, {
        token_refresco: tokenRefresco,
      })
      .pipe(
        tap((respuesta) => this.almacen.actualizarTokenAcceso(respuesta.token_acceso)),
        map((respuesta) => respuesta.token_acceso),
        finalize(() => {
          this.refreshEnCurso$ = null;
        }),
        shareReplay(1),
      );

    return this.refreshEnCurso$;
  }

  obtenerYo(): Observable<UsuarioAutenticado> {
    return this.http.get<UsuarioAutenticado>(`${this.baseUrl}/auth/yo`).pipe(
      tap((usuario) => this.usuario.set(usuario)),
    );
  }

  cerrarSesion(): void {
    this.limpiarSesionLocal();
    void this.router.navigateByUrl('/login');
  }

  private limpiarSesionLocal(): void {
    this.almacen.limpiar();
    this.usuario.set(null);
    this.refreshEnCurso$ = null;
  }
}
