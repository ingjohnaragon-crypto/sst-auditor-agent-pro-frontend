import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioAutenticacion } from '../../../nucleo/auth/servicio-autenticacion';
import type { UsuarioAutenticado } from '../../../nucleo/auth/modelos/usuario-autenticado';
import { CabeceraComponent } from './cabecera.component';

describe('CabeceraComponent', () => {
  let fixture: ComponentFixture<CabeceraComponent>;
  const usuario = signal<UsuarioAutenticado | null>({
    id: 'usuario-1',
    nombre_completo: 'Ana Auditora',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  });
  const autenticacion = {
    usuarioActual: usuario.asReadonly(),
    cerrarSesion: jest.fn(),
  };

  beforeEach(async () => {
    autenticacion.cerrarSesion.mockClear();
    await TestBed.configureTestingModule({
      imports: [CabeceraComponent],
      providers: [{ provide: ServicioAutenticacion, useValue: autenticacion }],
    }).compileComponents();

    fixture = TestBed.createComponent(CabeceraComponent);
    fixture.detectChanges();
  });

  it('should mostrar usuario y rol de la sesion', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;

    expect(texto).toContain('Ana Auditora');
    expect(texto).toContain('AUDITOR SST');
  });

  it('should cerrar la sesion al pulsar el boton', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Cerrar sesión"]'
    ) as HTMLButtonElement;

    boton.click();

    expect(autenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
  });
});
