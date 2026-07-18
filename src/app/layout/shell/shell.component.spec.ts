import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ServicioAutenticacion } from '../../nucleo/auth/servicio-autenticacion';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: ServicioAutenticacion,
          useValue: {
            usuarioActual: signal(null).asReadonly(),
            cerrarSesion: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
  });

  it('should renderizar la barra, cabecera y salida de rutas', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-barra-lateral')).toBeTruthy();
    expect(element.querySelector('app-cabecera')).toBeTruthy();
    expect(element.querySelector('router-outlet')).toBeTruthy();
  });
});
