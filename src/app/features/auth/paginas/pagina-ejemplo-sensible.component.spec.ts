import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { PaginaEjemploSensibleComponent } from './pagina-ejemplo-sensible.component';
import { ServicioAutenticacion } from '../../../nucleo/auth/servicio-autenticacion';
import type { UsuarioAutenticado } from '../../../nucleo/auth/modelos/usuario-autenticado';

describe('PaginaEjemploSensibleComponent', () => {
  it('should create', () => {
    const usuario = signal<UsuarioAutenticado | null>(null);
    TestBed.configureTestingModule({
      imports: [PaginaEjemploSensibleComponent],
      providers: [
        {
          provide: ServicioAutenticacion,
          useValue: {
            usuarioActual: usuario.asReadonly(),
            estaAutenticado: () => false,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(PaginaEjemploSensibleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
